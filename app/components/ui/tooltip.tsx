import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Lightweight, dependency-free tooltip.
 *
 * Shows on pointer hover AND keyboard focus (group-focus-within), so it's
 * accessible without JS state. The bubble is decorative (aria-hidden via the
 * role); keep a real label on the trigger child when the tooltip is the only
 * text.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content?: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  if (!content) return <>{children}</>;

  const top = side === "top";

  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2",
          "max-w-[min(22rem,78vw)] whitespace-nowrap rounded-md px-2.5 py-1",
          "border border-white/12 bg-[oklch(0.235_0.005_286)] text-[11px] font-medium tracking-tight text-foreground",
          "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]",
          "opacity-0 transition duration-150 ease-out",
          "group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          top
            ? "bottom-full mb-2 origin-bottom translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0"
            : "top-full mt-2 origin-top -translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0",
          className,
        )}
      >
        {content}
        <span
          aria-hidden
          className={cn(
            "absolute left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[oklch(0.235_0.005_286)]",
            top
              ? "top-full -mt-1 border-b border-r border-white/12"
              : "bottom-full -mb-1 border-l border-t border-white/12",
          )}
        />
      </span>
    </span>
  );
}
