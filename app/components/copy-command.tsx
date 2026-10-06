import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const ICON =
  "col-start-1 row-start-1 size-3.5 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";
const SHOWN = "scale-100 opacity-100 blur-0";
const HIDDEN = "scale-25 opacity-0 blur-[4px]";

/**
 * `$ npx some-package install` with a copy button. Sits above a card's
 * stretched link (z-10) so the text stays selectable and the button clickable.
 */
export function CopyCommand({
  command,
  className,
  onCopied,
  prompt = "$",
}: {
  command: string;
  className?: string;
  /** Shown before the command; `null` for a bare value like a promo code. */
  prompt?: string | null;
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
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      onCopied?.(button);
    } catch {
      // Clipboard can be unavailable (insecure context); the text stays selectable.
    }
  }

  return (
    <span
      className={cn("relative z-10 flex min-w-0 items-center gap-2", className)}
    >
      <code className="truncate text-foreground">
        {prompt && (
          <span className="select-none text-faint" aria-hidden>
            {prompt}{" "}
          </span>
        )}
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${prompt ? "command" : "code"}: ${command}`}
        className="relative inline-grid size-4 shrink-0 cursor-pointer place-items-center rounded-xs text-muted-foreground transition-colors after:absolute after:-inset-[4px] hover:text-bright"
      >
        {/* Both icons stay mounted and cross-fade, so the swap can't jump. */}
        <Copy aria-hidden className={cn(ICON, copied ? HIDDEN : SHOWN)} />
        <Check
          aria-hidden
          className={cn(ICON, "text-term-link", copied ? SHOWN : HIDDEN)}
        />
      </button>
      {/* Stable, always-mounted region so the announcement fires every time. */}
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </span>
  );
}
