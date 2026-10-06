import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type {
  ContributionDay,
  Contributions,
} from "~/.server/github-contributions";
import { cn } from "~/lib/utils";

/**
 * Box fill per GitHub quartile level: amber mixed into the canvas so every
 * box is opaque (the 1px gaps between them then read as one clean line).
 */
const LEVEL = [
  "bg-background",
  "bg-[color-mix(in_oklab,var(--term-link)_28%,var(--background))]",
  "bg-[color-mix(in_oklab,var(--term-link)_52%,var(--background))]",
  "bg-[color-mix(in_oklab,var(--term-link)_76%,var(--background))]",
  "bg-term-link",
] as const;

function formatDay(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * My GitHub contribution calendar as a gapless grid of boxes split by
 * hairlines (like the rest of the site), amber by level, empty days left
 * open, and playable: click (or Space) for Breakout with the lit days as
 * bricks. Shows as many recent weeks as fit as squares across its box, so it
 * fills the box edge to edge; the lines are pixel-snapped grid gaps. Loaded
 * after mount and cached server-side. Screen readers get the total, not 365
 * squares.
 */
export function ContributionGraph({ className }: { className?: string }) {
  const fetcher = useFetcher<{ contributions: Contributions | null }>();
  const load = fetcher.load;

  useEffect(() => {
    load("/resources/contributions");
  }, [load]);

  const data = fetcher.data?.contributions;

  // How many weeks fit as squares: a row is a seventh of the box's height,
  // so the box holds width / (height / 7) columns. Re-measured on resize.
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (height > 0) setFit(Math.max(1, Math.round(width / (height / 7))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The most recent weeks that fit, in column order; a short first week is
  // padded so Sunday stays on top, and a short last week to the bottom.
  const { cells, weeks } = useMemo(() => {
    if (!data || fit === 0) return { cells: [], weeks: 0 };
    const shown = data.weeks.slice(-fit);
    const lead = 7 - (shown[0]?.length ?? 7);
    // This week's days that haven't happened yet: pad them too, or the
    // grid's line colour shows through those slots as solid blocks.
    const trail = 7 - (shown[shown.length - 1]?.length ?? 7);
    return {
      weeks: shown.length,
      cells: [
        ...Array.from({ length: lead }, () => null),
        ...shown.flat(),
        ...Array.from({ length: trail }, () => null),
      ] as Array<ContributionDay | null>,
    };
  }, [data, fit]);

  const game = useBreakout(box, cells, weeks);

  return (
    <div
      ref={box}
      tabIndex={data ? 0 : -1}
      aria-label={
        data
          ? `${data.total.toLocaleString()} GitHub contributions in the last year. Playable: press Space to play Breakout on it, arrow keys move the paddle.`
          : undefined
      }
      onPointerMove={game.onPointerMove}
      onClick={game.start}
      onKeyDown={game.onKeyDown}
      className={cn(
        "group/graph relative size-full cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {data && weeks > 0 && (
        // A CSS grid, not an SVG: the lines are the 1px gaps showing the
        // border colour, so they land on whole pixels and stay sharp (the
        // same way the page's own grid lines are drawn).
        <div
          aria-hidden
          style={{
            gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
          }}
          className="grid size-full grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-px bg-border animate-in fade-in duration-500 motion-reduce:animate-none"
        >
          {cells.map((d, i) =>
            d && !game.broken.has(i) ? (
              <span
                key={d.date}
                title={`${d.count === 0 ? "No" : d.count} ${d.count === 1 ? "contribution" : "contributions"} on ${formatDay(d.date)}`}
                className={LEVEL[d.level] ?? LEVEL[0]}
              />
            ) : (
              <span key={`e-${i}`} className="bg-background" />
            ),
          )}
        </div>
      )}
      {/* Ball, paddle and falling bricks. */}
      <canvas
        ref={game.canvas}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
      />
      {data && (
        <span
          aria-live="polite"
          className={cn(
            "pointer-events-none absolute top-2 left-2 rounded-xs bg-background/90 px-1.5 text-xs leading-5 tabular-nums text-muted-foreground transition-opacity",
            game.status === "idle" &&
              "opacity-0 group-hover/graph:opacity-100 group-focus-visible/graph:opacity-100",
          )}
        >
          {game.status === "idle" &&
            `click to play breakout${game.best ? ` · best ${game.best}` : ""}`}
          {game.status === "playing" && `score ${game.score}`}
          {game.status === "over" &&
            `game over · ${game.score}${game.best ? ` · best ${game.best}` : ""}`}
        </span>
      )}
    </div>
  );
}

const BEST_KEY = "graph-breakout-best";
const BALL_R = 4;
const SPEED = 300; // px per second at the start
const PADDLE_H = 5;

type Status = "idle" | "playing" | "over";

/**
 * Breakout on the contribution graph: lit days are the bricks, a paddle runs
 * along the bottom (mouse or arrow keys), and each brick the ball hits breaks
 * and falls away. Best score is kept in localStorage.
 */
function useBreakout(
  box: React.RefObject<HTMLDivElement | null>,
  cells: Array<ContributionDay | null>,
  weeks: number,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [broken, setBroken] = useState<Set<number>>(() => new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const brokenRef = useRef(broken);
  brokenRef.current = broken;
  const paddleX = useRef(0.5); // 0..1 across the box
  const keys = useRef({ left: false, right: false });

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      // No storage: best resets per visit.
    }
  }, []);

  // A new layout (resize, new data) starts from a clean board.
  useEffect(() => {
    setBroken(new Set());
    setStatus("idle");
  }, [weeks, cells]);

  const start = useCallback(() => {
    if (status === "playing" || weeks === 0) return;
    setBroken(new Set());
    setScore(0);
    setStatus("playing");
  }, [status, weeks]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    paddleX.current = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      start();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      keys.current[e.key === "ArrowLeft" ? "left" : "right"] = true;
      const up = (ev: KeyboardEvent) => {
        if (ev.key === e.key) {
          keys.current[e.key === "ArrowLeft" ? "left" : "right"] = false;
          window.removeEventListener("keyup", up);
        }
      };
      window.addEventListener("keyup", up);
    }
  };

  // The game loop: runs only while playing.
  useEffect(() => {
    if (status !== "playing") return;
    const el = box.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    const css = getComputedStyle(el);
    const ink = css.getPropertyValue("--bright").trim() || "#fff";
    const amber = css.getPropertyValue("--term-link").trim() || "#f5b95a";
    const dpr = window.devicePixelRatio || 1;
    const W = el.clientWidth;
    const H = el.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cw = W / weeks;
    const ch = H / 7;
    const paddleW = Math.max(48, W * 0.09);
    const lit = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return -1;
      const i = Math.floor(x / cw) * 7 + Math.floor(y / ch);
      const d = cells[i];
      return d && d.level > 0 && !brokenRef.current.has(i) ? i : -1;
    };

    let x = paddleX.current * W;
    let y = H - PADDLE_H - BALL_R - 2;
    let speed = SPEED;
    let vx = speed * 0.6 * (Math.random() < 0.5 ? -1 : 1);
    let vy = -speed * 0.8;
    let hits = 0;
    type Piece = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      a: number;
      va: number;
      c: string;
      life: number;
    };
    const pieces: Piece[] = [];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const breakBrick = (i: number) => {
      hits++;
      setScore(hits);
      setBroken((prev) => {
        const next = new Set(prev);
        next.add(i);
        brokenRef.current = next;
        return next;
      });
      speed = Math.min(SPEED * 1.8, speed * 1.02);
      if (!still) {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const level = cells[i]?.level ?? 1;
        pieces.push({
          x: col * cw + cw / 2,
          y: row * ch + ch / 2,
          vx: (Math.random() - 0.5) * 120,
          vy: -80 - Math.random() * 60,
          a: 0,
          va: (Math.random() - 0.5) * 8,
          c: `color-mix(in oklab, ${amber} ${[0, 28, 52, 76, 100][level]}%, transparent)`,
          life: 1,
        });
      }
    };

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      // Paddle from keys (mouse already wrote paddleX).
      if (keys.current.left)
        paddleX.current = Math.max(0, paddleX.current - dt * 1.2);
      if (keys.current.right)
        paddleX.current = Math.min(1, paddleX.current + dt * 1.2);
      const px = Math.min(
        W - paddleW / 2,
        Math.max(paddleW / 2, paddleX.current * W),
      );

      // Keep the speed constant in magnitude.
      const m = Math.hypot(vx, vy) || 1;
      vx = (vx / m) * speed;
      vy = (vy / m) * speed;

      // Move one axis at a time so a brick hit flips the right component.
      let nx = x + vx * dt;
      let hit = lit(nx + Math.sign(vx) * BALL_R, y);
      if (hit >= 0) {
        breakBrick(hit);
        vx = -vx;
        nx = x;
      }
      let ny = y + vy * dt;
      hit = lit(nx, ny + Math.sign(vy) * BALL_R);
      if (hit >= 0) {
        breakBrick(hit);
        vy = -vy;
        ny = y;
      }
      x = nx;
      y = ny;

      if (x < BALL_R) {
        x = BALL_R;
        vx = Math.abs(vx);
      } else if (x > W - BALL_R) {
        x = W - BALL_R;
        vx = -Math.abs(vx);
      }
      if (y < BALL_R) {
        y = BALL_R;
        vy = Math.abs(vy);
      }
      // Paddle: the further from centre it lands, the sharper the bounce.
      const top = H - PADDLE_H - 2;
      if (
        vy > 0 &&
        y + BALL_R >= top &&
        y < top + PADDLE_H &&
        Math.abs(x - px) <= paddleW / 2 + BALL_R
      ) {
        const off = (x - px) / (paddleW / 2);
        vx = speed * off * 0.85;
        vy = -Math.sqrt(
          Math.max(speed * speed - vx * vx, speed * speed * 0.15),
        );
        y = top - BALL_R;
      }

      ctx.clearRect(0, 0, W, H);
      for (const p of pieces) {
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.a += p.va * dt;
        p.life -= dt * 0.9;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-cw / 2 + 1, -ch / 2 + 1, cw - 2, ch - 2);
        ctx.restore();
      }
      for (let k = pieces.length - 1; k >= 0; k--)
        if (pieces[k].life <= 0 || pieces[k].y > H + ch) pieces.splice(k, 1);

      ctx.fillStyle = amber;
      ctx.fillRect(px - paddleW / 2, top, paddleW, PADDLE_H);
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      const cleared = cells.every(
        (d, i) => !d || d.level === 0 || brokenRef.current.has(i),
      );
      if (y > H + BALL_R * 4 || cleared) {
        setStatus("over");
        setBest((b) => {
          const nb = Math.max(b, hits);
          try {
            localStorage.setItem(BEST_KEY, String(nb));
          } catch {
            // Not persisted; fine.
          }
          return nb;
        });
        ctx.clearRect(0, 0, W, H);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  // After a game ends, show the score for a moment, then rebuild the board.
  useEffect(() => {
    if (status !== "over") return;
    const t = window.setTimeout(() => {
      setBroken(new Set());
      setStatus("idle");
    }, 2200);
    return () => window.clearTimeout(t);
  }, [status]);

  return {
    canvas,
    broken,
    status,
    score,
    best,
    start,
    onPointerMove,
    onKeyDown,
  };
}
