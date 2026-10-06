import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import routeTypesPlugin from "./vite-plugin-route-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "package.json"), "utf-8"),
) as { version?: string };

function git(cmd: string): string | undefined {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: __dirname }).trim();
  } catch {
    return undefined;
  }
}

const buildCommit =
  process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) ??
  process.env.GITHUB_SHA?.slice(0, 7) ??
  git("git rev-parse --short HEAD") ??
  "unknown";

const buildModified =
  git("git log -1 --format=%cs") ?? new Date().toISOString().slice(0, 10);

const buildVersion = pkg.version ?? "0.0.0";

/** Last few commits with their line stats, for the footer's commit ticker. */
function readBuildLog() {
  const raw = git("git log -8 --shortstat --format=%x1e%h%x1f%s");
  if (!raw) return [];
  return raw
    .split("\x1e")
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const [head, ...rest] = chunk.trim().split("\n");
      const [hash, subject = ""] = head.split("\x1f");
      const stat = rest.join(" ");
      return {
        hash,
        subject,
        add: Number(stat.match(/(\d+) insertion/)?.[1] ?? 0),
        del: Number(stat.match(/(\d+) deletion/)?.[1] ?? 0),
      };
    });
}

const buildLog = readBuildLog();

/**
 * @mdx-js/rollup drops the query before matching ids, so `post.mdx?raw` gets
 * compiled into a component too. Let `?raw` imports through untouched (the
 * post-text route needs the markdown source).
 */
function skipRawImports(
  plugin: ReturnType<typeof mdx>,
): ReturnType<typeof mdx> {
  const transform = plugin.transform as (
    this: unknown,
    code: string,
    id: string,
  ) => unknown;
  return {
    ...plugin,
    transform(this: unknown, code: string, id: string) {
      if (id.includes("?raw")) return null;
      return transform.call(this, code, id);
    },
  } as ReturnType<typeof mdx>;
}

export default defineConfig({
  define: {
    "import.meta.env.VITE_BUILD_VERSION": JSON.stringify(buildVersion),
    "import.meta.env.VITE_BUILD_COMMIT": JSON.stringify(buildCommit),
    "import.meta.env.VITE_BUILD_MODIFIED": JSON.stringify(buildModified),
    "import.meta.env.VITE_BUILD_LOG": JSON.stringify(JSON.stringify(buildLog)),
  },
  plugins: [
    routeTypesPlugin(),
    cloudflare({
      viteEnvironment: { name: "ssr" },
      remoteBindings: true,
      experimental: {},
    }),
    tailwindcss(),
    skipRawImports(
      mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          () =>
            rehypePrettyCode({
              // Shiki theme for fenced code in MDX (build-time via rehype-pretty-code).
              // Warm dark theme to match the near-black canvas + amber accent.
              theme: "vesper",
              keepBackground: false,
              bypassInlineCode: false,
              transformers: [],
            }),
        ],
      }),
    ),
    reactRouter(),
    tsconfigPaths(),
    {
      name: "cloudflare-vite-plugin-fix",
      configEnvironment(name, config) {
        const isDev =
          process.env.npm_lifecycle_script?.endsWith("react-router dev");
        if (name === "ssr" && !isDev) {
          delete config.dev;
        }
      },
    },
  ],
  ssr: {},
  server: {},
  optimizeDeps: {
    exclude: ["rehype-pretty-code", "shiki", "@shikijs/transformers"],
  },
  build: {
    commonjsOptions: {
      exclude: ["rehype-pretty-code", "shiki", "@shikijs/transformers"],
    },
  },
});
