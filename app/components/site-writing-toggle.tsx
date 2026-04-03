import { Link, useLocation } from "react-router";

import { cn } from "~/lib/utils";

/**
 * Segmented control: full site vs minimal “Writing” archive (light, list-only).
 */
export function SiteWritingToggle({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const onWriting = pathname === "/writing";

  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-full border border-border bg-background/95 p-0.5 text-xs font-medium shadow-sm",
        className,
      )}
      role="group"
      aria-label="Site view"
    >
      <Link
        to="/"
        prefetch="intent"
        viewTransition
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          !onWriting
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Site
      </Link>
      <Link
        to="/writing"
        prefetch="intent"
        viewTransition
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          onWriting
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Writing
      </Link>
    </div>
  );
}
