import { Github } from "lucide-react";
import { Link } from "react-router";
import { StarButton, StarStateProvider } from "~/components/star-button";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
import { fetchGitHubRepoStars } from "~/.server/github-repos";
import {
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
  createWebSiteSchema,
} from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/">home</Link>,
  hideBreadcrumbs: true,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Nischal Dahal - aka broisnischal",
    description:
      "Nischal Dahal (broisnischal) — AI/ML-based full-stack engineer building serverless systems, products, and modern web experiences. Projects, writing, and links.",
    path: "/",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "AI/ML engineer",
      "full-stack engineer",
      "software developer",
      "portfolio",
      "web development",
      "React",
      "TypeScript",
      "serverless",
      "Nepal",
    ],
  });

  const website = createWebSiteSchema({
    description:
      "Official portfolio of Nischal Dahal: writing, projects, tools, and open-source work.",
  });

  return [...metaTags, createSchemaMetaTag(website)];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const names = [...PROJECTS, ...DOTFILES]
    .map((p) => repoNameFromUrl(p.github))
    .filter((n): n is string => Boolean(n));
  const { stars } = await fetchGitHubRepoStars(env, names);
  return { stars };
}

type LinkItem = {
  label: string;
  href?: string;
  to?: string;
  display?: string;
  strike?: boolean;
  /** GitHub repo URL, rendered as a small icon button beside the link. */
  github?: string;
  /** One-line summary shown muted beneath the link. */
  description?: string;
  /** Live stargazer count (resolved in the loader); badge shows only when > 10. */
  stars?: number;
};

/** `https://github.com/owner/repo` → `{ owner, repo }`. */
function ownerRepoFromUrl(
  url?: string,
): { owner: string; repo: string } | undefined {
  if (!url) return undefined;
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  return m ? { owner: m[1], repo: m[2] } : undefined;
}

function repoNameFromUrl(url?: string): string | undefined {
  return ownerRepoFromUrl(url)?.repo;
}

const PROJECTS: LinkItem[] = [
  {
    label: "battlify",
    href: "https://github.com/broisnischal/battlify",
    display: "github.com/broisnischal/battlify",
    github: "https://github.com/broisnischal/battlify",
    description: "Fixes your Mac battery issues.",
  },
  {
    label: "stroke.click",
    href: "https://stroke.click",
    display: "stroke.click",
    github: "https://github.com/broisnischal/stroke",
    description: "A fast, minimal desktop database client.",
  },
  {
    label: "wasper",
    href: "https://studio.stroke.click",
    display: "studio.stroke.click",
    github: "https://github.com/broisnischal/wasper",
    description: "Host an MCP server + API proxy from any OpenAPI spec.",
  },
  {
    label: "zorail",
    href: "https://github.com/broisnischal/zorail",
    display: "github.com/broisnischal/zorail",
    github: "https://github.com/broisnischal/zorail",
    description: "Self-hosted disposable inboxes for organizations.",
  },
  {
    label: "azure-mcp",
    href: "https://github.com/broisnischal/azure-mcp",
    display: "github.com/broisnischal/azure-mcp",
    github: "https://github.com/broisnischal/azure-mcp",
    description: "Interact with Azure Boards through rich MCP tools.",
  },
  {
    label: "prisma-type-generator",
    href: "https://github.com/broisnischal/prisma-type-generator",
    display: "github.com/broisnischal/prisma-type-generator",
    github: "https://github.com/broisnischal/prisma-type-generator",
    description: "A Prisma type generator.",
  },
  {
    label: "zap",
    href: "https://github.com/broisnischal/zap",
    display: "github.com/broisnischal/zap",
    github: "https://github.com/broisnischal/zap",
    description:
      "A fast, cross-platform universal package manager that auto-detects your system.",
  },
  {
    label: "phobos",
    href: "https://github.com/broisnischal/phobos",
    display: "github.com/broisnischal/phobos",
    github: "https://github.com/broisnischal/phobos",
    description: "The best token is the token never spent.",
  },
  {
    label: "smooly",
    href: "https://github.com/broisnischal/smooly",
    display: "github.com/broisnischal/smooly",
    github: "https://github.com/broisnischal/smooly",
    description: "A better scrolling and mouse experience for Windows users.",
  },
  {
    label: "paper",
    href: "https://github.com/broisnischal/paper",
    display: "github.com/broisnischal/paper",
    github: "https://github.com/broisnischal/paper",
    description:
      "Fast terminal wallpaper manager for Omarchy / Hyprland (Linux · macOS · Windows).",
  },
  {
    label: "discerns.app",
    href: "https://discerns.app",
    display: "discerns.app",
    github: "https://github.com/broisnischal/discerns.app",
    description: "Save links. Follow feeds. Find things fast.",
  },
  { label: "lexicon", display: "sunset 2026", strike: true },
];

const DOTFILES: LinkItem[] = [
  {
    label: "dotfiles",
    href: "https://github.com/broisnischal/dotfiles",
    display: "github.com/broisnischal/dotfiles",
    github: "https://github.com/broisnischal/dotfiles",
    description: "My dotfiles and settings — shell, editor, and desktop config.",
  },
];

const WRITING: LinkItem[] = [
  { label: "Strongly Typed Env", to: "/blog/strongly-typed-env" },
  { label: "Dockerizing a Remix App", to: "/blog/dockerizing-remix-app" },
  { label: "Theme Inconsistency on SSR", to: "/blog/theme-inconsistency-ssr" },
  { label: "All posts", to: "/blog" },
];

const EXPLORE: LinkItem[] = [
  { label: "Blog", to: "/blog" },
  { label: "Activity", to: "/activity" },
  { label: "Links", to: "/links" },
  { label: "Uses", to: "/use" },
  { label: "Chess", to: "/chess" },
];

/** Renders a LinkItem as a `- [label](display)` list row. */
function Item({ item }: { item: LinkItem }) {
  if (item.strike) {
    return (
      <MdListItem>
        <span className="text-muted-foreground/55 line-through">
          [{item.label}]({item.display})
        </span>
      </MdListItem>
    );
  }
  const ownerRepo = ownerRepoFromUrl(item.github);
  return (
    <MdListItem>
      <span>
        <MdLink
          label={item.label}
          to={item.to}
          href={item.href}
          display={item.display}
        />
        {item.github && (
          <a
            href={item.github}
            target="_blank"
            rel="noreferrer noopener"
            title={item.github}
            aria-label={`${item.label} on GitHub`}
            className="ml-2 inline-flex rounded-xs align-middle text-muted-foreground/60 outline-none transition-colors hover:text-bright focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Github className="size-3.5" aria-hidden />
          </a>
        )}
        {ownerRepo && item.github && (
          <StarButton
            owner={ownerRepo.owner}
            repo={ownerRepo.repo}
            githubUrl={item.github}
            count={item.stars}
          />
        )}
      </span>
      {item.description && (
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground/55 [overflow-wrap:anywhere]">
          {item.description}
        </span>
      )}
    </MdListItem>
  );
}

function Section({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <>
      <Squiggle />
      <section aria-label={title}>
        <SectionLabel>{title}</SectionLabel>
        <MdList>
          {items.map((item, i) => (
            <Item key={item.label + i} item={item} />
          ))}
        </MdList>
      </section>
    </>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { stars } = loaderData;
  const withStars = (list: LinkItem[]) =>
    list.map((p) => {
      const name = repoNameFromUrl(p.github)?.toLowerCase();
      const count = name ? stars[name]?.count : undefined;
      return count == null ? p : { ...p, stars: count };
    });
  const projects = withStars(PROJECTS);
  const dotfiles = withStars(DOTFILES);
  const repoNames = [...PROJECTS, ...DOTFILES]
    .map((p) => repoNameFromUrl(p.github))
    .filter((n): n is string => Boolean(n));

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-base font-medium tracking-tight text-bright">
        nischal dahal
      </h1>

      <p className="mt-3 text-muted-foreground">
        AI/ML-based full-stack engineer building cool stuff —
        platform-agnostic, allergic to bloat, and pipes things into{" "}
        <code className="text-term-link">{"<(…)"}</code> for fun. part engineer,
        part romantic, quietly sophisticated, and an unapologetic nerd who
        ships.
      </p>

      <StarStateProvider repoNames={repoNames}>
        <Section title="Projects" items={projects} />
        <Section title="Dotfiles" items={dotfiles} />
      </StarStateProvider>
      <Section title="Writing" items={WRITING} />
      <Section title="Explore" items={EXPLORE} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full text-sm">
      <SectionLabel>Error</SectionLabel>
      <p className="mt-2 text-destructive">{error.message}</p>
    </div>
  );
}
