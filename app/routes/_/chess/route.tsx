import { Link } from "react-router";
import { loadLichessLog } from "~/.server/logs/game-logs";
import { ScrambleText, useScramble } from "~/components/scramble";
import { BLEED, GridCells, ROW_LINK, RowNumber } from "~/components/grid";
import type { LichessGameRow, LichessProfileSummary } from "~/lib/logs/types";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

export const handle = {
  grid: true,
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

const CELL =
  "flex flex-col justify-between gap-3 bg-background px-5 py-5 md:px-8 md:py-6";

/** WIN on the amber wash, LOSS/DRAW on a neutral one; the word always shows. */
function ResultChip({ result }: { result: LichessGameRow["result"] }) {
  return (
    <span
      className={cn(
        "rounded-xs px-1.5 text-xs leading-5 uppercase tracking-[0.08em]",
        result === "win"
          ? "bg-term-link/12 text-term-link-hover"
          : "bg-foreground/8 text-muted-foreground",
      )}
    >
      {result}
    </span>
  );
}

/** One game, one box: number + date, opponent, speed, result. */
function GameCell({ game, index }: { game: LichessGameRow; index: number }) {
  const { shown, run } = useScramble(game.opponent);
  return (
    <div
      onPointerEnter={run}
      onFocus={run}
      className="cell-corners relative isolate flex h-(--row) w-full flex-col gap-3 px-5 py-5 md:px-8 md:py-6"
    >
      <div className="flex items-center justify-between gap-3">
        <RowNumber n={index + 1} />
        {game.playedAt && (
          <time
            dateTime={game.playedAt}
            className="text-xs tabular-nums text-muted-foreground"
          >
            {new Date(game.playedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={game.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`block truncate text-base font-medium text-bright ${ROW_LINK}`}
        >
          <span className="text-muted-foreground">vs </span>
          <ScrambleText text={game.opponent} shown={shown} />
        </a>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {game.speed} · {game.rated ? "rated" : "casual"}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <ResultChip result={game.result} />
        <span className="text-xs text-term-link">lichess.org</span>
      </div>
    </div>
  );
}

function Profile({
  p,
  games,
}: {
  p?: LichessProfileSummary;
  games: LichessGameRow[];
}) {
  const ratings = p
    ? (
        [
          ["bullet", p.bullet],
          ["blitz", p.blitz],
          ["rapid", p.rapid],
          ["classical", p.classical],
        ] as const
      ).filter(([, v]) => v != null)
    : [];
  const count = (r: LichessGameRow["result"]) =>
    games.filter((g) => g.result === r).length;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        {p ? (
          <a
            href={p.profileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="term-link"
          >
            @{p.username}
            {p.title ? ` ${p.title}` : ""}
          </a>
        ) : (
          <span className="text-muted-foreground">lichess</span>
        )}
        <span className="tabular-nums text-muted-foreground">
          {p?.allGames != null && `${p.allGames.toLocaleString()} games · `}
          last {games.length}: {count("win")}W · {count("loss")}L ·{" "}
          {count("draw")}D
        </span>
      </div>
      {ratings.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {ratings.map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </dt>
              <dd className="text-xl font-medium tabular-nums text-bright">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { lichess } = loaderData;
  const games = lichess.ok ? lichess.games : [];

  return (
    // Flush with header and footer: the page is one stack of boxes.
    <div className="-mt-10 -mb-16 w-full text-sm leading-7 md:-mt-12 md:-mb-20 md:text-[0.9375rem]">
      <section
        aria-labelledby="chess-title"
        className={cn(
          "grid-cross relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3",
          BLEED,
        )}
      >
        <div
          data-tile
          className={cn(
            CELL,
            "min-h-32 sm:col-span-2 lg:col-span-1 lg:h-(--row)",
          )}
        >
          <span className="text-xs text-muted-foreground">lichess.org</span>
          <h1
            id="chess-title"
            className="font-display text-[2rem] leading-none font-normal tracking-[-0.02em] text-bright italic md:text-[2.375rem]"
          >
            Chess
          </h1>
        </div>
        <div
          data-tile
          className={cn(CELL, "min-h-48 sm:col-span-2 lg:h-(--row)")}
        >
          {lichess.ok ? (
            <Profile p={lichess.profile ?? undefined} games={games} />
          ) : (
            <p className="text-muted-foreground">{lichess.message}</p>
          )}
        </div>
      </section>

      {games.length > 0 && (
        <section
          aria-label="Recent games"
          className={cn("grid-cross relative border-t border-border", BLEED)}
        >
          <GridCells
            label="Recent games"
            items={games}
            cellKey={(g) => g.id}
            renderCell={(g, i) => <GameCell game={g} index={i} />}
          />
        </section>
      )}
    </div>
  );
}
