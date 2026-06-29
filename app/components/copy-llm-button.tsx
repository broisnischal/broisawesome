import { useState } from "react";
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
    const header = [`# ${title}`, `Source: ${url}`, date ? `Date: ${date}` : null]
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
        "hover:text-term-link focus-visible:outline-none focus-visible:text-term-link",
      )}
    >
      {copied ? "copied ✓" : "copy for LLM"}
    </button>
  );
}
