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
import { BLEED, GridCells, ROW_LINK, RowNumber } from "~/components/grid";
import { ScrambleText, useScramble } from "~/components/scramble";
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

export const handle = {
  grid: true,
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
  const page = Math.min(
    Math.max(Number(url.searchParams.get("page")) || 1, 1),
    10,
  );
  const sinceIso = new Date(
    Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  return fetchGitHubActivity(env, { perPage: 30, page, sinceIso });
}

/** One event, one box, like the project cells on the home page. */
function EventCell({
  item,
  index,
}: {
  item: GitHubActivityItem;
  index: number;
}) {
  const structured =
    item.action != null && item.repoLabel != null && item.repoUrl != null;
  const heading = structured ? item.repoLabel! : item.title;
  const { shown, run } = useScramble(heading);
  const Icon = item.accent === "merge" ? GitMerge : ICONS[item.icon];
  const when = new Date(item.createdAt);

  return (
    <div
      onPointerEnter={run}
      onFocus={run}
      className="cell-corners relative isolate flex h-(--row) w-full flex-col gap-3 px-5 py-5 md:px-8 md:py-6"
    >
      <div className="flex items-center justify-between gap-3">
        <RowNumber n={index + 1} />
        <time
          dateTime={item.createdAt}
          className="text-xs tabular-nums text-muted-foreground"
        >
          {when.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      <div className="min-w-0 flex-1">
        {(structured ? item.action : item.subtitle) && (
          <p className="truncate text-xs text-muted-foreground">
            {structured ? item.action : item.subtitle}
          </p>
        )}
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
          className={`mt-1 line-clamp-2 text-base font-medium leading-snug text-bright ${ROW_LINK}`}
        >
          <ScrambleText text={heading} shown={shown} />
        </a>
        {structured && item.tail && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {item.tail.trim()}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon aria-hidden className="size-3.5 text-faint" />
          {when.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {item.pushHeadShort && (
          <span className="tabular-nums text-term-link">
            {item.pushHeadShort}
          </span>
        )}
      </div>
    </div>
  );
}

/** Last cell of the events grid: where the feed stands (a live status). */
function StatusCell({ text, username }: { text: string; username: string }) {
  return (
    <div className="flex h-(--row) w-full flex-col gap-3 px-5 py-5 md:px-8 md:py-6">
      <span className="text-xs text-muted-foreground" aria-hidden>
        →
      </span>
      <p
        role="status"
        aria-live="polite"
        className="flex-1 text-base font-medium leading-snug text-bright"
      >
        {text}
      </p>
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noreferrer"
        className="truncate text-xs text-term-link"
      >
        github.com/{username}
      </a>
    </div>
  );
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

  const loadingMore = fetcher.state !== "idle";

  const total = items.length;

  return (
    // Flush with header and footer: the page is one stack of boxes.
    <div className="-mt-10 -mb-16 w-full text-sm leading-7 md:-mt-12 md:-mb-20 md:text-[0.9375rem]">
      <section
        aria-labelledby="activity-title"
        className={cn(
          "grid-cross relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3",
          BLEED,
        )}
      >
        <div
          data-tile
          className="flex min-h-32 flex-col justify-between gap-6 bg-background px-5 py-5 sm:col-span-2 md:px-8 md:py-6 lg:col-span-1 lg:h-(--row)"
        >
          <span className="text-xs text-muted-foreground">github.com</span>
          <h1
            id="activity-title"
            className="font-display text-[2rem] leading-none font-normal tracking-[-0.02em] text-bright italic md:text-[2.375rem]"
          >
            Activity
          </h1>
        </div>
        <div
          data-tile
          className="flex min-h-32 flex-col justify-between gap-3 bg-background px-5 py-5 sm:col-span-2 md:px-8 md:py-6 lg:h-(--row)"
        >
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <a
              href={`https://github.com/${username}`}
              className="term-link"
              target="_blank"
              rel="noreferrer"
            >
              @{username}
            </a>
            <span className="tabular-nums">last {WINDOW_DAYS} days</span>
          </div>
          <p className="text-muted-foreground">
            Public events: pushes, pull requests, branches and stars,{" "}
            <span className="text-bright tabular-nums">{total}</span> loaded so
            far.
          </p>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {fromApi ? "GitHub: " : ""}
              {error}
              {rateLimitRemaining != null && rateLimitRemaining <= 10 && (
                <span className="mt-1 block text-sm text-muted-foreground">
                  rate limit remaining: {rateLimitRemaining}
                </span>
              )}
            </p>
          )}
        </div>
      </section>

      {items.length === 0 && !error ? (
        <section
          className={cn("grid-cross relative border-t border-border", BLEED)}
        >
          <p
            data-tile
            className="bg-background px-5 py-8 text-muted-foreground md:px-8"
          >
            no recent public events.
          </p>
        </section>
      ) : (
        <div aria-label="Activity timeline">
          <section
            aria-label="Events"
            className={cn("grid-cross relative border-t border-border", BLEED)}
          >
            <GridCells
              label="Events"
              items={[...items.map((item) => ({ item })), { item: undefined }]}
              cellKey={(c) => c.item?.id ?? "status"}
              renderCell={(c, i) =>
                c.item ? (
                  <EventCell item={c.item} index={i} />
                ) : (
                  <StatusCell
                    text={
                      loadingMore
                        ? "loading more"
                        : hasMore
                          ? "scroll for more"
                          : `end of the last ${WINDOW_DAYS} days`
                    }
                    username={username}
                  />
                )
              }
            />
          </section>

          {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
        </div>
      )}
    </div>
  );
}
