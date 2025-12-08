import { useEffect, useRef, useState } from "react";

interface ScreensaverProps {
  enabled: boolean;
}

export function Screensaver({ enabled }: ScreensaverProps) {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isActiveRef = useRef(false);

  // Space fight animation state
  const starsRef = useRef<
    Array<{ x: number; y: number; speed: number; size: number }>
  >([]);
  const shipsRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }>
  >([]);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }>
  >([]);

  // Sync ref with state
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!enabled) {
      setIsActive(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const INACTIVITY_TIME = 15000; // 15 seconds
    const MOUSE_MOVEMENT_THRESHOLD = 5; // pixels

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsActive(false);
      timeoutRef.current = setTimeout(() => {
        setIsActive(true);
      }, INACTIVITY_TIME);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY };

      // If screensaver is active, dismiss it immediately on any movement
      if (isActiveRef.current) {
        setIsActive(false);
        resetTimer();
        lastMousePosRef.current = currentPos;
        return;
      }

      if (lastMousePosRef.current) {
        const dx = Math.abs(currentPos.x - lastMousePosRef.current.x);
        const dy = Math.abs(currentPos.y - lastMousePosRef.current.y);

        // Only reset if mouse actually moved significantly
        if (dx > MOUSE_MOVEMENT_THRESHOLD || dy > MOUSE_MOVEMENT_THRESHOLD) {
          resetTimer();
        }
      } else {
        resetTimer();
      }

      lastMousePosRef.current = currentPos;
    };

    const handleActivity = () => {
      // If screensaver is active, dismiss it immediately
      if (isActiveRef.current) {
        setIsActive(false);
      }
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Track various user activities
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("touchmove", handleActivity);

    // Track tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause timer
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // Tab is visible, reset timer
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("touchmove", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled]);

  // Initialize space fight animation
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize stars
    starsRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 0.5,
      size: Math.random() * 2 + 1,
    }));

    // Initialize ships
    shipsRef.current = [
      {
        x: canvas.width * 0.2,
        y: canvas.height * 0.5,
        vx: 1,
        vy: Math.sin(Date.now() * 0.001) * 0.5,
        size: 30,
        color: "#3b82f6", // blue
      },
      {
        x: canvas.width * 0.8,
        y: canvas.height * 0.5,
        vx: -1,
        vy: Math.cos(Date.now() * 0.001) * 0.5,
        size: 30,
        color: "#ef4444", // red
      },
    ];

    let frameCount = 0;

    const animate = () => {
      if (!isActive) return;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frameCount++;

      // Update and draw stars
      starsRef.current.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw ships
      shipsRef.current.forEach((ship, index) => {
        // Move ships
        ship.x += ship.vx;
        ship.y += ship.vy;

        // Bounce off edges
        if (ship.x < ship.size || ship.x > canvas.width - ship.size) {
          ship.vx *= -1;
        }
        if (ship.y < ship.size || ship.y > canvas.height - ship.size) {
          ship.vy *= -1;
        }

        // Keep ships in bounds
        ship.x = Math.max(
          ship.size,
          Math.min(canvas.width - ship.size, ship.x),
        );
        ship.y = Math.max(
          ship.size,
          Math.min(canvas.height - ship.size, ship.y),
        );

        // Add some dynamic movement
        ship.vy += Math.sin(frameCount * 0.01 + index) * 0.02;

        // Draw ship (triangle)
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(Math.atan2(ship.vy, ship.vx) + Math.PI / 2);
        ctx.fillStyle = ship.color;
        ctx.beginPath();
        ctx.moveTo(0, -ship.size);
        ctx.lineTo(-ship.size * 0.6, ship.size * 0.8);
        ctx.lineTo(ship.size * 0.6, ship.size * 0.8);
        ctx.closePath();
        ctx.fill();

        // Draw ship glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = ship.color;
        ctx.fill();
        ctx.restore();

        // Add particles
        if (frameCount % 3 === 0) {
          particlesRef.current.push({
            x: ship.x,
            y: ship.y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 30,
            color: ship.color,
          });
        }
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life > 0) {
          const alpha = particle.life / 30;
          ctx.fillStyle =
            particle.color +
            Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0");
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      // Draw "SPACE FIGHT" text
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#3b82f6";
      ctx.fillText("SPACE FIGHT", canvas.width / 2, canvas.height * 0.15);
      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 bg-black"
      style={{
        pointerEvents: isActive ? "auto" : "none",
        zIndex: 9999,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
