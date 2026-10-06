import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { CANONICAL_SITE_URL } from "~/lib/meta";
import { cn } from "~/lib/utils";

/**
 * Copies the post as plain markdown-ish text for pasting into an LLM.
 *
 * Reads the rendered article body from the DOM (`[data-blog-body]`) at click
 * time, prefixed with the title + source URL. Client-only.
 */
export function CopyForLLM({
  title,
  url,
  date,
}: {
  title: string;
  url: string;
  date?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const body =
      document.querySelector<HTMLElement>("[data-blog-body]")?.innerText ?? "";
    const header = [
      `# ${title}`,
      `Source: ${url}`,
      date ? `Date: ${date}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const text = `${header}\n\n${body}`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (non-secure context); fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy this page as text for an LLM"
      className={cn(
        "shrink-0 text-xs text-muted-foreground transition-colors",
        "hover:text-term-link focus-visible:text-term-link",
      )}
    >
      {copied ? "copied ✓" : "copy for LLM"}
    </button>
  );
}

const ICON =
  "col-start-1 row-start-1 size-3 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";
const SHOWN = "scale-100 opacity-100 blur-0";
const HIDDEN = "scale-25 opacity-0 blur-[4px]";

/**
 * "copy for LLM" on a post card, away from the post page: fetches the post's
 * markdown from /resources/post-text and copies it with a title + source
 * header. Sits above the card's stretched link (z-10).
 */
export function CopyPostForLLM({
  slug,
  title,
  date,
  onCopied,
}: {
  slug: string;
  title: string;
  date?: string;
  /** Called after a successful copy with the button, e.g. to fire a ripple from it. */
  onCopied?: (button: HTMLButtonElement) => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    const button = e.currentTarget;
    const header = [
      `# ${title}`,
      `Source: ${CANONICAL_SITE_URL}/blog/${slug}`,
      date ? `Date: ${date}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const text = fetch(`/resources/post-text?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.text() : ""))
      .then((body) => `${header}\n\n${body}`.trim());

    try {
      // Handing ClipboardItem a promise keeps the click's user activation
      // alive across the fetch (Safari drops it otherwise).
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": text.then(
              (t) => new Blob([t], { type: "text/plain" }),
            ),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await text);
      }
      setCopied(true);
      onCopied?.(button);
    } catch {
      try {
        await navigator.clipboard.writeText(await text);
        setCopied(true);
        onCopied?.(button);
      } catch {
        // Clipboard unavailable (insecure context); nothing to do.
      }
    }
  }

  return (
    <span className="relative z-10 shrink-0">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy "${title}" as text for an LLM`}
        className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-xs text-xs text-muted-foreground transition-colors after:absolute after:-inset-x-[4px] after:-inset-y-[6px] hover:text-bright"
      >
        <span className="inline-grid place-items-center" aria-hidden>
          <Copy className={cn(ICON, copied ? HIDDEN : SHOWN)} />
          <Check
            className={cn(ICON, "text-term-link", copied ? SHOWN : HIDDEN)}
          />
        </span>
        {copied ? "copied" : "copy for LLM"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </span>
  );
}
