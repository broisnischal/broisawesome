/**
 * Terminal UI kit.
 *
 * The whole site is styled as a raw-markdown document rendered in a terminal:
 * monospace, CAPS section labels, `~~~` dividers, and links shown literally as
 * `[label](href)` where the href is the magenta, underlined part you can click.
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

/** Markdown thematic break, rendered as the literal `---`. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "my-7 select-none tracking-[0.3em] text-muted-foreground/45 md:my-9",
        className,
      )}
      aria-hidden
    >
      ---
    </div>
  );
}

/** Section heading (plain, no markdown marker). */
export function SectionLabel({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const text =
    typeof children === "string" ? children.replace(/:\s*$/, "") : children;
  return (
    <p
      id={id}
      className={cn("font-medium text-bright", className)}
    >
      {text}
    </p>
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
      <span className="select-none text-muted-foreground/60">[</span>
      <span
        className={cn(
          "text-foreground group-hover:text-bright",
          strike && "line-through decoration-muted-foreground/70",
        )}
      >
        {label}
      </span>
      <span className="select-none text-muted-foreground/60">](</span>
      <span className="term-link">{shown}</span>
      <span className="select-none text-muted-foreground/60">)</span>
    </>
  );

  // `inline` (not inline-flex) so long labels wrap as normal text instead of
  // breaking the `[label](url)` punctuation across lines. `overflow-wrap`
  // lets long unbroken URLs in `display` wrap instead of overflowing on mobile.
  const classes = cn(
    "group rounded-xs outline-none transition-colors [overflow-wrap:anywhere]",
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );

  // Native title reveals the full destination (useful when `display` is shortened).
  const tip = target && target !== "#" ? target : undefined;

  if (external || !to) {
    return (
      <a
        href={target}
        title={tip}
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
    <Link to={to} title={tip} className={classes}>
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
  return (
    <ul className={cn("mt-3 space-y-1.5", className)}>{children}</ul>
  );
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
      <span className="select-none text-muted-foreground/60" aria-hidden>
        -
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}
