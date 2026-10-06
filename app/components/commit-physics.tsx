import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

export type PhysicsCommit = {
  hash: string;
  add: number;
  del: number;
  repo?: string;
  url: string;
};

/** Walls are this thick, sitting just outside the box. */
const WALL = 80;
/** Under this much pointer travel (px) and time (ms), a grab is a click. */
const CLICK_PX = 5;
const CLICK_MS = 300;

/**
 * My latest commits as physical pills: they drop into the box and pile up;
 * grab one, drag it, fling it. A quick click opens the commit. Matter.js is
 * loaded on demand, the simulation pauses off screen, and the page still
 * scrolls over it. Each pill is a real link (Tab + Enter); under reduced
 * motion they sit stacked with no physics.
 */
export function CommitPhysics({
  commits,
  className,
}: {
  commits: PhysicsCommit[];
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const pills = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const el = box.current;
    if (!el || commits.length === 0) return;

    // Reduced motion: a still stack along the floor, no engine.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let x = 8;
      let y = el.clientHeight - 8;
      for (const p of pills.current) {
        if (!p) continue;
        if (x + p.offsetWidth > el.clientWidth - 8) {
          x = 8;
          y -= p.offsetHeight + 4;
        }
        p.style.transform = `translate(${x}px, ${y - p.offsetHeight}px)`;
        x += p.offsetWidth + 6;
      }
      return;
    }

    let cancelled = false;
    let cleanup = () => {};

    void import("matter-js").then((mod) => {
      if (cancelled) return;
      const Matter =
        (mod as unknown as { default?: typeof mod }).default ?? mod;
      const {
        Engine,
        Runner,
        Bodies,
        Body,
        Composite,
        Mouse,
        MouseConstraint,
        Events,
        Query,
      } = Matter;

      const engine = Engine.create();
      engine.gravity.y = 1;
      const W = el.clientWidth;
      const H = el.clientHeight;
      const stat = { isStatic: true };
      // Floor and side walls; the top stays open (a high throw falls back in).
      const floor = Bodies.rectangle(W / 2, H + WALL / 2, W * 3, WALL, stat);
      const left = Bodies.rectangle(
        -WALL / 2,
        H / 2 - 600,
        WALL,
        H + 1600,
        stat,
      );
      const right = Bodies.rectangle(
        W + WALL / 2,
        H / 2 - 600,
        WALL,
        H + 1600,
        stat,
      );

      const sizes = pills.current.map((p) => ({
        w: p?.offsetWidth ?? 80,
        h: p?.offsetHeight ?? 22,
      }));
      const bodies = sizes.map(({ w, h }, i) =>
        Bodies.rectangle(
          w / 2 + 8 + Math.random() * Math.max(1, W - w - 16),
          -h - i * (h + 14),
          w,
          h,
          {
            chamfer: { radius: 3 },
            restitution: 0.3,
            friction: 0.4,
            frictionAir: 0.015,
            angle: (Math.random() - 0.5) * 0.4,
          },
        ),
      );
      Composite.add(engine.world, [floor, left, right, ...bodies]);

      const mouse = Mouse.create(el);
      // Matter grabs the wheel (non-passive); give it back to the page.
      el.removeEventListener(
        "wheel",
        (mouse as unknown as { mousewheel: EventListener }).mousewheel,
      );
      const grab = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, damping: 0.1 },
      });
      Composite.add(engine.world, grab);

      // A press that barely moves is a click: open the pill under it. Read
      // from pointer events directly (Matter only sees a drag if the button
      // is still down on its next step, so fast clicks slip past it).
      let press: { x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        press = { x: e.clientX, y: e.clientY, t: performance.now() };
      };
      const onUp = (e: PointerEvent) => {
        if (
          press &&
          Math.hypot(e.clientX - press.x, e.clientY - press.y) < CLICK_PX &&
          performance.now() - press.t < CLICK_MS
        ) {
          const r = el.getBoundingClientRect();
          const [hit] = Query.point(bodies, {
            x: e.clientX - r.left,
            y: e.clientY - r.top,
          });
          const i = hit ? bodies.indexOf(hit) : -1;
          if (i >= 0)
            window.open(commits[i].url, "_blank", "noopener,noreferrer");
        }
        press = null;
      };
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp);

      // Bodies drive the DOM pills (transforms only: no layout work).
      Events.on(engine, "afterUpdate", () => {
        bodies.forEach((b, i) => {
          const p = pills.current[i];
          if (!p) return;
          const { w, h } = sizes[i];
          p.style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y - h / 2}px) rotate(${b.angle}rad)`;
        });
      });

      const runner = Runner.create();
      let running = false;
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !running) {
          Runner.run(runner, engine);
          running = true;
        } else if (!entry.isIntersecting && running) {
          Runner.stop(runner);
          running = false;
        }
      });
      io.observe(el);

      // Keep the floor and right wall on the box edges as it resizes.
      const ro = new ResizeObserver(() => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        Body.setPosition(floor, { x: w / 2, y: h + WALL / 2 });
        Body.setPosition(right, { x: w + WALL / 2, y: right.position.y });
      });
      ro.observe(el);

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        Runner.stop(runner);
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointerup", onUp);
        Events.off(engine, "afterUpdate");
        Mouse.clearSourceEvents(mouse);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [commits]);

  return (
    <div
      ref={box}
      className={cn(
        "absolute inset-0 cursor-grab touch-none active:cursor-grabbing",
        className,
      )}
    >
      <ul aria-label="Recent commits">
        {commits.map((c, i) => (
          <li key={c.hash + i}>
            <a
              ref={(el) => {
                pills.current[i] = el;
              }}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              // Off screen until the engine places it; the box takes the
              // pointer, so the pill itself doesn't.
              style={{ transform: "translate(-9999px, 0)" }}
              className="pointer-events-none absolute top-0 left-0 inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-xs border border-border bg-background px-2 text-xs shadow-[0_2px_6px_-2px_rgb(0_0_0/0.35)] will-change-transform select-none"
            >
              <span className="tabular-nums text-muted-foreground">
                {c.hash}
              </span>
              {c.repo && (
                <span className="text-foreground">
                  {c.repo.split("/").pop()}
                </span>
              )}
              {c.add > 0 && (
                <span className="tabular-nums text-diff-add">+{c.add}</span>
              )}
              {c.del > 0 && (
                <span className="tabular-nums text-diff-del">-{c.del}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
