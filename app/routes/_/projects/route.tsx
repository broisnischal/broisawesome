import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRightIcon,
  Cpu,
  Database,
  Download,
  ExternalLink,
  GithubIcon,
  Network,
  PackageIcon,
  Pin,
  Puzzle,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { GitHubRepoItem } from "~/.server/github-repos";
import { fetchGitHubPinnedRepos } from "~/.server/github-repos";
import {
  fetchGitHubOwnerRepos,
  filterDatabaseRepos,
  filterEdgeInfraRepos,
  filterExtensionRepos,
  filterMcpRepos,
  type EdgeInfraKind,
  type ExtensionKind,
} from "~/.server/github-user-repos";
import type { NpmPackageItem } from "~/.server/npm-packages";
import { fetchNpmPackagesByMaintainer } from "~/.server/npm-packages";
import { Button } from "~/components/ui/button";
import {
  createHeaders,
  createMetaTags,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

const NPM_TOP = 5;

/**
 * Per-ecosystem accents. Edge stack (CDN·DNS·VPN) uses one cyan rail; cards show
 * per-repo CDN/DNS/VPN badges. MCP violet, DB sky, extensions blue, pinned GitHub green.
 */
const EDGE_REPO_URLS = {
  cdn: "https://github.com/broisnischal/cdn",
  dns: "https://github.com/broisnischal/dns",
  vpn: "https://github.com/broisnischal/vpn",
} as const;

const ACCENT = {
  github: {
    gradient:
      "from-[#238636]/[0.09] via-card to-card dark:from-[#2ea043]/[0.14]",
    borderHover: "hover:border-[#238636]/40 dark:hover:border-[#3fb950]/40",
    shadow: "hover:shadow-md hover:shadow-[#238636]/12",
    iconBox:
      "bg-[#238636]/15 text-[#1f7a33] dark:bg-[#2ea043]/18 dark:text-[#3fb950]",
    stat: "text-[#1a7f37] dark:text-[#56d364]",
    titleHover: "group-hover:text-[#1a7f37] dark:group-hover:text-[#56d364]",
    sectionBar: "border-l-[#238636] dark:border-l-[#3fb950]",
  },
  mcp: {
    gradient:
      "from-violet-600/[0.11] via-card to-card dark:from-violet-500/[0.14]",
    borderHover: "hover:border-violet-500/40 dark:hover:border-violet-400/40",
    shadow: "hover:shadow-md hover:shadow-violet-500/15",
    iconBox:
      "bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    stat: "text-violet-700 dark:text-violet-300",
    titleHover: "group-hover:text-violet-700 dark:group-hover:text-violet-300",
    sectionBar: "border-l-violet-600 dark:border-l-violet-400",
  },
  extension: {
    gradient: "from-blue-600/[0.08] via-card to-card dark:from-blue-500/[0.12]",
    borderHover: "hover:border-blue-500/40 dark:hover:border-blue-400/40",
    shadow: "hover:shadow-md hover:shadow-blue-500/12",
    iconBox:
      "bg-blue-500/14 text-blue-700 dark:bg-blue-500/18 dark:text-blue-300",
    stat: "text-blue-700 dark:text-blue-300",
    titleHover: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
    sectionBar: "border-l-blue-600 dark:border-l-blue-400",
  },
  database: {
    gradient: "from-sky-600/[0.08] via-card to-card dark:from-sky-500/[0.12]",
    borderHover: "hover:border-sky-500/40 dark:hover:border-sky-400/40",
    shadow: "hover:shadow-md hover:shadow-sky-500/12",
    iconBox: "bg-sky-500/14 text-sky-800 dark:bg-sky-500/18 dark:text-sky-300",
    stat: "text-sky-800 dark:text-sky-300",
    titleHover: "group-hover:text-sky-800 dark:group-hover:text-sky-300",
    sectionBar: "border-l-sky-600 dark:border-l-sky-400",
  },
  edge: {
    gradient: "from-cyan-600/[0.08] via-card to-card dark:from-cyan-500/[0.12]",
    borderHover: "hover:border-cyan-500/40 dark:hover:border-cyan-400/40",
    shadow: "hover:shadow-md hover:shadow-cyan-500/12",
    iconBox:
      "bg-cyan-500/14 text-cyan-800 dark:bg-cyan-500/18 dark:text-cyan-300",
    stat: "text-cyan-800 dark:text-cyan-300",
    titleHover: "group-hover:text-cyan-800 dark:group-hover:text-cyan-300",
    sectionBar: "border-l-cyan-600 dark:border-l-cyan-400",
  },
  npm: {
    gradient: "from-[#cb3837]/[0.07] via-card to-card dark:from-[#cb3837]/12",
    borderHover: "hover:border-[#cb3837]/45",
    shadow: "hover:shadow-lg hover:shadow-[#cb3837]/8",
    iconBox:
      "bg-[#cb3837]/12 text-[#cb3837] dark:bg-[#cb3837]/22 dark:text-[#ff6b6b]",
    stat: "text-[#cb3837] dark:text-[#ff7b7b]",
    titleHover: "group-hover:text-[#cb3837] dark:group-hover:text-[#ff8a8a]",
    sectionBar: "border-l-[#cb3837] dark:border-l-[#ff6b6b]",
  },
} as const;

type RepoAccent = keyof typeof ACCENT;

const GRID_PROJECTS =
  "grid list-none gap-3 p-0 grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))]";

function SectionHead({
  id,
  title,
  barClass,
  children,
}: {
  id: string;
  title: string;
  barClass: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <h2
        id={id}
        className={cn(
          "border-l-[3px] pl-2.5 text-base font-semibold tracking-tight text-foreground md:text-lg",
          barClass,
        )}
      >
        {title}
      </h2>
      <div className="mt-1 max-w-2xl pl-3 text-[11px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

function formatCompactDownloads(n: unknown): string {
  const num = typeof n === "number" && Number.isFinite(n) ? n : 0;
  if (num >= 1_000_000) {
    const v = num / 1_000_000;
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const v = num / 1_000;
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}k`;
  }
  return String(num);
}

export const handle = {
  breadcrumb: () => <Link to="/projects">Projects</Link>,
};

export const meta: Route.MetaFunction = () => {
  const tags = createMetaTags({
    title: "Projects by Nischal Dahal",
    description:
      "Pinned repos, MCP, extensions, database, CDN, DNS, VPN projects, and npm packages.",
    path: "/projects",
    keywords: [
      "Nischal Dahal",
      "broisnischal",
      "Prisma",
      "Drizzle",
      "PGlite",
      "MCP",
      "npm",
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

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const [github, npm, ownerRepos] = await Promise.all([
    fetchGitHubPinnedRepos(env),
    fetchNpmPackagesByMaintainer(env, { size: 250, topByDownloads: NPM_TOP }),
    fetchGitHubOwnerRepos(env, { perPage: 100 }),
  ]);

  const pinnedIds = new Set(github.repos.map((r) => r.id));
  const mcpRepos = ownerRepos.error
    ? []
    : filterMcpRepos(ownerRepos.repos, pinnedIds);
  const extensionRepos = ownerRepos.error
    ? []
    : filterExtensionRepos(ownerRepos.repos, pinnedIds);
  const databaseRepos = ownerRepos.error
    ? []
    : filterDatabaseRepos(ownerRepos.repos, pinnedIds);
  const edgeInfraRepos = ownerRepos.error
    ? []
    : filterEdgeInfraRepos(ownerRepos.repos, pinnedIds);

  return {
    github,
    npm,
    ownerRepos,
    mcpRepos,
    extensionRepos,
    databaseRepos,
    edgeInfraRepos,
  };
}

function extensionKindLabel(kinds: ExtensionKind[]): string {
  const b = kinds.includes("browser");
  const v = kinds.includes("vscode");
  if (b && v) return "Browser · VS Code";
  if (b) return "Browser";
  return "VS Code";
}

function edgeInfraLabel(kinds: EdgeInfraKind[]): string {
  const order: EdgeInfraKind[] = ["cdn", "dns", "vpn"];
  return order
    .filter((k) => kinds.includes(k))
    .map((k) => k.toUpperCase())
    .join(" · ");
}

/**
 * Shared “showcase” tile: rank or badge row, icon tile, title block, description, footer.
 * Wide enough grids + break-words avoid the ultra-narrow vertical letter stack.
 */
function ShowcaseCard({
  href,
  accent,
  rank,
  badge,
  LeadIcon,
  title,
  subtitle,
  description,
  metaRow,
  footer,
}: {
  href: string;
  accent: RepoAccent;
  rank?: number;
  badge?: { Icon: LucideIcon; label: string; iconClassName?: string };
  LeadIcon: LucideIcon;
  title: string;
  subtitle?: string;
  description: string;
  metaRow?: ReactNode;
  footer: ReactNode;
}) {
  const a = ACCENT[accent];
  const BadgeIconCmp = badge?.Icon;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-linear-to-b p-3.5 pt-4 shadow-sm",
        a.gradient,
        "transition-all duration-200 hover:-translate-y-px",
        a.borderHover,
        a.shadow,
      )}
    >
      <div className="mb-2 flex min-h-4 items-center justify-between gap-1.5">
        {rank != null ? (
          <span
            className="font-mono text-[9px] font-bold tabular-nums text-muted-foreground"
            aria-label={`Rank ${rank}`}
          >
            #{rank}
          </span>
        ) : badge && BadgeIconCmp ? (
          <span className="inline-flex min-w-0 max-w-[85%] items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            <BadgeIconCmp
              size={10}
              className={cn("shrink-0", badge.iconClassName ?? a.stat)}
              aria-hidden
            />
            <span className="truncate">{badge.label}</span>
          </span>
        ) : (
          <span aria-hidden className="block" />
        )}
        <ExternalLink
          size={12}
          className="shrink-0 text-muted-foreground/45 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>

      <div className="flex min-w-0 gap-2.5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            a.iconBox,
          )}
        >
          <LeadIcon size={17} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-semibold leading-tight tracking-tight text-foreground transition-colors",
              accent === "npm" && "font-mono text-[13px] leading-snug",
              a.titleHover,
            )}
          >
            <span className="wrap-break-word">{title}</span>
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-xs leading-snug text-muted-foreground line-clamp-2">
        {description}
      </p>

      {metaRow ? <div className="mt-2 min-w-0">{metaRow}</div> : null}

      <div className="mt-auto border-t border-border/40 pt-2">{footer}</div>
    </a>
  );
}

type GithubCardAccent = Exclude<RepoAccent, "npm">;

function GitHubRepoCard({
  repo,
  badge,
  accent,
}: {
  repo: GitHubRepoItem;
  badge: { Icon: LucideIcon; label: string; iconClassName?: string };
  accent: GithubCardAccent;
}) {
  const tags = [
    ...(repo.language ? [repo.language] : []),
    ...repo.topics.slice(0, 3),
  ];
  const a = ACCENT[accent];

  const subtitleParts: string[] = [];
  if (repo.archived) subtitleParts.push("Archived");
  if (repo.fork) subtitleParts.push("Fork");
  const subtitle =
    subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined;

  return (
    <ShowcaseCard
      accent={accent}
      href={repo.htmlUrl}
      badge={{ ...badge, iconClassName: badge.iconClassName ?? a.stat }}
      LeadIcon={GithubIcon}
      title={repo.name}
      subtitle={subtitle}
      description={repo.description?.trim() || "No description provided."}
      metaRow={
        tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1" aria-label="Topics">
            {tags.map((tech) => (
              <li key={tech}>
                <span className="inline-block rounded bg-muted/70 px-1.5 py-px font-mono text-[9px] text-muted-foreground">
                  {tech}
                </span>
              </li>
            ))}
          </ul>
        ) : undefined
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px]">
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono font-semibold tabular-nums",
              a.stat,
            )}
          >
            <Star size={11} className="text-amber-500 dark:text-amber-400" />
            {repo.stargazersCount}
          </span>
          {repo.pushedAt ? (
            <time
              dateTime={repo.pushedAt}
              className="tabular-nums text-muted-foreground"
            >
              {new Date(repo.pushedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "2-digit",
              })}
            </time>
          ) : null}
        </div>
      }
    />
  );
}

function NpmHighlightCard({
  pkg,
  rank,
}: {
  pkg: NpmPackageItem;
  rank: number;
}) {
  const dl = formatCompactDownloads(pkg.downloadsMonthly);

  return (
    <ShowcaseCard
      accent="npm"
      href={pkg.npmUrl}
      rank={rank}
      LeadIcon={PackageIcon}
      title={pkg.name}
      subtitle={`v${pkg.version}`}
      description={pkg.description?.trim() || "No description."}
      footer={
        <div className="flex flex-wrap items-end justify-between gap-1.5">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              Dl / mo
            </p>
            <p
              className={cn(
                "mt-0.5 flex items-center gap-1.5 font-mono text-base font-semibold tabular-nums leading-none",
                ACCENT.npm.stat,
              )}
            >
              <Download size={15} className="shrink-0 opacity-90" aria-hidden />
              {dl}
            </p>
          </div>
          {pkg.license ? (
            <span className="max-w-[42%] truncate rounded border border-border/50 bg-muted/35 px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {pkg.license}
            </span>
          ) : null}
        </div>
      }
    />
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const {
    github,
    npm,
    ownerRepos,
    mcpRepos,
    extensionRepos,
    databaseRepos,
    edgeInfraRepos,
  } = loaderData;
  const npmTotal = npm.total ?? npm.packages.length;
  const npmMore = Math.max(0, npmTotal - npm.packages.length);

  return (
    <div className="max-w-6xl w-full">
      <header className="relative mb-8 border-b border-border/70 pb-10">
        <div
          className="pointer-events-none absolute -left-4 top-0 h-24 w-24 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
          aria-hidden
        />
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          WORKING
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Projects
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Some of the highlights that i work sometime on.
        </p>
      </header>

      <section
        className="mb-12 space-y-3"
        aria-labelledby="github-projects-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            id="github-projects-heading"
            title="GitHub"
            barClass={ACCENT.github.sectionBar}
          >
            Pinned on your profile (public repos only, up to six).
          </SectionHead>
          {github.error && (
            <p className="max-w-md text-sm text-destructive" role="alert">
              {github.error}
              {!github.fromApi ? null : github.error.includes("rate limit") ||
                github.error.includes("API rate limit") ? (
                <span className="mt-2 block text-xs text-muted-foreground">
                  Set{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    GITHUB_TOKEN
                  </code>{" "}
                  for reliable access to pinned repositories.
                </span>
              ) : github.error.includes("Bad credentials") ? (
                <span className="mt-2 block text-xs text-muted-foreground">
                  Check that{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    GITHUB_TOKEN
                  </code>{" "}
                  is valid.
                </span>
              ) : null}
              {github.rateLimitRemaining != null &&
                github.rateLimitRemaining <= 10 && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Rate limit remaining: {github.rateLimitRemaining}
                  </span>
                )}
            </p>
          )}
        </div>
        {!github.error && github.repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No public pinned repositories to show. Pin repos on your GitHub
            profile, or ensure{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              GITHUB_TOKEN
            </code>{" "}
            is set if the API returns an error.
          </p>
        ) : !github.error ? (
          <ul className={GRID_PROJECTS}>
            {github.repos.map((repo) => (
              <li key={repo.id}>
                <GitHubRepoCard
                  repo={repo}
                  accent="github"
                  badge={{ Icon: Pin, label: "Pinned" }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {ownerRepos.error && (
        <p
          className="mb-10 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Could not load repository list for categorized sections:{" "}
          {ownerRepos.error}
        </p>
      )}

      <section className="mb-12 space-y-3" aria-labelledby="mcp-heading">
        <SectionHead
          id="mcp-heading"
          title="MCP"
          barClass={ACCENT.mcp.sectionBar}
        >
          Model Context Protocol that i have been working on{" "}
          <code className="rounded bg-muted px-1 py-px font-mono">mcp</code>.
        </SectionHead>
        {!ownerRepos.error && mcpRepos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No MCP repos in your last 100 owner pushes.
          </p>
        ) : !ownerRepos.error ? (
          <ul className={GRID_PROJECTS}>
            {mcpRepos.map((repo) => (
              <li key={repo.id}>
                <GitHubRepoCard
                  repo={repo}
                  accent="mcp"
                  badge={{ Icon: Cpu, label: "MCP" }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mb-12 space-y-3" aria-labelledby="extensions-heading">
        <SectionHead
          id="extensions-heading"
          title="Extensions"
          barClass={ACCENT.extension.sectionBar}
        >
          Browser (
          <code className="rounded bg-muted px-1 py-px font-mono">
            chrome-extension
          </code>
          , <code className="rounded bg-muted px-1 py-px font-mono">wxt</code>)
          & VS Code (
          <code className="rounded bg-muted px-1 py-px font-mono">
            vscode-extension
          </code>
          ). Pinned omitted.
        </SectionHead>
        {!ownerRepos.error && extensionRepos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No extension repos matched.
          </p>
        ) : !ownerRepos.error ? (
          <ul className={GRID_PROJECTS}>
            {extensionRepos.map(({ repo, kinds }) => (
              <li key={repo.id}>
                <GitHubRepoCard
                  repo={repo}
                  accent="extension"
                  badge={{
                    Icon: Puzzle,
                    label: extensionKindLabel(kinds),
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mb-12 space-y-3" aria-labelledby="database-heading">
        <SectionHead
          id="database-heading"
          title="Database & ORM"
          barClass={ACCENT.database.sectionBar}
        >
          Prisma, Drizzle, PGlite, libSQL/Turso, ORM topics. Pinned omitted.
        </SectionHead>
        {!ownerRepos.error && databaseRepos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No database repos matched — add topics like{" "}
            <code className="rounded bg-muted px-1 font-mono text-[10px]">
              prisma
            </code>
            .
          </p>
        ) : !ownerRepos.error ? (
          <ul className={GRID_PROJECTS}>
            {databaseRepos.map((repo) => (
              <li key={repo.id}>
                <GitHubRepoCard
                  repo={repo}
                  accent="database"
                  badge={{ Icon: Database, label: "DB" }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mb-12 space-y-3" aria-labelledby="edge-infra-heading">
        <SectionHead
          id="edge-infra-heading"
          title="Learning"
          barClass={ACCENT.edge.sectionBar}
        >
          Learning core infra.
        </SectionHead>
        {!ownerRepos.error && edgeInfraRepos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No edge repos matched — add topics{" "}
            <code className="rounded bg-muted px-1 font-mono text-[10px]">
              cdn
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 font-mono text-[10px]">
              dns
            </code>
            , or{" "}
            <code className="rounded bg-muted px-1 font-mono text-[10px]">
              vpn
            </code>
            .
          </p>
        ) : !ownerRepos.error ? (
          <ul className={GRID_PROJECTS}>
            {edgeInfraRepos.map(({ repo, kinds }) => (
              <li key={repo.id}>
                <GitHubRepoCard
                  repo={repo}
                  accent="edge"
                  badge={{
                    Icon: Network,
                    label: edgeInfraLabel(kinds),
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section
        className="mb-12 space-y-3"
        aria-labelledby="npm-packages-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            id="npm-packages-heading"
            title="npm"
            barClass={ACCENT.npm.sectionBar}
          >
            Top {NPM_TOP} by last-month downloads.
            {npmMore > 0 ? ` ${npmMore} more on npm.` : null}
          </SectionHead>
          {npm.error && (
            <p className="text-sm text-destructive" role="alert">
              {npm.fromApi ? "npm: " : ""}
              {npm.error}
            </p>
          )}
        </div>
        {!npm.error && npm.packages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No packages for maintainer @{npm.maintainer}. Set{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              NPM_USERNAME
            </code>{" "}
            to your npm login.
          </p>
        ) : !npm.error ? (
          <ul className={GRID_PROJECTS}>
            {npm.packages.map((pkg, i) => (
              <li key={pkg.name}>
                <NpmHighlightCard pkg={pkg} rank={i + 1} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <footer className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-8">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 font-normal"
        >
          <a
            href={`https://github.com/${github.username}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={14} aria-hidden />
            All repos
            <ArrowUpRightIcon size={14} className="opacity-60" aria-hidden />
          </a>
        </Button>
        {npm.maintainer ? (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5 font-normal"
          >
            <a
              href={`https://www.npmjs.com/~${encodeURIComponent(npm.maintainer)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PackageIcon size={14} className="text-[#cb3837]" aria-hidden />
              npm profile
              <ArrowUpRightIcon size={14} className="opacity-60" aria-hidden />
            </a>
          </Button>
        ) : null}
      </footer>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="max-w-6xl w-full">
      <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
      <p className="text-destructive">{error.message}</p>
    </div>
  );
}
