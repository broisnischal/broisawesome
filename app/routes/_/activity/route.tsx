import {
  Circle,
  CircleDot,
  FileCode,
  FolderGit2,
  GitCommitHorizontal,
  GitFork,
  GitMerge,
  GitPullRequest,
  Globe,
  type LucideIcon,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useFetcher } from "react-router";
import type {
  GitHubActivityIcon,
  GitHubActivityItem,
} from "~/.server/github-activity";
import { fetchGitHubActivity } from "~/.server/github-activity";
import { MdList, SectionLabel, Squiggle } from "~/components/terminal";
import {
  createHeaders,
  createMetaTags,
  createPageSchema,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

/** Event category → lucide glyph. */
const ICONS: Record<GitHubActivityIcon, LucideIcon> = {
  commit: GitCommitHorizontal,
  repo: FolderGit2,
  star: Star,
  fork: GitFork,
  issue: CircleDot,
  pr: GitPullRequest,
  release: Tag,
  public: Globe,
  delete: Trash2,
  gist: FileCode,
  default: Circle,
};

/** How far back the timeline reaches. */
const WINDOW_DAYS = 5;

/**
 * Group a flat, time-ordered item list into day buckets. Client-safe (kept out
 * of `.server`) so it can regroup as infinite scroll appends more pages.
 */
function groupByDate(items: GitHubActivityItem[]) {
  const groups: {
    dateKey: string;
    label: string;
    items: GitHubActivityItem[];
  }[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  for (const item of items) {
    const d = new Date(item.createdAt);
    const dateKey = d.toISOString().slice(0, 10);
    let g = groups.find((x) => x.dateKey === dateKey);
    if (!g) {
      g = { dateKey, label: formatter.format(d), items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

export const handle = {
  breadcrumb: () => <Link to="/activity">activity</Link>,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Latest activity",
    description:
      "Recent GitHub activity: commits, new repositories, stars, issues, and pull requests by Nischal Dahal (broisnischal).",
    path: "/activity",
    keywords: [
      "GitHub",
      "open source",
      "commits",
      "Nischal Dahal",
      "broisnischal",
      "developer activity",
    ],
  });
  const schema = createPersonSchema({
    description:
      "Public GitHub activity timeline: repositories, contributions, and interactions.",
  });
  return [
    ...metaTags,
    createSchemaMetaTag(schema),
    createPageSchema({
      title: "Activity — Nischal Dahal",
      description:
        "Recent GitHub activity: commits, repositories, stars, issues, and pull requests by Nischal Dahal (broisnischal).",
      path: "/activity",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Activity", path: "/activity" },
      ],
      type: "CollectionPage",
    }),
  ];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
  });
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const url = new URL(request.url);
  const page = Math.min(Math.max(Number(url.searchParams.get("page")) || 1, 1), 10);
  const sinceIso = new Date(
    Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  return fetchGitHubActivity(env, { perPage: 30, page, sinceIso });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { username, error, rateLimitRemaining, fromApi } = loaderData;

  const fetcher = useFetcher<typeof loader>();
  const [items, setItems] = useState<GitHubActivityItem[]>(loaderData.items);
  const [page, setPage] = useState(loaderData.page);
  const [hasMore, setHasMore] = useState(loaderData.hasMore);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when the base loader data changes (navigation / revalidation).
  useEffect(() => {
    setItems(loaderData.items);
    setPage(loaderData.page);
    setHasMore(loaderData.hasMore);
  }, [loaderData]);

  // Append each fetched page, de-duping by event id (guards double-fires).
  useEffect(() => {
    const data = fetcher.data;
    if (fetcher.state !== "idle" || !data) return;
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.id));
      return [...prev, ...data.items.filter((i) => !seen.has(i.id))];
    });
    setPage(data.page);
    setHasMore(data.hasMore);
  }, [fetcher.state, fetcher.data]);

  // Load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && fetcher.state === "idle") {
          fetcher.load(`/activity?page=${page + 1}`);
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, page, fetcher]);

  const groups = groupByDate(items);
  const loadingMore = fetcher.state !== "idle";

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Activity</h1>
      <p className="mt-2 text-muted-foreground">
        public events from{" "}
        <a
          href={`https://github.com/${username}`}
          className="term-link"
          target="_blank"
          rel="noreferrer"
        >
          @{username}
        </a>
      </p>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {fromApi ? "GitHub: " : ""}
          {error}
          {rateLimitRemaining != null && rateLimitRemaining <= 10 && (
            <span className="mt-1 block text-sm text-muted-foreground">
              rate limit remaining: {rateLimitRemaining}
            </span>
          )}
        </p>
      )}

      {groups.length === 0 && !error ? (
        <p className="mt-6 text-muted-foreground">
          no recent public events.
        </p>
      ) : (
        <div className="mt-6 space-y-8" aria-label="Activity timeline">
          {groups.map((group, gi) => (
            <section key={group.dateKey} aria-label={group.label}>
              {gi > 0 && <Squiggle />}
              <SectionLabel>
                <time dateTime={group.dateKey}>{group.label}:</time>
              </SectionLabel>
              <MdList>
                {group.items.map((item) => {
                  const structured =
                    item.action != null &&
                    item.repoLabel != null &&
                    item.repoUrl != null;
                  const Icon =
                    item.accent === "merge" ? GitMerge : ICONS[item.icon];
                  return (
                    <li key={item.id} className="flex gap-2.5 leading-6">
                      <Icon
                        aria-hidden
                        className="mt-[3px] size-4 shrink-0 text-muted-foreground/70"
                      />
                      <span className="min-w-0 flex-1 text-muted-foreground">
                        {structured ? (
                          <>
                            <span className="text-foreground">
                              {item.action}
                            </span>
                            <a
                              href={item.repoUrl!}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="term-link"
                            >
                              {item.repoLabel}
                            </a>
                            {item.tail ? (
                              <span className="text-muted-foreground">
                                {item.tail}
                              </span>
                            ) : null}
                            {item.pushHeadShort ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noreferrer noopener"
                                title="View on GitHub"
                                className="ml-1.5 font-mono text-xs text-muted-foreground/70 hover:text-bright"
                              >
                                {item.pushHeadShort}
                              </a>
                            ) : null}
                          </>
                        ) : (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="term-link"
                          >
                            {item.title}
                          </a>
                        )}
                        {item.subtitle ? (
                          <span className="ml-1 text-muted-foreground/70">
                            — {item.subtitle}
                          </span>
                        ) : null}
                        <time
                          className="ml-2 font-mono text-xs tabular-nums text-muted-foreground/60"
                          dateTime={item.createdAt}
                        >
                          {new Date(item.createdAt).toLocaleTimeString(
                            undefined,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </time>
                      </span>
                    </li>
                  );
                })}
              </MdList>
            </section>
          ))}

          {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}

          <p
            className="pt-2 text-center text-xs text-muted-foreground/60"
            role="status"
            aria-live="polite"
          >
            {loadingMore
              ? "loading more…"
              : hasMore
                ? null
                : `— end of the last ${WINDOW_DAYS} days —`}
          </p>
        </div>
      )}
    </div>
  );
}
