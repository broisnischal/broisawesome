import type { ReactNode } from "react";
import { Link } from "react-router";
import { loadLichessLog } from "~/.server/logs/game-logs";
import { SectionLabel, Squiggle } from "~/components/terminal";
import type {
  LichessGameRow,
  LichessProfileSummary,
} from "~/lib/logs/types";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/chess">chess</Link>,
};

const CHESS_DESCRIPTION =
  "My recent chess games on Lichess — last 10, with ratings.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Chess",
    description: CHESS_DESCRIPTION,
    path: "/chess",
    keywords: ["chess", "lichess", "games", "blitz", "rapid", "bullet"],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Chess — Nischal Dahal",
      description: CHESS_DESCRIPTION,
      path: "/chess",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Chess", path: "/chess" },
      ],
      type: "CollectionPage",
    }),
  ];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=120, s-maxage=180, stale-while-revalidate=600",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const lichess = await loadLichessLog(context);
  return { lichess };
}

function OutLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

function LichessProfileBlock({ p }: { p: LichessProfileSummary }) {
  const ratings = [
    p.bullet != null ? `bullet ${p.bullet}` : null,
    p.blitz != null ? `blitz ${p.blitz}` : null,
    p.rapid != null ? `rapid ${p.rapid}` : null,
    p.classical != null ? `classical ${p.classical}` : null,
  ].filter(Boolean);

  return (
    <div className="mb-6 space-y-2 border-b border-border/50 pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <OutLink
          href={p.profileHref}
          className="text-term-link hover:text-term-link-hover transition-colors"
        >
          @{p.username}
          {p.title ? (
            <span className="text-muted-foreground font-normal"> {p.title}</span>
          ) : null}
        </OutLink>
        {p.allGames != null ? (
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            {p.allGames.toLocaleString()} games
          </span>
        ) : null}
      </div>
      {ratings.length ? (
        <p className="text-xs font-mono text-muted-foreground m-0 leading-relaxed">
          {ratings.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function LichessGameRows({ games }: { games: LichessGameRow[] }) {
  if (games.length === 0) {
    return (
      <p className="text-sm text-muted-foreground m-0 py-2">
        No recent games returned.
      </p>
    );
  }

  const wins = games.filter((g) => g.result === "win").length;
  const losses = games.filter((g) => g.result === "loss").length;
  const draws = games.filter((g) => g.result === "draw").length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <SectionLabel className="m-0">Last {games.length}:</SectionLabel>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {wins}W · {losses}L · {draws}D
        </span>
      </div>
      <div className="flex flex-col">
        {games.map((g) => (
          <div
            key={g.id}
            className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2.5 last:border-b-0 text-sm"
          >
            <div className="min-w-0">
              <OutLink
                href={g.href}
                className="text-foreground hover:text-term-link transition-colors"
              >
                vs {g.opponent}
              </OutLink>
              <span className="ml-2 text-xs font-mono text-muted-foreground tabular-nums">
                {g.speed} · {g.rated ? "rated" : "casual"}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {g.result}
              </span>
              <span className="ml-2 text-xs font-mono text-muted-foreground tabular-nums">
                {g.playedAt
                  ? new Date(g.playedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { lichess } = loaderData;

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Chess</h1>
      <p className="mt-2 text-muted-foreground">
        my last 10 games on lichess — for the record.
      </p>
      <Squiggle />

      <section aria-label="Lichess">
        {lichess.ok ? (
          <>
            {lichess.profile ? (
              <LichessProfileBlock p={lichess.profile} />
            ) : null}
            <LichessGameRows games={lichess.games} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground m-0 leading-relaxed">
            {lichess.message}
          </p>
        )}
      </section>
    </div>
  );
}
