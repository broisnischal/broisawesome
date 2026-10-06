/**
 * Two confetti cannons, one from each side of the screen, aimed inward.
 * canvas-confetti is loaded on demand and skips itself under reduced motion.
 */
export function celebrate() {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const shared = {
      particleCount: 80,
      spread: 62,
      startVelocity: 58,
      ticks: 240,
      gravity: 1.1,
      scalar: 0.9,
      zIndex: 1000,
      colors: ["#f5b95a", "#e8a33d", "#c4781a", "#fafafa", "#a1a1aa"],
      disableForReducedMotion: true,
    };
    confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.7 } });
  });
}
