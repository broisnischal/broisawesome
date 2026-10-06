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
          ? `${data.total.toLocaleString()} GitHub contributions in the last year. Playable: press Space to play Breakout on it (three lives), arrow keys move the paddle.`
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
            d ? (
              <span
                key={d.date}
                title={`${d.count === 0 ? "No" : d.count} ${d.count === 1 ? "contribution" : "contributions"} on ${formatDay(d.date)}`}
                // Damage dims a brick one level per hit.
                className={LEVEL[game.levelOf(d)] ?? LEVEL[0]}
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
            `click to play breakout · 3 lives${game.best ? ` · best ${game.best}` : ""}`}
          {game.status === "playing" &&
            `score ${game.score} · ${"♥".repeat(game.lives)}${"♡".repeat(3 - game.lives)}`}
          {game.status === "over" &&
            `game over · ${game.score}${game.best ? ` · best ${game.best}` : ""}`}
          {game.status === "cleared" && `board cleared · ${game.score}`}
        </span>
      )}
      {data && game.damaged && game.status !== "playing" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            game.resetBoard();
          }}
          className="absolute top-2 right-2 rounded-xs bg-background/90 px-1.5 text-xs leading-5 text-muted-foreground opacity-0 transition-opacity group-focus-within/graph:opacity-100 group-hover/graph:opacity-100 hover:text-bright focus-visible:opacity-100"
        >
          reset board
        </button>
      )}
    </div>
  );
}

const BEST_KEY = "graph-breakout-best";
const BOARD_KEY = "graph-breakout-board";
const BALL_R = 4;
const SPEED = 300; // px per second at the start
const PADDLE_H = 5;
const LIVES = 3;
/** A brick shatters into this many pixels per side. */
const SHARDS = 4;

type Status = "idle" | "playing" | "over" | "cleared";
type Damage = Record<string, number>;

/**
 * Breakout on the contribution graph. Lit days are bricks that take as many
 * hits as their level (1 to 4), dimming a step per hit and shattering into
 * pixels on the last. Three lives per game. The board's damage is kept per
 * day in localStorage, so it persists across visits and stays aligned as
 * new days come in; best score too.
 */
function useBreakout(
  box: React.RefObject<HTMLDivElement | null>,
  cells: Array<ContributionDay | null>,
  weeks: number,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [damage, setDamage] = useState<Damage>({});
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [best, setBest] = useState(0);
  const damageRef = useRef(damage);
  damageRef.current = damage;
  const paddleX = useRef(0.5); // 0..1 across the box
  const keys = useRef({ left: false, right: false });

  // Restore best score and the board.
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
      const saved = JSON.parse(localStorage.getItem(BOARD_KEY) ?? "{}");
      if (saved && typeof saved === "object") setDamage(saved as Damage);
    } catch {
      // No storage: the board starts fresh each visit.
    }
  }, []);

  const save = (next: Damage) => {
    try {
      localStorage.setItem(BOARD_KEY, JSON.stringify(next));
    } catch {
      // Not persisted; fine.
    }
  };

  const levelOf = useCallback(
    (d: ContributionDay) => Math.max(0, d.level - (damage[d.date] ?? 0)),
    [damage],
  );

  const damaged = cells.some((d) => d && (damage[d.date] ?? 0) > 0);

  const resetBoard = useCallback(() => {
    setDamage({});
    save({});
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (status === "playing" || weeks === 0) return;
    setScore(0);
    setLives(LIVES);
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
      const side = e.key === "ArrowLeft" ? "left" : "right";
      keys.current[side] = true;
      const up = (ev: KeyboardEvent) => {
        if (ev.key === e.key) {
          keys.current[side] = false;
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
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tint = (level: number) =>
      `color-mix(in oklab, ${amber} ${[20, 28, 52, 76, 100][level]}%, transparent)`;
    const hpOf = (i: number) => {
      const d = cells[i];
      return d ? d.level - (damageRef.current[d.date] ?? 0) : 0;
    };
    const brickAt = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return -1;
      const i = Math.floor(x / cw) * 7 + Math.floor(y / ch);
      return hpOf(i) > 0 ? i : -1;
    };

    type Shard = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      c: string;
      life: number;
    };
    const shards: Shard[] = [];
    // Square pixels flying off a brick: a few chips per hit, the whole
    // brick (SHARDS x SHARDS) when it breaks.
    const shatter = (i: number, levelBefore: number, whole: boolean) => {
      if (still) return;
      const col = Math.floor(i / 7);
      const row = i % 7;
      const size = Math.min(cw, ch) / SHARDS;
      const c = tint(levelBefore);
      const pick = whole
        ? Array.from({ length: SHARDS * SHARDS }, (_, k) => k)
        : Array.from({ length: 3 }, () =>
            Math.floor(Math.random() * SHARDS * SHARDS),
          );
      for (const k of pick) {
        const sx = col * cw + (k % SHARDS) * size + size / 2;
        const sy = row * ch + Math.floor(k / SHARDS) * size + size / 2;
        const cx = col * cw + cw / 2;
        const cy = row * ch + ch / 2;
        shards.push({
          x: sx,
          y: sy,
          vx: (sx - cx) * (whole ? 9 : 5) + (Math.random() - 0.5) * 60,
          vy: (sy - cy) * (whole ? 9 : 5) - 60 - Math.random() * 80,
          size,
          c,
          life: whole ? 1 : 0.6,
        });
      }
    };

    let hits = 0;
    const hitBrick = (i: number) => {
      const d = cells[i];
      if (!d) return;
      const before = hpOf(i);
      const dealt = (damageRef.current[d.date] ?? 0) + 1;
      const next = { ...damageRef.current, [d.date]: dealt };
      damageRef.current = next;
      setDamage(next);
      save(next);
      hits++;
      setScore(hits);
      shatter(i, before, before - 1 <= 0);
      speed = Math.min(SPEED * 1.8, speed * 1.015);
    };

    let speed = SPEED;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let lives = LIVES;
    let waitUntil = 0;
    const serve = (now: number) => {
      x = paddleX.current * W;
      y = H - PADDLE_H - BALL_R - 3;
      speed = SPEED;
      vx = speed * 0.55 * (Math.random() < 0.5 ? -1 : 1);
      vy = -speed * 0.8;
      waitUntil = now + 500; // a beat before the ball moves
    };
    serve(performance.now());

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      if (keys.current.left)
        paddleX.current = Math.max(0, paddleX.current - dt * 1.2);
      if (keys.current.right)
        paddleX.current = Math.min(1, paddleX.current + dt * 1.2);
      const px = Math.min(
        W - paddleW / 2,
        Math.max(paddleW / 2, paddleX.current * W),
      );
      const top = H - PADDLE_H - 2;

      if (now < waitUntil) {
        // Ball rides the paddle until the serve.
        x = px;
        y = top - BALL_R;
      } else {
        const m = Math.hypot(vx, vy) || 1;
        vx = (vx / m) * speed;
        vy = (vy / m) * speed;

        // One axis at a time, so a brick hit flips the right component.
        let nx = x + vx * dt;
        let hit = brickAt(nx + Math.sign(vx) * BALL_R, y);
        if (hit >= 0) {
          hitBrick(hit);
          vx = -vx;
          nx = x;
        }
        let ny = y + vy * dt;
        hit = brickAt(nx, ny + Math.sign(vy) * BALL_R);
        if (hit >= 0) {
          hitBrick(hit);
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
        // The further from the paddle's centre it lands, the sharper the
        // bounce.
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
      }

      ctx.clearRect(0, 0, W, H);
      for (const sh of shards) {
        sh.vy += 900 * dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.life -= dt * 0.8;
        ctx.globalAlpha = Math.max(0, sh.life);
        ctx.fillStyle = sh.c;
        ctx.fillRect(sh.x - sh.size / 2, sh.y - sh.size / 2, sh.size, sh.size);
      }
      ctx.globalAlpha = 1;
      for (let k = shards.length - 1; k >= 0; k--)
        if (shards[k].life <= 0 || shards[k].y > H + 20) shards.splice(k, 1);

      ctx.fillStyle = amber;
      ctx.fillRect(px - paddleW / 2, top, paddleW, PADDLE_H);
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      const cleared = cells.every((_, i) => hpOf(i) <= 0);
      if (cleared) {
        finish("cleared");
        return;
      }
      if (y > H + BALL_R * 4) {
        lives--;
        setLives(lives);
        if (lives <= 0) {
          finish("over");
          return;
        }
        serve(now);
      }
      raf = requestAnimationFrame(tick);
    };

    const finish = (end: Status) => {
      ctx.clearRect(0, 0, W, H);
      setStatus(end);
      setBest((b) => {
        const nb = Math.max(b, hits);
        try {
          localStorage.setItem(BEST_KEY, String(nb));
        } catch {
          // Not persisted; fine.
        }
        return nb;
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  // After a game: the score stays up a moment. A cleared board resets for
  // the next round; otherwise the damage stays (it's saved).
  useEffect(() => {
    if (status !== "over" && status !== "cleared") return;
    const t = window.setTimeout(() => {
      if (status === "cleared") resetBoard();
      else setStatus("idle");
    }, 2400);
    return () => window.clearTimeout(t);
  }, [status, resetBoard]);

  return {
    canvas,
    status,
    score,
    lives,
    best,
    damaged,
    levelOf,
    resetBoard,
    start,
    onPointerMove,
    onKeyDown,
  };
}
