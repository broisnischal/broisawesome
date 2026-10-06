import { useEffect, useState } from "react";

const FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

/**
 * My current time in Kathmandu, e.g. `14:32 npt`. Rendered after mount (the
 * server's clock and the cached HTML would both be stale), then ticks on the
 * minute.
 */
export function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    let interval: number | undefined;
    // Align to the next minute boundary, then tick every 60s.
    const first = window.setTimeout(
      () => {
        setNow(new Date());
        interval = window.setInterval(() => setNow(new Date()), 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <time
      dateTime={now?.toISOString()}
      className={className}
      title="My local time in Kathmandu"
    >
      {now ? `${FORMAT.format(now)} npt` : "--:-- npt"}
    </time>
  );
}
