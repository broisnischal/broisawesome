import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "react-router";
import {
  createHeaders,
  createMetaTags,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/route";

type ProjectStory = {
  name: string;
  year: string;
  summary: string;
  motive: string;
  stack: string[];
  links: Array<{ label: string; href: string }>;
};

/**
 * Edit this array to keep your project stories current.
 * Keep each project focused on idea + motive.
 */
const PROJECTS: ProjectStory[] = [
  {
    name: "Timeline",
    year: "2026",
    summary: "A timeline of my life and work.",
    motive: "I wanted a collection of my thoughts, projects, and experiences.",
    stack: ["website"],
    links: [{ label: "Live", href: "https://lexicon.website/" }],
  },
  {
    name: "Personal Portfolio",
    year: "2026",
    summary:
      "A clean personal site for writing, experiments, logs, and work stories.",
    motive:
      "I wanted a home that reflects how I think: practical, system-first, and intentional.",
    stack: ["React Router", "TypeScript", "Cloudflare Workers", "Tailwind"],
    links: [{ label: "Live", href: "https://nischal-dahal.com.np" }],
  },
  {
    name: "Edge Toolkit (CDN / DNS / VPN)",
    year: "2025",
    summary:
      "A set of infra-focused repos to understand edge networking deeply by building.",
    motive:
      "I wanted stronger intuition around performance, routing, and reliability at scale.",
    stack: ["Cloudflare", "DNS", "Networking", "Automation"],
    links: [
      { label: "CDN", href: "https://github.com/broisnischal/cdn" },
      { label: "DNS", href: "https://github.com/broisnischal/dns" },
      { label: "VPN", href: "https://github.com/broisnischal/vpn" },
    ],
  },
  {
    name: "MCP Integrations",
    year: "2025",
    summary:
      "Protocol-based tools to connect agents with real systems and workflows.",
    motive:
      "I wanted AI tooling to be dependable in production, not just impressive in demos.",
    stack: ["MCP", "TypeScript", "APIs", "Tooling"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/broisnischal?tab=repositories&q=mcp",
      },
    ],
  },
  {
    name: "Design Sites Curation",
    year: "2026",
    summary: "A curated list of portfolio websites with minimal presentation.",
    motive:
      "I wanted a personal design benchmark to improve visual taste over time.",
    stack: ["React", "Table UI", "Notion-sourced data"],
    links: [{ label: "Page", href: "/portfolio-curation" }],
  },
];

export const handle = {
  breadcrumb: () => <Link to="/projects">Projects</Link>,
};

export const meta: Route.MetaFunction = () => {
  const tags = createMetaTags({
    title: "Projects",
    description: "Minimal project stories with idea and motive.",
    path: "/projects",
    keywords: [
      "projects",
      "software projects",
      "engineering motive",
      "project ideas",
      "nischal dahal",
    ],
  });
  return [...tags, createSchemaMetaTag(createPersonSchema())];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
  });
}

export default function Page() {
  return (
    <div className="w-full font-sans">
      <header className="mb-8  pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Selected Work
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          Projects
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Minimal notes on what I built, why I started it, and the motive behind
          each one.
        </p>
      </header>

      <ol className="border-border/60">
        {PROJECTS.map((project) => (
          <li
            key={`${project.name}-${project.year}`}
            className="grid gap-4 border-b border-border/40 py-6 last:border-b-0 md:grid-cols-[90px_minmax(0,1fr)]"
          >
            <p className="pt-0.5 font-mono text-xs text-muted-foreground">
              {project.year}
            </p>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {project.name}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  {project.links.map((link) => {
                    const isExternal = /^https?:\/\//.test(link.href);
                    return (
                      <a
                        key={`${project.name}-${link.label}`}
                        href={link.href}
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                        <ArrowUpRightIcon size={11} aria-hidden />
                      </a>
                    );
                  })}
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {project.summary}
              </p>

              <dl className="mt-3 space-y-2 text-sm leading-relaxed">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Motive
                  </dt>
                  <dd className="mt-1 text-foreground/90">{project.motive}</dd>
                </div>
              </dl>

              <p className="mt-3 text-xs text-muted-foreground">
                {project.stack.join(" • ")}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full font-sans">
      <h1 className="text-2xl font-semibold text-foreground">Error</h1>
      <p className="mt-2 text-destructive">{error.message}</p>
    </div>
  );
}
