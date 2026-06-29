import { data, Link } from "react-router";
import type { Route } from "./+types/route";
import yaml from "yaml";
import { useState, useEffect } from "react";
import { codeToHtml } from "shiki";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { SectionLabel, Squiggle } from "~/components/terminal";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";

type Config =
  | {
      name: string;
      type: "json";
      body: Record<string, unknown>;
      extension: string;
    }
  | {
      name: string;
      type: "text";
      body: string;
      extension: string;
    }
  | {
      name: string;
      type: "yaml";
      body: string;
      extension: string;
    };

const configs: Config[] = [
  {
    name: "vscode",
    type: "json",
    extension: "json",
    body: {
      "editor.formatOnSave": true,
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
      },
      "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
      },
      "[typescriptreact]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
      },
    },
  },
  {
    name: "wrangler",
    type: "json",
    extension: "jsonc",
    body: {
      $schema: "node_modules/wrangler/config-schema.json",
      name: "portfolio",
      compatibility_date: "2025-04-04",
      main: "./workers/app.ts",
      routes: [
        "nischal-dahal.com.np/*",
        "www.nischal-dahal.com.np/*",
        "nischal-dahal.com.np",
      ],
      preview_urls: true,
      vars: {
        VALUE_FROM_CLOUDFLARE: "Hello from Cloudflare",
      },
      compatibility_flags: ["nodejs_compat", "nodejs_als"],
      observability: {
        logs: {
          enabled: false,
          head_sampling_rate: 1,
          invocation_logs: true,
          persist: true,
        },
      },
    },
  },
  {
    name: "tsconfig",
    type: "json",
    extension: "json",
    body: {
      files: [],
      references: [
        { path: "./tsconfig.node.json" },
        { path: "./tsconfig.cloudflare.json" },
      ],
      compilerOptions: {
        checkJs: true,
        verbatimModuleSyntax: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        paths: {
          "~/*": ["./app/*"],
        },
      },
    },
  },
  {
    name: "package",
    type: "json",
    extension: "json",
    body: {
      name: "portfolio",
      private: true,
      type: "module",
      scripts: {
        build: "react-router build",
        "cf-typegen": "wrangler types",
        deploy: "npm run build && wrangler deploy",
        dev: "react-router dev",
        postinstall: "npm run cf-typegen",
        preview: "npm run build && vite preview",
        typecheck: "npm run cf-typegen && react-router typegen && tsc -b",
      },
    },
  },
  {
    name: "eslint",
    type: "text",
    extension: "ts",
    body: `import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },

  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  configPrettier,
  { files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc" },
  { files: ["**/*.json5"], plugins: { json }, language: "json/json5" },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/commonmark",
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "error",
    },
  },
]);`,
  },
  {
    name: "nvim",
    type: "text",
    extension: "lua",
    body: `-- Neovim configuration
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true
vim.opt.smartindent = true`,
  },
  {
    name: "tmux",
    type: "yaml",
    extension: "yaml",
    body: `# Tmux configuration
set -g default-terminal "screen-256color"
set -g history-limit 10000
set -g mouse on`,
  },
];

export const handle = {
  breadcrumb: () => <Link to="/config">config</Link>,
};

const CONFIG_DESCRIPTION =
  "Editor, formatter, and tooling configs Nischal Dahal (broisnischal) uses — VS Code, Wrangler, tsconfig, ESLint, Neovim, and tmux — to copy or download.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Config",
    description: CONFIG_DESCRIPTION,
    path: "/config",
    keywords: [
      "Nischal Dahal",
      "broisnischal",
      "config",
      "dotfiles",
      "VS Code settings",
      "tsconfig",
      "ESLint",
      "Neovim",
      "tmux",
      "developer setup",
    ],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Config — Nischal Dahal",
      description: CONFIG_DESCRIPTION,
      path: "/config",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Config", path: "/config" },
      ],
      type: "CollectionPage",
    }),
  ];
};

export function headers() {
  return createHeaders();
}

export async function loader() {
  return data({
    configs,
  });
}

function getConfigContent(config: Config): string {
  if (config.type === "json") {
    return JSON.stringify(config.body, null, 2);
  } else if (config.type === "yaml") {
    return yaml.stringify(config.body, { indent: 2 });
  }
  return config.body;
}

function getLanguageFromExtension(extension: string): string {
  const langMap: Record<string, string> = {
    json: "json",
    jsonc: "jsonc",
    ts: "typescript",
    js: "javascript",
    lua: "lua",
    yaml: "yaml",
    yml: "yaml",
  };
  return langMap[extension] || "text";
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: "min-light",
        });
        if (!cancelled) {
          setHighlightedCode(html);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        if (!cancelled) {
          setHighlightedCode(code);
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (isLoading) {
    return (
      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap wrap-break-word">
        {code}
      </pre>
    );
  }

  return (
    <div
      className="[&_pre]:mb-0 [&_pre]:overflow-x-auto [&_pre]:border-none [&_pre]:bg-transparent [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:m-0 [&_pre_code]:p-4 [&_pre_code]:block [&_pre_code]:text-sm"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { configs } = loaderData;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openConfigs, setOpenConfigs] = useState<Set<number>>(new Set());

  const handleCopy = async (config: Config, index: number) => {
    const content = getConfigContent(config);
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (config: Config) => {
    const content = getConfigContent(config);
    const filename = `${config.name}.${config.extension}`;
    download(config.type, content, filename);
  };

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">
        Configuration Files
      </h1>
      <p className="mt-2 text-muted-foreground">
        copy or download development config files
      </p>

      <Squiggle />

      <SectionLabel>Files ({configs.length}):</SectionLabel>

      <div className="mt-4 space-y-0 border-t border-border">
        {configs.map((config, index) => {
          const content = getConfigContent(config);
          const isCopied = copiedIndex === index;
          const isOpen = openConfigs.has(index);

          return (
            <div key={config.name} className="border-b border-border">
              <Collapsible
                open={isOpen}
                onOpenChange={(open) => {
                  const newOpen = new Set(openConfigs);
                  if (open) {
                    newOpen.add(index);
                  } else {
                    newOpen.delete(index);
                  }
                  setOpenConfigs(newOpen);
                }}
              >
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-foreground uppercase tracking-[0.1em]">
                      {config.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground/60 uppercase">
                      .{config.extension}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CollapsibleTrigger className="border border-border px-3 py-1 font-mono text-xs text-muted-foreground uppercase tracking-wide hover:border-foreground hover:text-foreground transition-colors">
                      {isOpen ? "collapse" : "expand"}
                    </CollapsibleTrigger>
                    <button
                      onClick={() => handleCopy(config, index)}
                      className="border border-border px-3 py-1 font-mono text-xs text-muted-foreground uppercase tracking-wide hover:border-term-link hover:text-term-link transition-colors"
                    >
                      {isCopied ? "copied" : "copy"}
                    </button>
                    <button
                      onClick={() => handleDownload(config)}
                      className="border border-border px-3 py-1 font-mono text-xs text-muted-foreground uppercase tracking-wide hover:border-foreground hover:text-foreground transition-colors"
                    >
                      dl
                    </button>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="mb-3 border border-border bg-muted/50 overflow-x-auto">
                    <CodeBlock
                      code={content}
                      language={getLanguageFromExtension(config.extension)}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function download(
  type: "text" | "yaml" | "json",
  content: string,
  filename: string,
) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
