import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01";
const DURATION = 420;

/**
 * Terminal-style text scramble: every character shuffles through random
 * glyphs, then resolves left to right. `run()` replays it (wire it to a
 * cell's hover/focus). Spaces stay put; reduced motion skips it.
 *
 * Render `shown` with aria-hidden next to the real text in an sr-only span,
 * so assistive tech never reads the noise.
 */
export function useScramble(text: string) {
  const [shown, setShown] = useState(text);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    setShown(text);
    return () => cancelAnimationFrame(frame.current!);
  }, [text]);

  const run = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(frame.current!);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // Characters before this index are settled; the rest are noise.
      const settled = Math.floor(t * text.length);
      setShown(
        text
          .split("")
          .map((ch, i) =>
            i < settled || ch === " "
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(""),
      );
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [text]);

  return { shown, run };
}

/** Scrambling text with a stable accessible name. */
export function ScrambleText({ text, shown }: { text: string; shown: string }) {
  return (
    <>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}
