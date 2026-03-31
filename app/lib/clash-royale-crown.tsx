import { useId } from "react";

/**
 * Small gold crown for Clash Royale battle scores (Lucide crown geometry + CR-style coloring).
 */
export function ClashRoyaleCrownIcon({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const gradId = `cr-crown-grad-${gid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={14}
      height={14}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradId} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="45%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#F57F17" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        stroke="#B8860B"
        strokeWidth="0.45"
        strokeLinejoin="round"
        d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"
      />
      <path
        stroke="#C79100"
        strokeWidth="1.35"
        strokeLinecap="round"
        d="M5 21h14"
      />
    </svg>
  );
}

export function ClashRoyaleCrownScore({
  myCrowns,
  oppCrowns,
  className,
}: {
  myCrowns: number;
  oppCrowns: number;
  className?: string;
}) {
  const n = Math.min(Math.max(myCrowns, 0), 3);
  const m = Math.min(Math.max(oppCrowns, 0), 3);
  const label = `${myCrowns}–${oppCrowns} crowns`;

  return (
    <span
      className={className}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="inline-flex items-center gap-px align-middle">
        {Array.from({ length: n }, (_, i) => (
          <ClashRoyaleCrownIcon key={`m-${i}`} />
        ))}
      </span>
      <span
        className="mx-1 inline select-none text-muted-foreground/70 tabular-nums"
        aria-hidden
      >
        –
      </span>
      <span className="inline-flex items-center gap-px align-middle">
        {Array.from({ length: m }, (_, i) => (
          <ClashRoyaleCrownIcon key={`o-${i}`} />
        ))}
      </span>
    </span>
  );
}
