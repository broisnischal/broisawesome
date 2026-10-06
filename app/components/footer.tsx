import { useEffect, useMemo } from "react";
import { Link, useFetcher } from "react-router";

import {
  PORTFOLIO_REPO_URL,
  formatBuildDate,
  getBuildInfo,
  getBuildLog,
  type BuildCommit,
} from "~/lib/build-meta";
import { CommitPhysics } from "~/components/commit-physics";
import { cn } from "~/lib/utils";
import { ThemeSwitch, useThemeMode } from "~/routes/resources/theme-switch";

type FooterItem = { label: string; to?: string; href?: string };

const FOOTER_GROUPS: Array<{ title: string; items: FooterItem[] }> = [
  {
    title: "Explore",
    items: [
      { to: "/", label: "home" },
      { to: "/blog", label: "blog" },
      { to: "/activity", label: "activity" },
      { to: "/links", label: "links" },
      // { to: "/use", label: "uses" }, // uses page is off for now
      { to: "/chess", label: "chess" },
    ],
  },
  {
    title: "Docs",
    items: [
      { href: "/resume.pdf", label: "resume.pdf" },
      { href: "/llms.txt", label: "llms.txt" },
    ],
  },
  {
    title: "Feeds",
    items: [
      { href: "/blogs.rss", label: "blogs.rss" },
      { href: "/feed.json", label: "feed.json" },
    ],
  },
];

function FooterLink({ label, to, href }: FooterItem) {
  const className =
    "inline-flex min-h-6 items-center text-muted-foreground transition-colors hover:text-bright";

  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} className={className}>
      {label}
    </Link>
  );
}

/** A footer box: same padding and height as the cells on the page above. */
const BOX =
  "flex flex-col gap-3 bg-background px-5 py-5 md:px-8 md:py-6 lg:h-(--row)";

/**
 * Bottom row: a compact bar on small screens, full 192px tiles on desktop
 * (label on top, value at the bottom) like every other row.
 */
const BAR =
  "flex min-h-14 items-center gap-3 bg-background px-5 md:px-8 lg:h-(--row) lg:flex-col lg:items-start lg:justify-between lg:py-6";
const BAR_LABEL =
  "hidden text-xs uppercase tracking-[0.16em] text-muted-foreground lg:block";

type TickerCommit = BuildCommit & { repo?: string; url?: string };

/**
 * My latest public commits across all repos (falls back to this site's own
 * build-time log if GitHub can't be reached). Nothing renders until the list
 * arrives, so rows never visibly swap.
 */
function useTickerCommits(fallback: BuildCommit[]): TickerCommit[] {
  const fetcher = useFetcher<{ commits: TickerCommit[] }>();
  const load = fetcher.load;
  useEffect(() => {
    load("/resources/recent-commits");
  }, [load]);
  if (!fetcher.data) return [];
  return fetcher.data.commits.length ? fetcher.data.commits : fallback;
}

export function Footer() {
  const { version, commit, modified } = getBuildInfo();
  const log = useTickerCommits(getBuildLog());
  // Stable list, so a re-render (theme switch, etc.) doesn't re-drop them.
  const commits = useMemo(
    () =>
      log.map((c) => ({
        ...c,
        url: c.url ?? `${PORTFOLIO_REPO_URL}/commit/${c.hash}`,
      })),
    [log],
  );
  const commitUrl = `${PORTFOLIO_REPO_URL}/commit/${commit}`;
  const themeMode = useThemeMode();

  return (
    <footer className="grid-cross relative mt-auto border-t border-border bg-background font-mono text-sm">
      {/* One box per group on the page's 3-column grid; lines are 1px gaps. */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FOOTER_GROUPS.map((group) => {
          const id = `footer-${group.title.toLowerCase()}`;
          return (
            <nav
              key={group.title}
              data-tile
              aria-labelledby={id}
              className={BOX}
            >
              <h2
                id={id}
                className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                {group.title}
              </h2>
              <ul
                className={cn(
                  "grid gap-x-6 gap-y-1",
                  // Explore has six links: two columns keep the box short.
                  group.items.length > 3 && "grid-cols-2",
                )}
              >
                {group.items.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </nav>
          );
        })}
        {/* Two columns leave a hole after the third box; fill it. */}
        <div
          data-tile
          aria-hidden
          className="hidden bg-background sm:block lg:hidden"
        />
      </div>

      <div
        className="grid grid-cols-1 gap-px border-t border-border bg-border text-xs text-muted-foreground tabular-nums sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Build version, last modified date, commit, and theme"
      >
        <div data-tile className={BAR}>
          <span className={BAR_LABEL}>version</span>
          <span className="flex items-center gap-3">
            <span className="text-foreground">v{version}</span>
            <span title="last deploy">updated {formatBuildDate(modified)}</span>
          </span>
        </div>
        <div
          data-tile
          className={cn(
            BAR,
            // select-none: flinging a pill mustn't select the label text.
            "relative isolate overflow-hidden lg:justify-start lg:select-none",
          )}
        >
          <span className="relative z-10 flex w-full items-center justify-between gap-3">
            <span className={BAR_LABEL}>commit</span>
            <span className="flex items-center gap-3">
              <span className="lg:hidden">commit</span>
              <a
                href={commitUrl}
                target="_blank"
                rel="noreferrer"
                className="term-link"
                title="view commit on GitHub"
              >
                {commit}
              </a>
            </span>
          </span>
          {commits.length > 0 && (
            <CommitPhysics commits={commits} className="hidden lg:block" />
          )}
        </div>
        <div data-tile className={BAR}>
          <span className={BAR_LABEL}>theme</span>
          <ThemeSwitch userPreference={themeMode} labelClassName="lg:hidden" />
        </div>
        <div
          data-tile
          aria-hidden
          className="hidden bg-background sm:block lg:hidden"
        />
      </div>
    </footer>
  );
}
