import { ArrowUpRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, redirect, useSearchParams } from "react-router";
import { loadGameLogs } from "~/.server/logs/game-logs";
import { loadLogJsonContent } from "~/.server/logs/log-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type {
  ClashBattleRow,
  ClashProfileSummary,
  GlossaryEntry,
  LichessGameRow,
  LichessProfileSummary,
  LogStatus,
} from "~/lib/logs/types";
import { createHeaders, createMetaTags } from "~/lib/meta";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

const LOG_TABS = ["book", "movie", "blog", "game", "glossary"] as const;
export type LogTab = (typeof LOG_TABS)[number];

function isLogTab(value: string | null): value is LogTab {
  return value != null && LOG_TABS.includes(value as LogTab);
}

export const handle = {
  breadcrumb: () => <Link to="/log">Log</Link>,
};

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Log",
    description:
      "Reading list, watch list, blogs, English glossary, and games (Lichess & Clash Royale).",
    path: "/log",
    keywords: [
      "log",
      "reading",
      "glossary",
      "english",
      "lichess",
      "clash royale",
      "games",
      "books",
    ],
  });
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=120, s-maxage=180, stale-while-revalidate=600",
  });
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tabParam = url.searchParams.get("tab");
  if (tabParam === "song" || tabParam === "mytube") {
    url.searchParams.set("tab", "glossary");
    return redirect(`${url.pathname}?${url.searchParams.toString()}`);
  }
  if (!isLogTab(tabParam)) {
    url.searchParams.set("tab", "book");
    return redirect(`${url.pathname}?${url.searchParams.toString()}`);
  }

  const env = context.cloudflare?.env;
  const [games, media] = await Promise.all([
    loadGameLogs(context),
    loadLogJsonContent(env),
  ]);
  return {
    bookLogs: media.bookLogs,
    movieLogs: media.movieLogs,
    blogLogs: media.blogLogs,
    glossaryLogs: media.glossaryLogs,
    games,
    logContentFromRemote: media.fromRemote,
    logContentError: media.remoteError,
  };
}

const sectionLabelClass =
  "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground";

const tabListClass =
  "bg-background h-auto p-1 flex flex-wrap gap-1 rounded-xl w-full justify-start border border-border/70";

const tabTriggerClass = cn(
  "rounded-lg px-3 py-2 text-xs font-medium tracking-tight border-0 shadow-none sm:text-sm",
  "text-muted-foreground",
  "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
  "data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-background/70",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
);

function StatusPill({ status }: { status: LogStatus }) {
  return (
    <span
      className={cn(
        "text-[0.65rem] font-medium uppercase tracking-[0.12em] px-2 py-0.5 rounded-md border shrink-0",
        status === "active" && "border-primary/35 text-foreground bg-primary/5",
        status === "done" && "border-border text-muted-foreground bg-muted/40",
        status === "paused" &&
          "border-amber-500/30 text-amber-800 dark:text-amber-200 bg-amber-500/10",
      )}
    >
      {status}
    </span>
  );
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

function SplitRow({
  left,
  right,
  note,
  href,
}: {
  left: ReactNode;
  right: ReactNode;
  note?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 py-3.5 border-b border-border/50 last:border-b-0 text-sm">
      <div className="min-w-0 flex flex-col gap-1">
        {href ? (
          <OutLink
            href={href}
            className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors group w-fit leading-snug"
          >
            {left}
            <ArrowUpRightIcon
              className="size-3.5 shrink-0 opacity-45 group-hover:opacity-90"
              aria-hidden
            />
          </OutLink>
        ) : (
          <span className="font-medium text-foreground">{left}</span>
        )}
        {note ? (
          <p className="text-xs text-muted-foreground m-0 leading-relaxed">
            {note}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 text-muted-foreground sm:text-right text-xs sm:text-sm">
        {right}
      </div>
    </div>
  );
}

function StatGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-xs m-0">
      {rows.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground font-medium">{label}</dt>
          <dd className="m-0 text-foreground tabular-nums font-mono">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ClashProfileBlock({ p }: { p: ClashProfileSummary }) {
  const winRate =
    p.wins + p.losses > 0
      ? `${Math.round((100 * p.wins) / (p.wins + p.losses))}%`
      : "—";

  return (
    <div className="mb-8 rounded-xl border border-border/60 bg-muted/15 p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {p.name}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {p.tag}
          </span>
        </div>
        {p.clanName ? (
          <span className="text-xs text-muted-foreground text-right max-w-48 truncate">
            {p.clanName}
            {p.clanTag ? (
              <span className="font-mono opacity-80"> {p.clanTag}</span>
            ) : null}
          </span>
        ) : null}
      </div>
      <StatGrid
        rows={[
          {
            label: "trophies",
            value: `${p.trophies} (best ${p.bestTrophies})`,
          },
          { label: "battles", value: p.battleCount },
          { label: "w / l", value: `${p.wins} / ${p.losses}` },
          { label: "win rate", value: winRate },
          ...(p.threeCrownWins != null
            ? [{ label: "3-crown", value: p.threeCrownWins } as const]
            : []),
        ]}
      />
    </div>
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
    <div className="mb-8 rounded-xl border border-border/60 bg-muted/15 p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <OutLink
          href={p.profileHref}
          className="inline-flex items-center gap-1 text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors group"
        >
          @{p.username}
          {p.title ? (
            <span className="text-muted-foreground font-normal">
              {" "}
              {p.title}
            </span>
          ) : null}
          <ArrowUpRightIcon
            className="size-3.5 opacity-45 group-hover:opacity-90"
            aria-hidden
          />
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

function formatClashBattleWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ClashOutcomeKbd({ outcome }: { outcome: ClashBattleRow["outcome"] }) {
  const label =
    outcome === "win" ? "WIN" : outcome === "loss" ? "LOSS" : "DRAW";
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
        outcome === "win" &&
          "border-emerald-500/45 bg-emerald-500/12 text-emerald-900 dark:text-emerald-100",
        outcome === "loss" &&
          "border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-100",
        outcome === "draw" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {label}
    </kbd>
  );
}

function DeckStrip({ label, urls }: { label: string; urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span
        className="text-[0.65rem] font-mono uppercase tracking-[0.12em] text-muted-foreground truncate block"
        title={label}
      >
        {label}
      </span>
      <div
        className={cn(
          // 4 cols on small, 8 on lg; width = n×w-9 + (n−1)×gap-1
          "grid shrink-0 grid-cols-4 gap-1 max-w-full w-39 lg:grid-cols-8 lg:w-79",
        )}
      >
        {urls.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            width={36}
            height={44}
            className="h-11 w-9 rounded-sm border border-border/80 bg-muted/30 object-cover"
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

function ClashBattleRows({ battles }: { battles: ClashBattleRow[] }) {
  if (battles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground m-0 py-2">
        No recent battles in the log.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {battles.map((row, i) => (
        <div
          key={`${row.battleTimeRaw}-${i}`}
          className="flex flex-col gap-2 py-4 border-b border-border/70 last:border-b-0 text-sm"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <div className="font-medium text-foreground">{row.title}</div>
              {row.battleTimeIso ? (
                <time
                  className="text-xs text-muted-foreground font-mono tabular-nums"
                  dateTime={row.battleTimeIso}
                >
                  {formatClashBattleWhen(row.battleTimeIso)}
                </time>
              ) : (
                <span className="text-xs text-muted-foreground font-mono">
                  {formatClashBattleWhen(null)}
                </span>
              )}
            </div>
            <div className="shrink-0 sm:text-right text-xs sm:text-sm max-w-md leading-snug flex flex-col items-end gap-1.5">
              <div className="inline-flex flex-wrap items-center justify-end gap-2">
                <span className="font-semibold text-foreground tabular-nums">
                  {row.crownsLine}
                </span>
                <ClashOutcomeKbd outcome={row.outcome} />
              </div>
              {row.subtitleRest ? (
                <span className="text-muted-foreground font-normal">
                  {row.subtitleRest}
                </span>
              ) : null}
            </div>
          </div>
          {(row.myDeckIconUrls.length > 0 ||
            row.oppDeckIconUrls.length > 0) && (
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start sm:gap-x-6 sm:gap-y-0">
              <div className="min-w-0">
                <DeckStrip label="You" urls={row.myDeckIconUrls} />
              </div>
              <div className="min-w-0">
                <DeckStrip
                  label={row.opponentName}
                  urls={row.oppDeckIconUrls}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GlossarySection({ entries = [] }: { entries?: GlossaryEntry[] }) {
  if (entries.length === 0) {
    return (
      <section aria-labelledby="glossary-heading">
        <h2 id="glossary-heading" className={cn("m-0 mb-3", sectionLabelClass)}>
          Glossary
        </h2>
        <p className="text-sm text-muted-foreground m-0 leading-relaxed">
          No entries yet. Add a <span className="font-mono">glossary</span>{" "}
          array to your log JSON (see{" "}
          <span className="font-mono">public/log-content.json</span>) — each
          item needs a <span className="font-mono">term</span>; optional{" "}
          <span className="font-mono">definition</span>,{" "}
          <span className="font-mono">example</span>, and{" "}
          <span className="font-mono">note</span>.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="glossary-heading" className="space-y-6">
      <div>
        <h2 id="glossary-heading" className={cn("m-0 mb-1", sectionLabelClass)}>
          Glossary
        </h2>
        <p className="text-sm text-muted-foreground m-0 leading-relaxed max-w-prose">
          Words and phrases I&apos;m collecting while learning English — same
          remote JSON as books and movies.
        </p>
      </div>
      <ul className="m-0 list-none p-0 flex flex-col gap-4">
        {entries.map((e, i) => (
          <li
            key={`${e.term}-${i}`}
            className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4 sm:px-5"
          >
            <h3 className="text-base font-semibold tracking-tight text-foreground m-0">
              {e.term}
            </h3>
            {e.definition ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground m-0">
                {e.definition}
              </p>
            ) : null}
            {e.example ? (
              <blockquote className="mt-3 border-l-2 border-primary/35 pl-3 m-0">
                <p className="text-sm italic text-foreground/90 leading-relaxed m-0">
                  {e.example}
                </p>
              </blockquote>
            ) : null}
            {e.note ? (
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed m-0">
                {e.note}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LogDataSourceNote({
  fromRemote,
  error,
}: {
  fromRemote: boolean;
  error: string | null;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="text-sm text-amber-800 dark:text-amber-200/95 bg-amber-500/10 border border-amber-500/25 rounded-md px-3 py-2 m-0 leading-relaxed"
      >
        Could not load <span className="font-mono">LOG_JSON_URL</span>: {error}.
        Showing embedded fallback lists (books, movies, blogs, glossary).
      </p>
    );
  }
  if (fromRemote) {
    return (
      <p className="text-xs text-muted-foreground m-0">
        Book, movie, blog, and glossary lists are loaded from remote JSON.
      </p>
    );
  }
  return (
    <div className="text-xs text-muted-foreground space-y-1.5 m-0 leading-relaxed">
      <p className="m-0">
        Set <span className="font-mono">LOG_JSON_URL</span> to public HTTPS JSON
        (template <span className="font-mono">public/log-content.json</span> —
        includes optional <span className="font-mono">glossary</span>).
      </p>
      <p className="m-0 break-all opacity-90">
        GitHub:{" "}
        <span className="text-foreground/80">
          https://raw.githubusercontent.com/USER/REPO/BRANCH/public/log-content.json
        </span>
      </p>
      <p className="m-0 opacity-90">
        Gist: create a public gist with the same JSON → open{" "}
        <strong>Raw</strong> → paste that URL.
      </p>
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

  return (
    <div className="flex flex-col">
      {games.map((g) => (
        <div
          key={g.id}
          className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 py-3 border-b border-border/70 last:border-b-0 text-sm"
        >
          <OutLink
            href={g.href}
            className="min-w-0 inline-flex flex-col gap-0.5 group w-fit sm:max-w-[55%]"
          >
            <span className="font-medium text-foreground group-hover:text-primary inline-flex items-center gap-1">
              {g.left}
              <ArrowUpRightIcon
                className="size-3 shrink-0 opacity-40 group-hover:opacity-90"
                aria-hidden
              />
            </span>
            <time
              className="text-xs text-muted-foreground font-mono tabular-nums"
              dateTime={g.playedAt}
            >
              {g.playedAt
                ? new Date(g.playedAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </time>
          </OutLink>
          <div className="text-muted-foreground shrink-0 sm:text-right text-xs sm:text-sm font-mono">
            {g.right}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const {
    bookLogs: books,
    movieLogs: movies,
    blogLogs: blogs,
    glossaryLogs,
    games,
    logContentFromRemote,
    logContentError,
  } = loaderData;
  const glossary = glossaryLogs ?? [];

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: LogTab = isLogTab(tabParam) ? tabParam : "book";

  const setTab = (next: string) => {
    setSearchParams(
      (prev) => {
        const merged = new URLSearchParams(prev);
        merged.set("tab", next);
        return merged;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  return (
    <article className="relative p-0 flex w-full max-w-3xl flex-col gap-10 text-left">
      <div
        className="pointer-events-none absolute -right-20 -top-6 h-56 w-56 rounded-full bg-linear-to-br from-foreground/6 via-transparent to-transparent blur-3xl dark:from-foreground/9"
        aria-hidden
      />

      <header className="relative flex flex-col gap-4 border-b border-border/60 pb-8">
        <p className={cn("m-0", sectionLabelClass)}>Personal log</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground m-0 md:text-5xl md:tracking-tighter">
          Log
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed m-0 max-w-prose">
          Books, film, blogs, English vocabulary, and live game stats — loaded
          on the server.
        </p>
        <LogDataSourceNote
          fromRemote={logContentFromRemote}
          error={logContentError}
        />
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="relative w-full gap-6"
      >
        <TabsList className={tabListClass}>
          <TabsTrigger value="book" className={tabTriggerClass}>
            Books
          </TabsTrigger>
          <TabsTrigger value="movie" className={tabTriggerClass}>
            Movies
          </TabsTrigger>
          <TabsTrigger value="blog" className={tabTriggerClass}>
            Blogs
          </TabsTrigger>
          <TabsTrigger value="game" className={tabTriggerClass}>
            Games
          </TabsTrigger>
          <TabsTrigger value="glossary" className={tabTriggerClass}>
            Glossary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="mt-0">
          {books.length === 0 ? (
            <p className="text-sm text-muted-foreground m-0">
              No valid entries in the <span className="font-mono">books</span>{" "}
              array.
            </p>
          ) : (
            <div className="flex flex-col">
              {books.map((b, i) => (
                <SplitRow
                  key={`${b.title}-${i}`}
                  left={b.title}
                  right={
                    <span className="inline-flex flex-wrap items-center gap-2 justify-end">
                      {b.author ? (
                        <span className="text-muted-foreground">
                          {b.author}
                        </span>
                      ) : null}
                      {b.year != null ? (
                        <span className="tabular-nums text-muted-foreground">
                          {b.year}
                        </span>
                      ) : null}
                      <StatusPill status={b.status} />
                    </span>
                  }
                  note={b.note}
                  href={b.url}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movie" className="mt-0">
          {movies.length === 0 ? (
            <p className="text-sm text-muted-foreground m-0">
              No valid entries in the <span className="font-mono">movies</span>{" "}
              array.
            </p>
          ) : (
            <div className="flex flex-col">
              {movies.map((m, i) => (
                <SplitRow
                  key={`${m.title}-${i}`}
                  left={
                    <>
                      {m.title}
                      {m.year != null ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          ({m.year})
                        </span>
                      ) : null}
                    </>
                  }
                  right={<StatusPill status={m.status} />}
                  note={m.note}
                  href={m.url}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="blog" className="mt-0">
          {blogs.length === 0 ? (
            <p className="text-sm text-muted-foreground m-0">
              No valid entries in the <span className="font-mono">blogs</span>{" "}
              array.
            </p>
          ) : (
            <div className="flex flex-col">
              {blogs.map((b) => (
                <SplitRow
                  key={b.url}
                  left={b.title}
                  right={<StatusPill status={b.status} />}
                  note={b.note}
                  href={b.url}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="game" className="mt-0 space-y-10">
          <section aria-labelledby="clash-heading">
            <h2
              id="clash-heading"
              className={cn("m-0 mb-4", sectionLabelClass)}
            >
              Clash Royale
            </h2>
            {games.clash.ok ? (
              <>
                {games.clash.profile ? (
                  <ClashProfileBlock p={games.clash.profile} />
                ) : null}
                <ClashBattleRows battles={games.clash.battles} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                {games.clash.message}
              </p>
            )}
          </section>

          <section aria-labelledby="lichess-heading">
            <h2
              id="lichess-heading"
              className={cn("m-0 mb-4", sectionLabelClass)}
            >
              Lichess
            </h2>
            {games.lichess.ok ? (
              <>
                {games.lichess.profile ? (
                  <LichessProfileBlock p={games.lichess.profile} />
                ) : null}
                <LichessGameRows games={games.lichess.games} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                {games.lichess.message}
              </p>
            )}
          </section>
        </TabsContent>

        <TabsContent value="glossary" className="mt-0">
          <GlossarySection entries={glossary} />
        </TabsContent>
      </Tabs>
    </article>
  );
}
