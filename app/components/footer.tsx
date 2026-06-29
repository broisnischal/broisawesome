import { Link } from "react-router";

import {
  PORTFOLIO_REPO_URL,
  formatBuildDate,
  getBuildInfo,
} from "~/lib/build-meta";
import { cn } from "~/lib/utils";

type FooterItem = { label: string; to?: string; href?: string };

const FOOTER_GROUPS: Array<{ title: string; items: FooterItem[] }> = [
  {
    title: "Explore",
    items: [
      { to: "/", label: "home" },
      { to: "/blog", label: "blog" },
      { to: "/activity", label: "activity" },
      { to: "/links", label: "links" },
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
  const className = cn(
    "inline-flex items-center whitespace-nowrap text-muted-foreground",
    "transition-colors hover:text-term-link",
  );

  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        title={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} title={to} className={className}>
      {label}
    </Link>
  );
}

export function Footer() {
  const { version, commit, modified } = getBuildInfo();
  const commitUrl = `${PORTFOLIO_REPO_URL}/commit/${commit}`;

  return (
    <footer className="mt-auto border-t border-border/60 bg-background font-mono text-sm">
      <div className="max-w-none px-5 py-10 md:px-10 md:py-12">
        <div className="flex flex-wrap gap-x-16 gap-y-8">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title} className="min-w-28">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/45">
                {group.title}
              </p>
              <ul className="mt-3.5 space-y-2">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          className="my-8 select-none tracking-[0.3em] text-muted-foreground/40"
          aria-hidden
        >
          ---
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p
            className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums"
            aria-label="Build version, last modified date, and commit"
          >
            <span className="text-foreground/80">v{version}</span>
            <span className="opacity-90" title="last deploy">
              updated {formatBuildDate(modified)}
            </span>
            <a
              href={commitUrl}
              target="_blank"
              rel="noreferrer"
              className="term-link"
              title="view commit on GitHub"
            >
              {commit}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
