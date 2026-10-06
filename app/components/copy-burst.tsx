import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DottedGlowBackground } from "~/components/ui/dotted-glow-background";

const DURATION = 1100;

type Shot = { id: number; x: number; y: number };

/**
 * "Copied" ripple: a ring of glowing amber dots expands from the button that
 * was clicked and sweeps across the cell, over a soft flash at the origin.
 *
 * Put `ref` on a `relative isolate` cell, render `burst` inside it, and call
 * `fire(buttonElement)` after a successful copy. Skipped under reduced motion.
 */
export function useCopyBurst<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const fire = useCallback((source?: Element | null) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cell = ref.current?.getBoundingClientRect();
    const from = source?.getBoundingClientRect();
    // Ripple origin: centre of the clicked button, in cell coordinates.
    const x = cell && from ? from.left + from.width / 2 - cell.left : 0;
    const y = cell && from ? from.top + from.height / 2 - cell.top : 0;
    setShot((prev) => ({ id: (prev?.id ?? 0) + 1, x, y }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShot(null), DURATION);
  }, []);

  const burst = shot ? (
    <div
      key={shot.id}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ "--x": `${shot.x}px`, "--y": `${shot.y}px` } as CSSProperties}
    >
      <div className="copy-flash absolute inset-0" />
      <div className="copy-ripple absolute inset-0">
        <DottedGlowBackground
          gap={6}
          radius={1.4}
          color="rgba(196,120,20,0.55)"
          darkColor="rgba(245,185,90,0.7)"
          glowColor="rgba(196,120,20,1)"
          darkGlowColor="rgba(255,200,110,1)"
          opacity={1}
          speedMin={3}
          speedMax={7}
        />
      </div>
    </div>
  ) : null;

  return { ref, fire, burst };
}
