import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  CircleDot,
  FileCode,
  FolderGit2,
  GitCommit,
  GitFork,
  GitPullRequest,
  Globe,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  GitHubActivityAccent,
  GitHubActivityIcon,
  GitHubActivityItem,
} from "~/.server/github-activity";
import { cn } from "~/lib/utils";

/** Timeline dot ring — neutral; glyph color comes from `iconAccent`. */
const ICON_WRAP =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm";

/** Text links only — no per-event hue (foreground + muted chrome). */
const LINK = {
  structuredRepo: "font-medium text-foreground",
  looseLink: "text-foreground",
  detailLink: "text-foreground",
} as const;

/** Event-type color on the Lucide glyph only (stroke via currentColor). */
const ICON_ACCENT: Record<GitHubActivityAccent, string> = {
  push: "text-emerald-600 dark:text-emerald-400",
  merge: "text-violet-600 dark:text-violet-400",
  pr_open: "text-amber-600 dark:text-amber-400",
  pr: "text-sky-600 dark:text-sky-400",
  star: "text-amber-500 dark:text-amber-400",
  issue_open: "text-amber-600 dark:text-amber-400",
  issue_closed: "text-emerald-600 dark:text-emerald-400",
  issue: "text-sky-600 dark:text-sky-400",
  create: "text-cyan-600 dark:text-cyan-400",
  fork: "text-orange-600 dark:text-orange-400",
  release: "text-indigo-600 dark:text-indigo-400",
  public: "text-teal-600 dark:text-teal-400",
  delete: "text-red-600 dark:text-red-400",
  default: "text-muted-foreground",
};

function iconAccentClass(accent: GitHubActivityAccent) {
  return ICON_ACCENT[accent] ?? ICON_ACCENT.default;
}

function ExternalTextLink({
  href,
  className,
  spanClassName,
  children,
}: {
  href: string;
  className?: string;
  spanClassName?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-sm",
        className,
      )}
    >
      <span
        className={cn(
          "min-w-0 underline decoration-transparent underline-offset-[3px] transition-[text-decoration-color,opacity] group-hover:underline group-hover:decoration-current",
          spanClassName,
        )}
      >
        {children}
      </span>
      <ArrowUpRight
        className="size-3 shrink-0 text-muted-foreground opacity-60 transition-[opacity,color] group-hover:text-foreground/55 group-hover:opacity-90"
        strokeWidth={2}
        aria-hidden
      />
    </a>
  );
}

function pushTimelineLinkLabel(item: GitHubActivityItem): string {
  if (item.pushHeadShort) return item.pushHeadShort;
  const commitMatch = item.href.match(/\/commit\/([0-9a-f]{7,40})/i);
  if (commitMatch?.[1]) return commitMatch[1].slice(0, 7);
  const compareTip = item.href.match(/\.\.\.([0-9a-f]{7,40})(?:\?|$|#)/i);
  if (compareTip?.[1]) return compareTip[1].slice(0, 7);
  return item.href.includes("/compare/") ? "Compare" : "View commit";
}

function PushDetailLink({
  item,
  className,
}: {
  item: GitHubActivityItem;
  className?: string;
}) {
  if (item.eventType !== "PushEvent" || item.href === item.repoUrl) {
    return null;
  }
  const label = pushTimelineLinkLabel(item);
  const isShortSha = /^[0-9a-f]{7}$/i.test(label);
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-0", className)}>
      <span className="text-muted-foreground"> · </span>
      <ExternalTextLink
        href={item.href}
        className={cn(LINK.detailLink, "inline-flex")}
        spanClassName={cn(
          isShortSha && "font-mono text-[0.8rem] tabular-nums sm:text-xs",
        )}
      >
        {label}
      </ExternalTextLink>
    </span>
  );
}

const ICON_MAP: Record<GitHubActivityIcon, LucideIcon> = {
  commit: GitCommit,
  repo: FolderGit2,
  star: Star,
  fork: GitFork,
  issue: CircleDot,
  pr: GitPullRequest,
  release: Tag,
  public: Globe,
  delete: Trash2,
  gist: FileCode,
  default: Activity,
};

type RowVariant = "feed" | "timeline";

export function GithubActivityRow({
  item,
  variant = "feed",
  isLast,
  timeFormat = "date",
}: {
  item: GitHubActivityItem;
  variant?: RowVariant;
  isLast?: boolean;
  timeFormat?: "date" | "time";
}) {
  const Icon = ICON_MAP[item.icon] ?? Activity;
  const structured =
    item.action != null && item.repoLabel != null && item.repoUrl != null;
  const iconClass = iconAccentClass(item.accent);
  const timeStr =
    timeFormat === "time"
      ? new Date(item.createdAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(item.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

  const body = structured ? (
    <p className="text-sm text-foreground leading-snug min-w-0">
      <span className="text-muted-foreground">{item.action}</span>
      <ExternalTextLink href={item.repoUrl!} className={LINK.structuredRepo}>
        {item.repoLabel}
      </ExternalTextLink>
      {item.tail ? (
        <span className="text-muted-foreground">{item.tail}</span>
      ) : null}
    </p>
  ) : (
    <p className="text-sm leading-snug min-w-0">
      <ExternalTextLink href={item.href} className={LINK.looseLink}>
        {item.title}
      </ExternalTextLink>
    </p>
  );

  if (variant === "feed") {
    return (
      <div className="flex gap-3 py-2.5 border-b border-border/80 last:border-b-0">
        <div className={cn("mt-0.5", ICON_WRAP)} aria-hidden>
          <Icon className={cn("h-4 w-4", iconClass)} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 pr-2">
          {body}
          {item.subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {item.subtitle}
              <PushDetailLink item={item} />
            </p>
          ) : (
            <PushDetailLink item={item} className="mt-0.5" />
          )}
        </div>
        <time
          className="shrink-0 text-xs text-muted-foreground tabular-nums pt-0.5"
          dateTime={item.createdAt}
        >
          {timeStr}
        </time>
      </div>
    );
  }

  return (
    <li className="relative flex gap-3 pb-8 last:pb-0">
      {!isLast ? (
        <span
          className="pointer-events-none absolute left-4 top-0 bottom-0 w-px -translate-x-1/2 bg-border"
          aria-hidden
        />
      ) : null}
      <div className="relative z-10 flex w-8 shrink-0 justify-center">
        <div className={ICON_WRAP} aria-hidden>
          <Icon className={cn("h-4 w-4", iconClass)} strokeWidth={1.75} />
        </div>
      </div>
      <div className="relative z-10 min-w-0 flex-1 pt-0.5">
        {body}
        {item.subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {item.subtitle}
            <PushDetailLink item={item} />
          </p>
        ) : (
          <PushDetailLink item={item} className="mt-1" />
        )}
        <time
          className="mt-1 block text-xs text-muted-foreground tabular-nums"
          dateTime={item.createdAt}
        >
          {timeStr}
        </time>
      </div>
    </li>
  );
}
