import { ArrowUpRightIcon } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Link, redirect, useSearchParams } from "react-router";
import { loadGameLogs } from "~/.server/logs/game-logs";
import { loadLogJsonContent } from "~/.server/logs/log-content";
import { Kbd } from "~/components/kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type {
  ClashBattleRow,
  ClashProfileSummary,
  CocBattleRow,
  CocProfileSummary,
  GlossaryEntry,
  LichessGameRow,
  LichessProfileSummary,
  LogStatus,
} from "~/lib/logs/types";
import { createHeaders, createMetaTags } from "~/lib/meta";
import { cocBattleStarImageUrl } from "~/lib/coc-battle-stars";
import { ClashRoyaleCrownScore } from "~/lib/clash-royale-crown";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";
import { Kbd as KbdComponent } from "~/components/kbd";

const LOG_TABS = ["book", "movie", "blog", "game", "glossary"] as const;
export type LogTab = (typeof LOG_TABS)[number];

const LOG_TAB_ITEMS: { value: LogTab; label: string }[] = [
  { value: "book", label: "Books" },
  { value: "movie", label: "Movies" },
  { value: "blog", label: "Blogs" },
  { value: "game", label: "Games" },
  { value: "glossary", label: "Glossary" },
];

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
      "Reading list, watch list, blogs, English glossary, and games (Lichess, Clash Royale, Clash of Clans).",
    path: "/log",
    keywords: [
      "log",
      "reading",
      "glossary",
      "english",
      "lichess",
      "clash royale",
      "clash of clans",
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
  "font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground";

const tabListClass =
  "h-auto w-full justify-start border-0 bg-transparent p-0 shadow-none";

/** Official Lichess favicon (PNG); hotlinked per normal embed / attribution practice. */
const LICHESS_FAVICON =
  "https://lichess1.org/assets/logo/lichess-favicon-32.png";

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

// function StatGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
//   return (
//     <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-xs m-0">
//       {rows.map(({ label, value }) => (
//         <div key={label} className="contents">
//           <dt className="text-muted-foreground font-medium">{label}</dt>
//           <dd className="m-0 text-foreground tabular-nums font-mono">
//             {value}
//           </dd>
//         </div>
//       ))}
//     </dl>
//   );
// }

function ClashProfileBlock({ p }: { p: ClashProfileSummary }) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6 border-b border-border/50">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-semibold tracking-tight text-foreground">
            {p.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {p.tag}
          </span>
        </div>
        {p.clanName ? (
          <span className="text-xs text-muted-foreground sm:max-w-xs sm:text-right truncate">
            {p.clanName}
            {p.clanTag ? (
              <span className="font-mono opacity-80"> {p.clanTag}</span>
            ) : null}
          </span>
        ) : null}
      </div>
      {/* <div className="pt-3">
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
      </div> */}
    </div>
  );
}

function humanizeCocBattleType(battleType: string): string {
  const map: Record<string, string> = {
    legend: "Legend league",
    homeVillage: "Home village",
    ranked: "Ranked",
  };
  return map[battleType] ?? battleType.replace(/_/g, " ");
}

function cocOpponentProfileHref(tag: string): string {
  const t = tag.startsWith("#") ? tag.slice(1) : tag;
  return `https://www.clashofstats.com/players/${encodeURIComponent(t)}`;
}

const COC_OFFICIAL_API_PORTAL =
  "https://www.clashofstats.com/players/romeo-2UJ2YQC90/summary";

function CocProfileBlock({ p }: { p: CocProfileSummary }) {
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "trophies",
      value: `${p.trophies.toLocaleString()} (best ${p.bestTrophies.toLocaleString()})`,
    },
  ];
  if (p.expLevel != null) {
    rows.push({ label: "xp level", value: p.expLevel });
  }
  rows.push(
    { label: "war stars", value: p.warStars.toLocaleString() },
    {
      label: "attack / defense wins",
      value: `${p.attackWins.toLocaleString()} / ${p.defenseWins.toLocaleString()}`,
    },
  );
  if (p.builderHallLevel != null) {
    const bb =
      p.builderBaseTrophies != null
        ? ` · ${p.builderBaseTrophies.toLocaleString()} BB trophies`
        : "";
    rows.push({
      label: "builder hall",
      value: `${p.builderHallLevel}${bb}`,
    });
  }
  if (p.leagueName && !p.leagueIconUrl) {
    rows.push({ label: "league", value: p.leagueName });
  }
  if (p.legendTrophies != null) {
    rows.push({
      label: "legend trophies",
      value: p.legendTrophies.toLocaleString(),
    });
  }
  if (p.legendSeasonLine) {
    rows.push({
      label: "legend (current season)",
      value: p.legendSeasonLine,
    });
  }

  return (
    <div className="mb-6 space-y-5">
      <div className="flex flex-col items-start gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          {p.clanBadgeUrl ? (
            <img
              src={p.clanBadgeUrl}
              alt=""
              width={52}
              height={52}
              className="size-[52px] shrink-0 rounded-md border border-border/50 bg-background object-contain p-0.5"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <div
            className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/20"
            title={`Town Hall ${p.townHallLevel}`}
          >
            <span className="text-[0.55rem] font-mono uppercase tracking-wider text-muted-foreground">
              TH
            </span>
            <span className="text-lg font-bold tabular-nums leading-none text-foreground">
              {p.townHallLevel}
            </span>
            {p.townHallWeaponLevel != null && p.townHallWeaponLevel > 0 ? (
              <span className="text-[0.55rem] font-mono text-muted-foreground tabular-nums">
                w{p.townHallWeaponLevel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold tracking-tight text-foreground">
                {p.name}
              </span>
              <span className="font-mono text-[0.7rem] text-muted-foreground tabular-nums">
                {p.tag}
              </span>
            </div>
            {p.clanName ? (
              <p className="text-xs text-muted-foreground m-0 leading-snug">
                {p.clanName}
                {p.clanTag ? (
                  <span className="font-mono opacity-80"> {p.clanTag}</span>
                ) : null}
                {p.role ? (
                  <span className="text-muted-foreground/80">
                    {" "}
                    · {p.role.replace(/_/g, " ")}
                  </span>
                ) : null}
              </p>
            ) : p.role ? (
              <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground m-0">
                {p.role.replace(/_/g, " ")}
              </p>
            ) : null}
            {p.leagueName && p.leagueIconUrl ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <img
                  src={p.leagueIconUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 shrink-0 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <span className="text-xs text-foreground">{p.leagueName}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {p.heroesHome && p.heroesHome.length > 0 ? (
        <div className="space-y-2">
          <span className={cn(sectionLabelClass, "block")}>Heroes (home)</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2.5">
            {p.heroesHome.map((h) => (
              <div
                key={h.name}
                className="flex max-w-44 items-center gap-2 sm:max-w-none"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded border border-border/40 bg-muted/25">
                  {h.portraitUrl ? (
                    <img
                      src={h.portraitUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="size-8 object-contain"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      className="text-sm font-semibold text-muted-foreground"
                      aria-hidden
                    >
                      {h.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium leading-tight text-foreground">
                    {h.name}
                  </div>
                  <div className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
                    {h.level}/{h.maxLevel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CocBattleRows({ battles }: { battles: CocBattleRow[] }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/40 pb-2">
        <span className={cn(sectionLabelClass, "m-0")}>Last 5 battles</span>
        <OutLink
          href={COC_OFFICIAL_API_PORTAL}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Find more
          <ArrowUpRightIcon className="size-3 opacity-60" aria-hidden />
        </OutLink>
      </div>
      {battles.length === 0 ? (
        <p className="text-sm text-muted-foreground m-0">
          No battles in the log (private or unavailable).{" "}
          <OutLink
            href={COC_OFFICIAL_API_PORTAL}
            className="text-foreground underline-offset-2 hover:underline"
          >
            Clash of Clans API portal
          </OutLink>
        </p>
      ) : (
        <ul className="m-0 list-none space-y-0 p-0">
          {battles.map((row, i) => (
            <li
              key={`${row.opponentTag}-${row.battleType}-${i}`}
              className="flex flex-col gap-1 border-b border-border/35 py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span
                  className={cn(
                    "font-bold text-[0.65rem] uppercase tracking-wide",
                    row.attack
                      ? "text-sky-700 dark:text-sky-300"
                      : "text-violet-700 dark:text-violet-300",
                  )}
                >
                  {row.attack ? "Attack" : "Defense"}
                </span>
                <span className="text-muted-foreground">
                  {humanizeCocBattleType(row.battleType)}
                </span>
                <span className="text-muted-foreground">·</span>
                <OutLink
                  href={cocOpponentProfileHref(row.opponentTag)}
                  className="inline-flex min-w-0 max-w-56 items-center gap-0.5 truncate font-mono text-sm text-foreground hover:text-primary sm:max-w-none"
                >
                  {row.opponentTag}
                  <ArrowUpRightIcon
                    className="size-3 shrink-0 opacity-35"
                    aria-hidden
                  />
                </OutLink>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                <img
                  src={cocBattleStarImageUrl(row.stars)}
                  alt={`${Math.min(3, Math.max(0, Math.round(row.stars)))} stars`}
                  width={88}
                  height={28}
                  className="h-7 w-auto max-w-23 object-contain object-right"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {row.destructionPercent.toFixed(0)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
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

function LichessOutcomeKbd({ result }: { result: LichessGameRow["result"] }) {
  const label = result === "win" ? "WIN" : result === "loss" ? "LOSS" : "DRAW";
  return (
    <Kbd
      className={cn(
        "pointer-events-none inline-flex items-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
        result === "win" &&
          "border-emerald-500/45 bg-emerald-500/12 text-emerald-900 dark:text-emerald-100",
        result === "loss" &&
          "border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-100",
        result === "draw" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {label}
    </Kbd>
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
                <ClashRoyaleCrownScore
                  myCrowns={row.myCrowns}
                  oppCrowns={row.oppCrowns}
                  className="font-semibold text-foreground"
                />
                <ClashOutcomeKbd outcome={row.outcome} />
              </div>
              {row.subtitleTags.length > 0 ? (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {row.subtitleTags.map((tag, ti) => (
                    <span
                      key={`${tag}-${ti}`}
                      className="rounded-md border border-border/60 bg-muted/35 px-2 py-0.5 text-xs font-medium leading-none text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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

function GlossaryTermRow({ e, i }: { e: GlossaryEntry; i: number }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const hasDetail =
    Boolean(e.definition) || Boolean(e.example) || Boolean(e.note);
  const termId = `glossary-term-${i}`;

  const setOpenFromHover = (open: boolean) => {
    const el = detailsRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    el.open = open;
  };

  const indexStr = String(i + 1).padStart(2, "0");
  const termSpans = (
    <>
      <span
        className="w-6 shrink-0 pt-px font-mono text-[10px] tabular-nums text-muted-foreground/55"
        aria-hidden
      >
        {indexStr}
      </span>
      <span
        id={termId}
        className="min-w-0 text-sm font-medium tracking-tight text-foreground"
      >
        {e.term}
      </span>
    </>
  );

  if (!hasDetail) {
    return (
      <li className="m-0 border-b border-border/35 py-2.5 last:border-b-0">
        <div className="flex min-w-0 items-baseline gap-3">{termSpans}</div>
      </li>
    );
  }

  return (
    <li className="m-0 border-b border-border/35 last:border-b-0">
      <details
        ref={detailsRef}
        className="group"
        onMouseEnter={() => setOpenFromHover(true)}
        onMouseLeave={() => setOpenFromHover(false)}
      >
        <summary className="flex cursor-default list-none items-baseline gap-3 py-2.5 outline-none [&::-webkit-details-marker]:hidden">
          {termSpans}
        </summary>
        <div className="space-y-2 pb-3 pl-9 text-[13px] leading-relaxed text-muted-foreground">
          {e.definition ? (
            <p className="m-0 text-muted-foreground">{e.definition}</p>
          ) : null}
          {e.example ? (
            <p className="m-0 italic text-foreground/85">{e.example}</p>
          ) : null}
          {e.note ? (
            <p className="m-0 text-xs text-muted-foreground/90">
              <span className="text-muted-foreground/60">Note · </span>
              {e.note}
            </p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

function GlossarySection({ entries = [] }: { entries?: GlossaryEntry[] }) {
  if (entries.length === 0) {
    return (
      <section aria-labelledby="glossary-heading" className="max-w-xl h-full">
        <h2 id="glossary-heading" className={cn("m-0 mb-8", sectionLabelClass)}>
          Glossary
        </h2>
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          No terms yet. Add{" "}
          <span className="font-mono text-foreground/80">glossary</span> to your{" "}
          <span className="font-mono">log JSON</span> (
          <span className="font-mono">term</span>, optional{" "}
          <span className="font-mono">definition</span>,{" "}
          <span className="font-mono">example</span>,{" "}
          <span className="font-mono">note</span>).
        </p>
      </section>
    );
  }

  const countLabel = `${entries.length} term${entries.length === 1 ? "" : "s"}`;

  return (
    <section
      aria-labelledby="glossary-heading"
      aria-describedby="glossary-hint"
      className="max-w-xl"
    >
      <p id="glossary-hint" className="sr-only">
        Hover a term to read definition, example, and notes. On touch devices,
        tap the term to expand.
      </p>
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="glossary-heading" className={cn("m-0", sectionLabelClass)}>
          Glossary
        </h2>
        <span
          className="font-mono text-[10px] tabular-nums text-muted-foreground/60"
          aria-label={countLabel}
        >
          {countLabel}
        </span>
      </header>
      <ul className="m-0 list-none p-0">
        {entries.map((e, i) => (
          <GlossaryTermRow key={`${e.term}-${i}`} e={e} i={i} />
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
        {error}
      </p>
    );
  }
  if (fromRemote) {
    return (
      <p className="text-xs text-muted-foreground m-0">
        The list are curated by me.
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
          className="flex gap-3 border-b border-border/50 py-3.5 last:border-b-0 sm:gap-4"
        >
          <img
            src={LICHESS_FAVICON}
            alt=""
            width={20}
            height={20}
            className="mt-0.5 size-5 shrink-0 rounded-sm border border-border/40 bg-background opacity-[0.92]"
            loading="lazy"
            decoding="async"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex min-w-0 max-w-full flex-col gap-0.5 sm:max-w-[58%]">
              <OutLink
                href={g.href}
                className="group inline-flex w-fit max-w-full"
              >
                <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-2 group-hover:text-primary group-hover:underline">
                  vs {g.opponent}
                  <ArrowUpRightIcon
                    className="size-3 shrink-0 opacity-40 group-hover:opacity-90"
                    aria-hidden
                  />
                </span>
              </OutLink>
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
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
              <LichessOutcomeKbd result={g.result} />
              <div className="text-left text-xs font-mono text-muted-foreground tabular-nums sm:text-right">
                {g.speed} · {g.rated ? "rated" : "casual"}
              </div>
            </div>
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
    <article className="relative flex w-full max-w-3xl flex-col gap-10 p-0 text-left font-sans">
      <div
        className="pointer-events-none absolute -right-20 -top-6 h-56 w-56 rounded-full bg-linear-to-br from-foreground/6 via-transparent to-transparent blur-3xl dark:from-foreground/9"
        aria-hidden
      />

      <header className="relative flex flex-col gap-4">
        <p className={cn("m-0", sectionLabelClass)}>Personal log</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground m-0 md:text-5xl md:tracking-tighter">
          Log
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed m-0 max-w-prose">
          I wanted to list them out, for myself, for share, or just for the
          record.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="relative w-full gap-6"
      >
        <TabsList className={tabListClass}>
          {LOG_TAB_ITEMS.map(({ value: tabValue, label }) => (
            <TabsTrigger key={tabValue} value={tabValue} asChild>
              <Link
                to={`/log?tab=${tabValue}`}
                prefetch="intent"
                replace
                preventScrollReset
              >
                {label}
              </Link>
            </TabsTrigger>
          ))}
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
                      {b.year != null ? (
                        <span className="tabular-nums text-muted-foreground">
                          {b.author}
                        </span>
                      ) : null}
                    </span>
                  }
                  href={b.url}
                />
              ))}
            </div>
          )}
          <div className="mt-6">
            <LogDataSourceNote
              fromRemote={logContentFromRemote}
              error={logContentError}
            />
          </div>
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
                  left={m.title}
                  right={<StatusPill status={m.status} />}
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
            <p
              className="text-sm text-muted-foreground m-0 leading-relaxed mb-4"
              aria-label="Clash Royale"
            >
              I mostly play clash royale, clash of clans, and chess, and here
              are the stats, and the recent games.
            </p>
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

          <section aria-labelledby="coc-heading">
            <h2 id="coc-heading" className={cn("m-0 mb-4", sectionLabelClass)}>
              Clash of Clans
            </h2>
            <p className="text-sm text-muted-foreground m-0 leading-relaxed mb-4">
              This is my clash of clan profile, and the recent battles, which I
              mostly play when I am <KbdComponent>pooping</KbdComponent>.
            </p>
            {games.coc.ok ? (
              <>
                {games.coc.profile ? (
                  <CocProfileBlock p={games.coc.profile} />
                ) : (
                  <p className="text-sm text-muted-foreground m-0">
                    No profile returned.
                  </p>
                )}
                <CocBattleRows battles={games.coc.battles} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                {games.coc.message}
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
