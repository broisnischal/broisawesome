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
        "inline-flex shrink-0 rounded-full border border-neutral-300/80 bg-white/90 p-0.5 text-[11px] font-medium shadow-sm backdrop-blur-sm dark:border-neutral-600 dark:bg-neutral-900/90",
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
            ? "bg-neutral-200/50 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
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
            ? "bg-neutral-200/50 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
        )}
      >
        Writing
      </Link>
    </div>
  );
}
