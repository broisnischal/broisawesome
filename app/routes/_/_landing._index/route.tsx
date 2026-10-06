import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import { Link } from "react-router";
import {
  BLEED,
  GridCells,
  GridSection,
  ROW_LINK,
  RowNumber,
} from "~/components/grid";
import { AlbumCell } from "~/components/album-cell";
import { useCopyBurst } from "~/components/copy-burst";
import { CopyCommand } from "~/components/copy-command";
import { LocalTime } from "~/components/local-time";
import { ScratchCode } from "~/components/scratch-code";
import { ScrambleText, useScramble } from "~/components/scramble";
import { DottedGlowBackground } from "~/components/ui/dotted-glow-background";
import { CopyPostForLLM } from "~/components/copy-llm-button";
import { StarButton, StarStateProvider } from "~/components/star-button";
import { SectionLabel } from "~/components/terminal";
import { SHARED_ALBUM_URL } from "~/lib/gallery";
import { cn } from "~/lib/utils";
import { fetchGitHubRepoStars } from "~/.server/github-repos";
import { getBlogs } from "~/lib/blog-content";
import {
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
  createWebSiteSchema,
} from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  grid: true,
  breadcrumb: () => <Link to="/">home</Link>,
  hideBreadcrumbs: true,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Nischal Dahal - aka broisnischal",
    description:
      "Nischal Dahal (broisnischal): AI/ML-based full-stack engineer building serverless systems, products, and modern web experiences. Projects, writing, and links.",
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

  const posts = getBlogs()
    .filter((b) => b.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .map((b) => ({
      title: b.title,
      slug: b.slug,
      date: b.date!,
    }));

  return { stars, posts };
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
  /** Install/run command shown (with a copy button) in place of `display`. */
  command?: string;
  /** Short status pill beside the number, e.g. "launched". */
  badge?: string;
  /** Shimmering dot field behind the cell: the one project to look at now. */
  glow?: boolean;
  /** Discount shown on hover (with confetti the first time). */
  promo?: { code: string; off: string };
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
    display: "gh/battlify",
    github: "https://github.com/broisnischal/battlify",
    description: "Fixes your Mac battery issues.",
  },
  {
    label: "stroke.click",
    href: "https://stroke.click",
    display: "stroke.click",
    github: "https://github.com/broisnischal/stroke",
    description: "A fast, minimal desktop database client.",
    badge: "launched",
    glow: true,
    promo: { code: "STROKE20", off: "20% off" },
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
    display: "gh/zorail",
    github: "https://github.com/broisnischal/zorail",
    description: "Self-hosted disposable inboxes for organizations.",
  },
  {
    label: "azure-mcp",
    href: "https://github.com/broisnischal/azure-mcp",
    display: "gh/azure-mcp",
    github: "https://github.com/broisnischal/azure-mcp",
    description: "Interact with Azure Boards through rich MCP tools.",
    command: "npx azure-board-mcp install",
  },
  {
    label: "prisma-type-generator",
    href: "https://github.com/broisnischal/prisma-type-generator",
    display: "gh/prisma-type-generator",
    github: "https://github.com/broisnischal/prisma-type-generator",
    description: "A Prisma type generator.",
    command: "npm install prisma-type-generator",
  },
  {
    label: "zap",
    href: "https://github.com/broisnischal/zap",
    display: "gh/zap",
    github: "https://github.com/broisnischal/zap",
    description:
      "A fast, cross-platform universal package manager that auto-detects your system.",
  },
  {
    label: "phobos",
    href: "https://github.com/broisnischal/phobos",
    display: "gh/phobos",
    github: "https://github.com/broisnischal/phobos",
    description: "The best token is the token never spent.",
  },
  {
    label: "smooly",
    href: "https://github.com/broisnischal/smooly",
    display: "gh/smooly",
    github: "https://github.com/broisnischal/smooly",
    description: "A better scrolling and mouse experience for Windows users.",
  },
  {
    label: "paper",
    href: "https://github.com/broisnischal/paper",
    display: "gh/paper",
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
    display: "gh/dotfiles",
    github: "https://github.com/broisnischal/dotfiles",
    description: "My dotfiles and settings: shell, editor, and desktop config.",
    command:
      "git clone https://github.com/broisnischal/dotfiles.git ~/dotfiles && ~/dotfiles/install.sh",
  },
  {
    label: "keyboard",
    href: "https://github.com/broisnischal/keyboard",
    display: "gh/keyboard",
    github: "https://github.com/broisnischal/keyboard",
    description:
      "Epomaker TH40 on my own QMK firmware. Three lamps show what Claude Code is doing.",
    command:
      "git clone https://github.com/broisnischal/keyboard.git && cd keyboard && ./setup.sh",
  },
  {
    label: "skills",
    href: "https://github.com/broisnischal/skills",
    display: "gh/skills",
    github: "https://github.com/broisnischal/skills",
    description:
      "My Claude skills: me writes in my voice, write-as-bro strips the AI tells.",
    command:
      "git clone https://github.com/broisnischal/skills.git ~/src/claude-skills && bash ~/src/claude-skills/me/install.sh",
  },
];

/** Five posts plus the "all posts" cell fill the 3×2 box exactly. */
const LATEST_POSTS = 5;

function formatDate(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/** True when the visitor asked the OS for less motion. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const on = () => setReduced(mql.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Amber-glinting dot field behind a featured cell, fading out toward the
 * bottom. Frozen (no twinkle) under reduced motion.
 */
function CellGlow() {
  const reduced = useReducedMotion();
  return (
    <DottedGlowBackground
      className="pointer-events-none -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
      gap={10}
      radius={1.25}
      color="rgba(0,0,0,0.28)"
      darkColor="rgba(255,255,255,0.18)"
      glowColor="rgba(196,120,20,0.9)"
      darkGlowColor="rgba(245,185,90,0.95)"
      opacity={0.9}
      speedScale={reduced ? 0 : 1}
    />
  );
}

/** Status label on a faded amber wash, e.g. "launched". */
function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-xs bg-term-link/12 px-1.5 text-xs leading-5 text-term-link-hover">
      {children}
    </span>
  );
}

/**
 * One project, one box: number and star on top, name and summary in the
 * middle, where it lives at the bottom. The whole box is the link.
 */
function ProjectCell({ item, index }: { item: LinkItem; index: number }) {
  const ownerRepo = ownerRepoFromUrl(item.github);
  // The icon only earns its place when the box links somewhere else.
  const showGithubIcon = Boolean(item.github && item.href !== item.github);

  const { ref, fire, burst } = useCopyBurst();
  const { shown, run } = useScramble(item.label);

  return (
    <div
      ref={ref}
      onPointerEnter={run}
      onFocus={run}
      className="cell-corners relative isolate flex h-(--row) w-full flex-col gap-3 px-5 py-5 md:px-8 md:py-6"
    >
      {item.glow && <CellGlow />}
      {burst}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <RowNumber n={index + 1} />
          {item.badge && <Badge>{item.badge}</Badge>}
        </span>
        {ownerRepo && item.github && !item.strike && (
          <StarButton
            owner={ownerRepo.owner}
            repo={ownerRepo.repo}
            githubUrl={item.github}
            count={item.stars}
            revealOnHover
          />
        )}
      </div>

      <div className="flex-1">
        {item.strike ? (
          <p className="text-base text-muted-foreground line-through decoration-faint">
            {item.label}
          </p>
        ) : (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className={`block truncate text-base font-medium text-bright ${ROW_LINK}`}
          >
            <ScrambleText text={item.label} shown={shown} />
          </a>
        )}
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>

      {item.promo && (
        // The offer, under scratch-off foil.
        <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
          <ScratchCode
            code={item.promo.code}
            storageKey="stroke-promo-scratched"
            offer={{
              off: item.promo.off,
              title: `${item.promo.off} Stroke`,
              href: item.href ?? "https://stroke.click",
              hrefLabel: item.display ?? "stroke.click",
            }}
            onCopied={fire}
          />
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${item.label} on GitHub`}
              className="relative z-10 inline-flex shrink-0 rounded-xs text-muted-foreground transition-colors after:absolute after:-inset-[5px] hover:text-bright"
            >
              <Github className="size-3.5" strokeWidth={1.75} aria-hidden />
            </a>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex items-center justify-between gap-3 text-xs",
          item.promo && "hidden",
        )}
      >
        {item.command ? (
          <CopyCommand command={item.command} onCopied={fire} />
        ) : (
          <span
            className={
              item.strike ? "text-muted-foreground" : "truncate text-term-link"
            }
          >
            {item.display}
          </span>
        )}
        {showGithubIcon && (
          <a
            href={item.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${item.label} on GitHub`}
            className="relative z-10 inline-flex shrink-0 rounded-xs text-muted-foreground transition-colors after:absolute after:-inset-[5px] hover:text-bright"
          >
            <Github className="size-3.5" strokeWidth={1.75} aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

type Post = {
  title: string;
  slug: string;
  date: string;
};

/**
 * One post, one box: number and date on top, the title, then a "blog" chip
 * and "copy for LLM" along the bottom.
 */
function PostCell({ post, index }: { post: Post; index: number }) {
  const { ref, fire, burst } = useCopyBurst();
  const { shown, run } = useScramble(post.title);
  return (
    <div
      ref={ref}
      onPointerEnter={run}
      onFocus={run}
      className="cell-corners relative isolate flex h-(--row) w-full flex-col gap-3 px-5 py-5 md:px-8 md:py-6"
    >
      {burst}
      <div className="flex items-center justify-between gap-3">
        <RowNumber n={index + 1} />
        <time
          dateTime={post.date}
          className="text-xs tabular-nums text-muted-foreground"
        >
          {formatDate(post.date)}
        </time>
      </div>
      <div className="flex-1">
        <Link
          to={`/blog/${post.slug}`}
          className={`line-clamp-2 text-sm font-medium leading-snug text-bright ${ROW_LINK}`}
        >
          <ScrambleText text={post.title} shown={shown} />
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-xs bg-foreground/8 px-1.5 text-xs leading-5 text-muted-foreground">
          blog
        </span>
        <CopyPostForLLM
          slug={post.slug}
          title={post.title}
          date={post.date}
          onCopied={fire}
        />
      </div>
    </div>
  );
}

/** Last cell of the writing grid: the way into the full archive. */
function AllPostsCell({ total, since }: { total: number; since?: number }) {
  return (
    <div className="cell-corners relative isolate flex h-(--row) w-full flex-col gap-3 px-5 py-5 md:px-8 md:py-6">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span aria-hidden>→</span>
        {since && <span className="tabular-nums">since {since}</span>}
      </div>
      <div className="flex-1">
        <Link
          to="/blog"
          className={`text-sm font-medium leading-snug text-bright ${ROW_LINK}`}
        >
          all {total} posts
        </Link>
      </div>
      <span className="text-xs text-term-link">/blog</span>
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  // Star counts are decoration: a missing or stale payload (e.g. after a hot
  // reload) must never take the page down.
  const stars = loaderData?.stars ?? {};
  const posts = loaderData?.posts ?? [];
  const oldestYear = posts.length
    ? new Date(posts[posts.length - 1].date).getFullYear()
    : undefined;
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
    // Flush with the header above and the footer below: the home page is one
    // continuous stack of boxes.
    <div className="-mt-10 -mb-16 w-full text-sm leading-7 md:-mt-12 md:-mb-20 md:text-[0.9375rem]">
      {/* The intro is the first row of the same 3-column grid as the cells
          below: name in column one, the paragraph across two and three. */}
      <section
        aria-labelledby="intro"
        className={cn(
          "grid-cross relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3",
          BLEED,
        )}
      >
        <AlbumCell className="flex min-h-32 flex-col justify-between gap-6 bg-background px-5 py-5 sm:col-span-2 md:px-8 md:py-6 lg:col-span-1 lg:h-(--row)">
          <span className="-mx-1.5 self-start rounded-xs bg-background px-1.5 text-xs text-muted-foreground">
            README.md
          </span>
          <h1
            id="intro"
            className="font-display text-[2rem] leading-none font-normal tracking-[-0.02em] text-bright italic md:text-[2.375rem]"
          >
            <a
              href={SHARED_ALBUM_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xs transition-colors hover:text-term-link"
            >
              nischal dahal
            </a>
          </h1>
        </AlbumCell>
        <div
          data-tile
          className="flex min-h-48 flex-col justify-between gap-3 bg-background px-5 py-5 sm:col-span-2 md:px-8 md:py-6 lg:h-(--row)"
        >
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>kathmandu, np</span>
            <LocalTime className="tabular-nums" />
          </div>
          <p className="max-w-[68ch] text-pretty text-muted-foreground lg:leading-6">
            <span className="text-bright">AI/ML-based full-stack engineer</span>{" "}
            building cool stuff:{" "}
            <span className="whitespace-nowrap">platform-agnostic</span>,
            allergic to bloat, and pipes things into{" "}
            <code className="rounded-xs bg-term-link/12 px-1 text-term-link-hover">
              {"<(…)"}
            </code>{" "}
            for fun. part engineer, part romantic, quietly sophisticated, and an
            unapologetic nerd who ships.
          </p>
        </div>
      </section>

      <StarStateProvider repoNames={repoNames}>
        <GridSection title="Projects" bare>
          <GridCells
            label="Projects"
            items={projects}
            cellKey={(p) => p.label}
            renderCell={(item, i) => <ProjectCell item={item} index={i} />}
          />
        </GridSection>
        <GridSection title="Dotfiles" bare>
          <GridCells
            label="Dotfiles"
            items={dotfiles}
            cellKey={(p) => p.label}
            renderCell={(item, i) => <ProjectCell item={item} index={i} />}
          />
        </GridSection>
      </StarStateProvider>

      {posts.length > 0 && (
        <GridSection title="Writing" bare>
          <GridCells
            label="Latest posts"
            items={[
              ...posts.slice(0, LATEST_POSTS).map((post) => ({ post })),
              { post: undefined },
            ]}
            cellKey={(c) => c.post?.slug ?? "all-posts"}
            renderCell={(c, i) =>
              c.post ? (
                <PostCell post={c.post} index={i} />
              ) : (
                <AllPostsCell total={posts.length} since={oldestYear} />
              )
            }
          />
        </GridSection>
      )}
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
