import { useEffect } from "react";
import { useNavigation } from "react-router";
import { useSpinDelay } from "spin-delay";

/**
 * Global loading indicator: while a navigation takes more than a moment, the
 * grid itself flickers (cells blink between the canvas and the hover
 * surface, out of step with each other) instead of a bar across the top.
 * Driven by `data-pending` on the frame (styles in app.css); screen readers
 * get a plain "Loading" status.
 */
export default function GridPending() {
  const navigation = useNavigation();
  const pending = useSpinDelay(navigation.state !== "idle", {
    delay: 300,
    minDuration: 500,
  });

  useEffect(() => {
    const frame = document.querySelector("[data-frame]");
    if (!frame) return;
    frame.toggleAttribute("data-pending", pending);
  }, [pending]);

  return (
    <span className="sr-only" role="status" aria-live="polite">
      {pending ? "Loading" : ""}
    </span>
  );
}
