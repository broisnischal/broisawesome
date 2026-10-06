/**
 * Terminal UI kit.
 *
 * The whole site is a grid-line page: a framed column with hairline rails,
 * sections as bordered bands with CAPS labels, monospace throughout, and links
 * shown literally as `[label](href)` where the href is the amber part.
 *
 * Keep these primitives small and composable — pages are mostly just lists of
 * <MdLink /> rows under a <SectionLabel />, separated by <Squiggle />.
 */
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}

/** Blinking block cursor — drop it after a heading for the terminal feel. */
export function Cursor({ className }: { className?: string }) {
  return <span className={cn("term-cursor", className)} aria-hidden />;
}

/**
 * Section break: a hairline that runs rail to rail (it bleeds through the
 * page padding) with a + where it meets each rail.
 */
export function Squiggle({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid-cross relative -mx-5 my-10 border-t border-border md:-mx-8 md:my-12",
        className,
      )}
      aria-hidden
    />
  );
}

/**
 * Section heading (plain, no markdown marker). Renders a real heading so the
 * page has an outline screen readers can jump through; `as` picks the level.
 */
export function SectionLabel({
  children,
  className,
  id,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p";
}) {
  const text =
    typeof children === "string" ? children.replace(/:\s*$/, "") : children;
  return (
    <Tag
      id={id}
      className={cn(
        "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
    >
      {text}
    </Tag>
  );
}

/** `LABEL: value` metadata line (CONTACT, LOCATION, STATUS, …). */
export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-muted-foreground", className)}>
      <span className="text-bright uppercase tracking-[0.12em]">{label}:</span>{" "}
      <span className="text-foreground uppercase tracking-wide">{children}</span>
    </p>
  );
}

type MdLinkProps = {
  /** Text shown inside the `[ ]`. */
  label: ReactNode;
  /** Destination. Use `to` instead for internal links you want prefetched. */
  href?: string;
  to?: string;
  /** What the magenta `( )` part displays. Defaults to `href`/`to`. */
  display?: ReactNode;
  /** Render the label with a strikethrough (e.g. retired projects). */
  strike?: boolean;
  className?: string;
};

/**
 * A markdown-style link: `[label](display)` where `display` is the clickable
 * magenta segment. The whole row is clickable; the brackets are non-selectable
 * punctuation so copying grabs clean text.
 */
export function MdLink({
  label,
  href,
  to,
  display,
  strike,
  className,
}: MdLinkProps) {
  const target = to ?? href ?? "#";
  const shown = display ?? target;
  const external = isExternal(target);

  const body = (
    <>
      <span className="select-none text-faint">[</span>
      <span
        className={cn(
          "text-foreground group-hover:text-bright",
          strike && "line-through decoration-faint",
        )}
      >
        {label}
      </span>
      <span className="select-none text-faint">](</span>
      <span className="term-link">{shown}</span>
      <span className="select-none text-faint">)</span>
    </>
  );

  // `inline` (not inline-flex) so long labels wrap as normal text instead of
  // breaking the `[label](url)` punctuation across lines. `overflow-wrap`
  // lets long unbroken URLs in `display` wrap instead of overflowing on mobile.
  // Focus uses the global :focus-visible outline (app.css).
  const classes = cn(
    "group rounded-xs transition-colors [overflow-wrap:anywhere]",
    className,
  );

  if (external || !to) {
    return (
      <a
        href={target}
        className={classes}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {body}
      </a>
    );
  }

  // No hover-prefetch: several routes have external-API loaders, so
  // prefetching on every mouseover caused noticeable jank.
  return (
    <Link to={to} className={classes}>
      {body}
    </Link>
  );
}

/** A `- ` bulleted list of MdLink rows (the core building block of pages). */
export function MdList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ul className={cn("mt-3 space-y-1.5", className)}>{children}</ul>;
}

export function MdListItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex gap-2", className)}>
      <span className="select-none text-faint" aria-hidden>
        -
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}
