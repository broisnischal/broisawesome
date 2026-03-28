import type { LucideIcon } from "lucide-react";
import {
  Activity,
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
import type {
  GitHubActivityIcon,
  GitHubActivityItem,
} from "~/.server/github-activity";
import { cn } from "~/lib/utils";

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
  const label = item.href.includes("/compare/") ? "Compare" : "View commit";
  return (
    <span className={cn("inline", className)}>
      <span className="text-muted-foreground"> · </span>
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="text-[#0969da] hover:underline dark:text-[#58a6ff]"
      >
        {label}
      </a>
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
      <a
        href={item.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-[#0969da] hover:underline dark:text-[#58a6ff]"
      >
        {item.repoLabel}
      </a>
      {item.tail ? (
        <span className="text-muted-foreground">{item.tail}</span>
      ) : null}
    </p>
  ) : (
    <p className="text-sm leading-snug min-w-0">
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="text-foreground hover:text-[#0969da] dark:hover:text-[#58a6ff]"
      >
        {item.title}
      </a>
    </p>
  );

  if (variant === "feed") {
    return (
      <div className="flex gap-3 py-2.5 border-b border-border/80 last:border-b-0">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground"
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
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
      {/* Full-height spine so segments meet the next row; icon sits above with solid bg */}
      {!isLast ? (
        <span
          className="pointer-events-none absolute left-4 top-0 bottom-0 w-px -translate-x-1/2 bg-border"
          aria-hidden
        />
      ) : null}
      <div className="relative z-10 flex w-8 shrink-0 justify-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm",
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
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
