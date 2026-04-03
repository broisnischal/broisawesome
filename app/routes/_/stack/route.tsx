import { ArrowUpRightIcon } from "lucide-react";
import { Link, data } from "react-router";
import { createHeaders, createMetaTags } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/stack">Stack</Link>,
};

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Stack",
    description:
      "Tools and software Nischal Dahal uses daily: hosting, editor, frameworks, UI, quality, design, browser, and assistants.",
    path: "/stack",
    keywords: [
      "Nischal Dahal",
      "broisnischal",
      "developer tools",
      "tech stack",
      "Cursor",
      "Coolify",
      "Cloudflare",
      "React",
      "TypeScript",
    ],
  });
};

export function headers() {
  return createHeaders();
}

type StackTool = {
  name: string;
  description: string;
  link: string;
};

type StackCategory = {
  id: string;
  title: string;
  blurb?: string;
  items: StackTool[];
};

const categories: StackCategory[] = [
  {
    id: "ship",
    title: "Deploy & build",
    blurb: "Where it builds and where it runs.",
    items: [
      {
        name: "Coolify",
        description:
          "Self-hosted PaaS: deploys, env vars, databases on my own metal.",
        link: "https://coolify.io",
      },
      {
        name: "Cloudflare",
        description: "DNS, Workers, and the boring global layer in front.",
        link: "https://www.cloudflare.com",
      },
      {
        name: "Vite",
        description: "Dev server and bundling that stays out of the way.",
        link: "https://vite.dev",
      },
      {
        name: "Wrangler",
        description: "Ship and typecheck Workers without guessing flags.",
        link: "https://developers.cloudflare.com/workers/wrangler",
      },
    ],
  },
  {
    id: "editor",
    title: "Editor",
    blurb: "Where almost all code gets written.",
    items: [
      {
        name: "Cursor",
        description: "IDE with agents, refactors, and repo-wide edits.",
        link: "https://cursor.com",
      },
    ],
  },
  {
    id: "code",
    title: "Languages & frameworks",
    blurb: "Defaults for new web work.",
    items: [
      {
        name: "TypeScript",
        description: "Types at the boundary; fewer surprises in prod.",
        link: "https://www.typescriptlang.org",
      },
      {
        name: "React",
        description: "UI as a function of state.",
        link: "https://react.dev",
      },
      {
        name: "React Router",
        description: "Loaders, actions, and file routes for this site.",
        link: "https://reactrouter.com",
      },
      {
        name: "Bun",
        description: "Fast installs and runtime when the repo allows it.",
        link: "https://bun.sh",
      },
    ],
  },
  {
    id: "ui",
    title: "UI & content",
    blurb: "Styling, primitives, prose.",
    items: [
      {
        name: "Tailwind CSS",
        description: "Layout and tokens aligned with the design system.",
        link: "https://tailwindcss.com",
      },
      {
        name: "Radix UI",
        description: "Accessible primitives without fighting focus.",
        link: "https://www.radix-ui.com",
      },
      {
        name: "MDX",
        description: "Long-form posts next to real components.",
        link: "https://mdxjs.com",
      },
      {
        name: "Shiki",
        description: "Syntax highlighting that matches the editor.",
        link: "https://shiki.style",
      },
    ],
  },
  {
    id: "trust",
    title: "Security & quality",
    blurb: "Secrets, validation, lint.",
    items: [
      {
        name: "1Password",
        description: "Secrets, SSH, and shared vaults.",
        link: "https://1password.com",
      },
      {
        name: "Zod",
        description: "Parse and validate at system edges.",
        link: "https://zod.dev",
      },
      {
        name: "Conform",
        description: "Progressive forms with Zod-shaped errors.",
        link: "https://conform.guide",
      },
      {
        name: "ESLint",
        description: "Lint rules the repo agrees on.",
        link: "https://eslint.org",
      },
      {
        name: "Prettier",
        description: "Formatting so reviews stay about intent.",
        link: "https://prettier.io",
      },
    ],
  },
  {
    id: "design",
    title: "Design",
    blurb: "Before it exists in code.",
    items: [
      {
        name: "Figma",
        description: "Layouts, components, quick what-if passes.",
        link: "https://www.figma.com",
      },
    ],
  },
  {
    id: "browser",
    title: "Browser",
    blurb: "Where the app is actually used.",
    items: [
      {
        name: "Zen Browser",
        description: "Firefox-based, vertical tabs, workspaces.",
        link: "https://zen-browser.app",
      },
    ],
  },
  {
    id: "assistants",
    title: "Assistants",
    blurb: "Drafts, search with sources, models—always read the diff.",
    items: [
      {
        name: "Claude",
        description: "Long explanations and careful rewrites.",
        link: "https://claude.ai",
      },
      {
        name: "ChatGPT",
        description: "Quick drafts and brainstorming.",
        link: "https://chatgpt.com",
      },
      {
        name: "Perplexity",
        description: "When I want links back, not a confident paragraph.",
        link: "https://www.perplexity.ai",
      },
      {
        name: "Hugging Face",
        description: "Open weights, demos, and rabbit holes.",
        link: "https://huggingface.co",
      },
    ],
  },
];

export async function loader({}: Route.LoaderArgs) {
  return data({ categories });
}

function ToolRow({ tool }: { tool: StackTool }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <a
        href={tool.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3 py-3.5 text-left no-underline transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm -mx-1 px-1"
      >
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground group-hover:text-primary">
            {tool.name}
          </span>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground">
            {tool.description}
          </p>
        </div>
        <ArrowUpRightIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-50 group-hover:opacity-80"
          aria-hidden
        />
      </a>
    </li>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { categories: cats } = loaderData;

  return (
    <div className="relative max-w-xl font-sans">
      <header className="mb-10 md:mb-11">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Stack
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-tighter">
          Tools I rely on
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Software I actually use. Desk and longer notes live on{" "}
          <Link
            to="/use"
            className="border-b border-foreground/20 pb-px text-foreground transition-colors hover:border-foreground"
          >
            /use
          </Link>
          .
        </p>
      </header>

      <div className="flex flex-col gap-10 md:gap-11">
        {cats.map((category) => (
          <section
            key={category.id}
            aria-labelledby={`stack-${category.id}-heading`}
          >
            <h2
              id={`stack-${category.id}-heading`}
              className="font-mono text-xs font-normal uppercase tracking-widest text-muted-foreground"
            >
              {category.title}
            </h2>
            {category.blurb ? (
              <p className="mt-2 text-sm text-muted-foreground/90">
                {category.blurb}
              </p>
            ) : null}

            <ul className="mt-4 list-none border-t border-border p-0 m-0">
              {category.items.map((tool) => (
                <ToolRow key={tool.name} tool={tool} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
