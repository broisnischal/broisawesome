import { RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CopyCommand } from "~/components/copy-command";
import { celebrate } from "~/lib/confetti";
import { useTheme } from "~/routes/resources/theme-switch";

/** Share of the foil that has to come off before the rest clears itself. */
const REVEAL_AT = 0.75;
/** Brush width in CSS px: narrow, so it takes a few real passes. */
const BRUSH = 12;

/** Foil per theme: gradient stops, speckle tones, and label ink. */
const FOIL = {
  dark: {
    stops: ["#4a4a52", "#7a7a84", "#55555e", "#8a8a94", "#4a4a52"],
    speck: ["rgba(255,255,255,0.18)", "rgba(0,0,0,0.25)"],
    label: "#1c1c20",
  },
  light: {
    stops: ["#b9b6ae", "#e4e1da", "#c4c1b9", "#efece6", "#b9b6ae"],
    speck: ["rgba(255,255,255,0.5)", "rgba(0,0,0,0.12)"],
    label: "#5a554c",
  },
} as const;

type Offer = {
  /** e.g. "20% off" */
  off: string;
  /** e.g. "20% off Stroke": the unlock card's headline */
  title: string;
  href: string;
  hrefLabel: string;
};

/**
 * A scratch card over the whole offer ("20% off with code STROKE20"). Press
 * and drag (mouse, touch or pen) to scratch the foil; past three quarters it
 * clears itself, fires confetti and shows an unlock card. Remembered in
 * localStorage; a "cover again" button resets it. Keyboard: Enter/Space on
 * the card reveals it.
 */
export function ScratchCode({
  code,
  storageKey,
  offer,
  onCopied,
}: {
  code: string;
  storageKey: string;
  offer: Offer;
  onCopied?: (button: HTMLButtonElement) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const theme = useTheme();

  // Returning visitor: read the unlock before drawing any foil.
  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) setRevealed(true);
    } catch {
      // Storage blocked: they scratch again next time.
    }
    setReady(true);
  }, [storageKey]);

  // The unlock card carries actions (copy, link): it stays until dismissed.
  useEffect(() => {
    if (!toast) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToast(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toast]);

  const reveal = useCallback(() => {
    if (revealed || clearing) return;
    setClearing(true);
    setToast(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // Not persisted; fine.
    }
    celebrate();
    // Let the leftover foil fade, then drop it.
    window.setTimeout(() => {
      setRevealed(true);
      setClearing(false);
    }, 350);
  }, [revealed, clearing, storageKey]);

  /** Put the foil back (and forget the unlock) so it can be scratched again. */
  const cover = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Nothing stored; fine.
    }
    setToast(false);
    setRevealed(false);
  };

  // Paint the foil: metallic gradient, a diagonal sheen, speckle texture,
  // and the "scratch to reveal" label.
  useEffect(() => {
    const el = canvas.current;
    if (!el || revealed || !ready) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = el.getBoundingClientRect();
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const foil = FOIL[theme === "dark" ? "dark" : "light"];

    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, width, height);
    foil.stops.forEach((c, i) =>
      g.addColorStop(i / (foil.stops.length - 1), c),
    );
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const sheen = ctx.createLinearGradient(0, 0, width * 0.6, height * 2);
    sheen.addColorStop(0.35, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.22)");
    sheen.addColorStop(0.65, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < width * height * 0.12; i++) {
      ctx.fillStyle = foil.speck[i % 2];
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    ctx.fillStyle = foil.label;
    ctx.font = "600 10px ui-monospace, SFMono-Regular, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("scratch to reveal", width / 2, height / 2 + 0.5);
  }, [revealed, ready, theme]);

  const clearedShare = () => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, el.width, el.height);
    let clear = 0;
    let total = 0;
    // Every 4th pixel is plenty for an estimate.
    for (let i = 3; i < data.length; i += 16, total++)
      if (data[i] < 32) clear++;
    return total ? clear / total : 0;
  };

  const scratchTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const r = el.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    const from = last.current ?? p;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last.current = p;
    // Measuring is the costly part; do it every few moves.
    if (++strokes.current % 6 === 0 && clearedShare() >= REVEAL_AT) reveal();
  };

  const stop = () => {
    last.current = null;
    if (clearedShare() >= REVEAL_AT) reveal();
  };

  const content = (
    <>
      <span className="rounded-xs bg-term-link/12 px-1.5 leading-5 text-term-link-hover">
        {offer.off}
      </span>
      <span className="text-muted-foreground">with code</span>
      <code className="text-foreground">{code}</code>
    </>
  );

  return (
    <>
      <span className="relative z-10 inline-flex min-w-0 items-center gap-2">
        {revealed ? (
          <>
            {content}
            <CopyCommand
              command={code}
              prompt={null}
              onCopied={onCopied}
              className="[&>code]:hidden"
            />
            <button
              type="button"
              onClick={cover}
              aria-label="Cover the code again to scratch it"
              className="relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs text-muted-foreground transition-colors after:absolute after:-inset-[4px] hover:text-bright"
            >
              <RotateCcw className="size-3.5" aria-hidden />
            </button>
          </>
        ) : (
          <button
            type="button"
            // Keyboard activation reveals; pointer users scratch instead.
            onClick={(e) => {
              if (e.detail === 0) reveal();
            }}
            aria-label={`Scratch card hiding a ${offer.off} discount code. Press Enter to reveal it.`}
            className="relative inline-flex h-6 select-none items-center gap-2 rounded-xs px-1.5"
          >
            <span aria-hidden className="inline-flex items-center gap-2">
              {content}
            </span>
            <canvas
              ref={canvas}
              aria-hidden
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                last.current = null;
                scratchTo(e);
              }}
              onPointerMove={(e) => {
                // Only while pressed: hovering never scratches.
                if ((e.buttons & 1) === 1) scratchTo(e);
                else last.current = null;
              }}
              onPointerUp={stop}
              onPointerCancel={() => {
                last.current = null;
              }}
              className={`absolute inset-0 size-full cursor-grab touch-none rounded-xs transition-opacity duration-300 active:cursor-grabbing ${clearing ? "opacity-0" : ""}`}
            />
          </button>
        )}
      </span>

      {toast &&
        createPortal(
          // A small grid card in the site's style: label row, the offer in
          // the display face, then the code and where to use it.
          <div
            role="status"
            className="fixed inset-x-4 bottom-4 z-[1001] border border-border bg-background font-mono text-sm shadow-[0_24px_48px_-16px_rgb(0_0_0/0.45)] animate-in fade-in slide-in-from-bottom-3 duration-300 motion-reduce:animate-none sm:inset-x-auto sm:end-6 sm:bottom-6 sm:w-80"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="rounded-xs bg-term-link/12 px-1.5 text-xs leading-5 text-term-link-hover">
                unlocked
              </span>
              <button
                type="button"
                onClick={() => setToast(false)}
                aria-label="Dismiss"
                className="relative inline-flex size-6 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:text-bright"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="font-display text-[1.75rem] leading-none text-bright italic">
                {offer.title}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                use this code at checkout
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs">
              <CopyCommand command={code} prompt={null} onCopied={onCopied} />
              <a
                href={offer.href}
                target="_blank"
                rel="noreferrer noopener"
                className="term-link shrink-0"
              >
                {offer.hrefLabel} →
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
