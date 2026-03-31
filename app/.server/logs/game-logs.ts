import type { AppLoadContext } from "react-router";
import { withMemoryCache } from "~/.server/memory-cache";
import { cocHeroPortraitUrl } from "~/lib/coc-hero-portrait";
import type {
  ClashBattleRow,
  ClashProfileSummary,
  CocBattleRow,
  CocHeroRow,
  CocProfileSummary,
  GamesLoaderData,
  LichessGameRow,
  LichessProfileSummary,
} from "~/lib/logs/types";

/**
 * Clash Royale: JWT from https://developer.clashroyale.com/ — we call
 * https://proxy.royaleapi.dev by default ( https://docs.royaleapi.com/#/proxy ).
 * You must allow the proxy’s egress IP on that key (documented as 45.79.218.79;
 * re-check RoyaleAPI / npm @varandas/clash-royale-api if it changes). Workers never
 * hit Supercell directly, so your home/work IP is irrelevant.
 * CLASH_ROYALE_API_BASE=https://api.clashroyale.com only if you allowlist your own static IP.
 */
type GameLogEnv = {
  LICHESS_USERNAME?: string;
  CLASH_ROYALE_PLAYER_TAG?: string;
  CLASH_ROYALE_API_TOKEN?: string;
  CLASH_ROYALE_API_BASE?: string;
  /** https://developer.clashofclans.com — JWT; whitelist API egress IP on the key (Workers IP may change). */
  CLASH_OF_CLANS_PLAYER_TAG?: string;
  CLASH_OF_CLANS_API_TOKEN?: string;
  CLASH_OF_CLANS_API_BASE?: string;
};

const CLASH_DEFAULT_API_BASE = "https://proxy.royaleapi.dev";
const COC_DEFAULT_API_BASE = "https://api.clashofclans.com";

/** Lichess + Clash round-trips are slow; cache within each runtime isolate. */
const GAME_LOGS_CACHE_MS = 2 * 60 * 1000;

function gameLogsCacheKey(env: GameLogEnv | undefined): string {
  const lichess = env?.LICHESS_USERNAME?.trim() || "";
  const clashTag = env?.CLASH_ROYALE_PLAYER_TAG?.trim() || "";
  const hasClashToken = Boolean(env?.CLASH_ROYALE_API_TOKEN?.trim());
  const cocTag = env?.CLASH_OF_CLANS_PLAYER_TAG?.trim() || "";
  const hasCocToken = Boolean(env?.CLASH_OF_CLANS_API_TOKEN?.trim());
  return `game-logs:v2:${lichess}:${clashTag}:${hasClashToken ? "1" : "0"}:${cocTag}:${hasCocToken ? "1" : "0"}`;
}

function clashApiBase(env: GameLogEnv | undefined): string {
  const raw = env?.CLASH_ROYALE_API_BASE?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return CLASH_DEFAULT_API_BASE;
}

function cocApiBase(env: GameLogEnv | undefined): string {
  const raw = env?.CLASH_OF_CLANS_API_BASE?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return COC_DEFAULT_API_BASE;
}

type LichessGameJson = {
  id: string;
  rated?: boolean;
  createdAt?: number;
  lastMoveAt?: number;
  speed?: string;
  winner?: string;
  status?: string;
  players?: {
    white?: { user?: { name?: string }; rating?: number };
    black?: { user?: { name?: string }; rating?: number };
  };
};

type ClashCardSlot = {
  id?: number;
  name?: string;
  level?: number;
};

type ClashBattler = {
  name?: string;
  tag?: string;
  crowns?: number;
  cards?: ClashCardSlot[];
};

type ClashBattleJson = {
  battleTime: string;
  type?: string;
  gameMode?: { id?: number; name?: string };
  arena?: { id?: number; name?: string; rawName?: string };
  eventTag?: string;
  deckSelection?: string;
  team?: ClashBattler[];
  opponent?: ClashBattler[];
  isLadderTournament?: boolean;
};

function parseNdjsonGames(text: string): LichessGameJson[] {
  const lines = text.trim().split("\n").filter(Boolean);
  const out: LichessGameJson[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line) as LichessGameJson);
    } catch {
      // skip bad line
    }
  }
  return out;
}

function humanizeClashMode(name: string | undefined): string {
  if (!name) return "Battle";
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Supercell often returns `20260328T052610.000Z` (no `-` / `:`), which `Date` cannot parse.
 */
function parseClashBattleTimeIso(raw: string): string | null {
  const s = raw.trim();
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d+)Z$/i.exec(s);
  if (m) {
    const [, y, mo, d, h, mi, sec, frac] = m;
    const ms = frac.padEnd(3, "0").slice(0, 3);
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${sec}.${ms}Z`;
    const t = Date.parse(iso);
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function deckIconUrlsFromBattler(
  battler: ClashBattler | undefined,
  iconById: Map<number, string>,
): string[] {
  const cards = battler?.cards;
  if (!Array.isArray(cards)) return [];
  const out: string[] = [];
  for (const c of cards) {
    if (typeof c.id !== "number") continue;
    const url = iconById.get(c.id);
    if (url) out.push(url);
  }
  return out;
}

async function fetchClashCardIconMap(
  base: string,
  token: string,
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const res = await fetch(`${base}/v1/cards`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return map;
  const data = (await res.json()) as unknown;
  const items = Array.isArray(data)
    ? (data as { id?: number; iconUrls?: { medium?: string } }[])
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { items?: unknown }).items)
      ? ((data as { items: { id?: number; iconUrls?: { medium?: string } }[] })
          .items)
      : [];
  for (const c of items) {
    if (typeof c.id === "number" && typeof c.iconUrls?.medium === "string") {
      map.set(c.id, c.iconUrls.medium);
    }
  }
  return map;
}

function formatLichessRow(
  g: LichessGameJson,
  myUsername: string,
): LichessGameRow {
  const w = g.players?.white?.user?.name ?? "White";
  const b = g.players?.black?.user?.name ?? "Black";
  const me = myUsername.toLowerCase();
  const iWhite = w.toLowerCase() === me;
  const opponent = iWhite ? b : w;
  const speed = g.speed ?? "game";
  let result: "win" | "loss" | "draw" = "draw";
  if (g.winner === "white") result = iWhite ? "win" : "loss";
  if (g.winner === "black") result = iWhite ? "loss" : "win";
  const ms = g.lastMoveAt ?? g.createdAt ?? 0;
  const playedAt = ms ? new Date(ms).toISOString() : "";
  return {
    id: g.id,
    playedAt,
    href: `https://lichess.org/${g.id}`,
    opponent,
    speed,
    rated: g.rated === true,
    result,
  };
}

function formatClashRow(
  b: ClashBattleJson,
  iconById: Map<number, string>,
): ClashBattleRow {
  const myCrowns = b.team?.[0]?.crowns ?? 0;
  const oppCrowns = b.opponent?.[0]?.crowns ?? 0;
  const arena = b.arena?.name ?? "Arena";
  const mode = humanizeClashMode(b.gameMode?.name);
  const oppName = b.opponent?.[0]?.name ?? "Opponent";
  const deck = b.deckSelection
    ? humanizeClashMode(b.deckSelection)
    : "";

  const outcome: "win" | "loss" | "draw" =
    myCrowns > oppCrowns ? "win" : myCrowns < oppCrowns ? "loss" : "draw";

  const subtitleTags: string[] = [];
  if (deck) subtitleTags.push(deck);
  if (b.isLadderTournament) subtitleTags.push("Tournament");

  return {
    battleTimeRaw: b.battleTime,
    battleTimeIso: parseClashBattleTimeIso(b.battleTime),
    title: `${arena} · ${mode}`,
    myCrowns,
    oppCrowns,
    subtitleTags,
    outcome,
    myDeckIconUrls: deckIconUrlsFromBattler(b.team?.[0], iconById),
    oppDeckIconUrls: deckIconUrlsFromBattler(b.opponent?.[0], iconById),
    opponentName: oppName,
  };
}

async function fetchLichessProfile(
  username: string,
): Promise<LichessProfileSummary | null> {
  const res = await fetch(
    `https://lichess.org/api/user/${encodeURIComponent(username)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  const j = (await res.json()) as Record<string, unknown>;
  const perfs = j.perfs as
    | Record<string, { rating?: number }>
    | undefined;
  const count = j.count as { all?: number } | undefined;
  const uname = String(j.username ?? j.id ?? username);
  return {
    username: uname,
    title: typeof j.title === "string" ? j.title : undefined,
    blitz: perfs?.blitz?.rating,
    rapid: perfs?.rapid?.rating,
    bullet: perfs?.bullet?.rating,
    classical: perfs?.classical?.rating,
    allGames: typeof count?.all === "number" ? count.all : undefined,
    profileHref: `https://lichess.org/@/${encodeURIComponent(uname)}`,
  };
}

async function fetchLichess(
  env: GameLogEnv | undefined,
): Promise<GamesLoaderData["lichess"]> {
  const username = env?.LICHESS_USERNAME?.trim();
  if (!username) {
    return {
      ok: false,
      message:
        "Set LICHESS_USERNAME in wrangler vars (or .dev.vars) to load games.",
    };
  }

  const [profile, gamesRes] = await Promise.all([
    fetchLichessProfile(username),
    fetch(
      `https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=5`,
      { headers: { Accept: "application/x-ndjson" } },
    ),
  ]);

  if (!gamesRes.ok) {
    return {
      ok: false,
      message: `Lichess returned ${gamesRes.status}. Check the username is public.`,
    };
  }

  const text = await gamesRes.text();
  const games = parseNdjsonGames(text)
    .slice(0, 5)
    .map((g) => formatLichessRow(g, username));
  return { ok: true, profile, games };
}

function clashErrorMessage(
  res: Response,
  status: number,
  remote: string,
): string {
  const whitelistHint =
    status === 403 || status === 401
      ? " Ensure developer.clashroyale.com key allows proxy IP 45.79.218.79 (RoyaleAPI proxy). Regenerate JWT if it was exposed."
      : "";
  const hint =
    status === 404 ? " (check player tag, e.g. #TAG in-game)" : "";
  return `Clash Royale API ${status}${hint}${remote}${whitelistHint}`;
}

async function parseClashError(res: Response): Promise<string> {
  try {
    const errBody = (await res.clone().json()) as {
      message?: string;
      reason?: string;
    };
    if (typeof errBody?.message === "string") return ` — ${errBody.message}`;
    if (typeof errBody?.reason === "string") return ` — ${errBody.reason}`;
  } catch {
    /* ignore */
  }
  return "";
}

async function fetchClashProfile(
  base: string,
  pathTag: string,
  token: string,
): Promise<{ profile: ClashProfileSummary | null; error?: string }> {
  const url = `${base}/v1/players/${pathTag}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const remote = await parseClashError(res);
    return {
      profile: null,
      error: clashErrorMessage(res, res.status, remote),
    };
  }
  const p = (await res.json()) as Record<string, unknown>;
  const clan = p.clan as { name?: string; tag?: string } | undefined;
  const profile: ClashProfileSummary = {
    name: String(p.name ?? ""),
    tag: String(p.tag ?? ""),
    trophies: Number(p.trophies ?? 0),
    bestTrophies: Number(p.bestTrophies ?? 0),
    wins: Number(p.wins ?? 0),
    losses: Number(p.losses ?? 0),
    battleCount: Number(p.battleCount ?? 0),
    threeCrownWins:
      typeof p.threeCrownWins === "number" ? p.threeCrownWins : undefined,
    clanName: typeof clan?.name === "string" ? clan.name : undefined,
    clanTag: typeof clan?.tag === "string" ? clan.tag : undefined,
  };
  return { profile };
}

async function fetchClashBattleLogList(
  base: string,
  pathTag: string,
  token: string,
): Promise<{ list: ClashBattleJson[]; error?: string }> {
  const url = `${base}/v1/players/${pathTag}/battlelog`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const remote = await parseClashError(res);
    return {
      list: [],
      error: clashErrorMessage(res, res.status, remote),
    };
  }
  const data = (await res.json()) as unknown;
  const list = Array.isArray(data) ? data : [];
  return { list: list as ClashBattleJson[] };
}

async function fetchClash(
  env: GameLogEnv | undefined,
): Promise<GamesLoaderData["clash"]> {
  const token = env?.CLASH_ROYALE_API_TOKEN?.trim();
  const rawTag = env?.CLASH_ROYALE_PLAYER_TAG?.trim();
  if (!token || !rawTag) {
    return {
      ok: false,
      message:
        "Set CLASH_ROYALE_API_TOKEN (wrangler secret put / .dev.vars) and CLASH_ROYALE_PLAYER_TAG. With proxy.royaleapi.dev, whitelist IP 45.79.218.79 on your key at developer.clashroyale.com (see RoyaleAPI proxy docs).",
    };
  }

  const tagForUrl = rawTag.startsWith("#") ? rawTag : `#${rawTag}`;
  const pathTag = encodeURIComponent(tagForUrl);
  const base = clashApiBase(env);

  const [profileResult, iconMap, logResult] = await Promise.all([
    fetchClashProfile(base, pathTag, token),
    fetchClashCardIconMap(base, token),
    fetchClashBattleLogList(base, pathTag, token),
  ]);

  const battles = logResult.error
    ? []
    : logResult.list
        .slice(0, 5)
        .map((row) => formatClashRow(row, iconMap));

  if (profileResult.error && logResult.error) {
    return { ok: false, message: profileResult.error };
  }

  return {
    ok: true,
    profile: profileResult.profile,
    battles,
  };
}

function cocErrorMessage(res: Response, status: number, remote: string): string {
  const hint =
    status === 403 || status === 401
      ? " Ensure developer.clashofclans.com key allows this request IP (Cloudflare Workers may need a static egress or IP allowlist update)."
      : "";
  const tagHint = status === 404 ? " (check player tag format #XXXX)" : "";
  return `Clash of Clans API ${status}${tagHint}${remote}${hint}`;
}

async function parseCocError(res: Response): Promise<string> {
  try {
    const errBody = (await res.clone().json()) as {
      message?: string;
      reason?: string;
    };
    if (typeof errBody?.message === "string") return ` — ${errBody.message}`;
    if (typeof errBody?.reason === "string") return ` — ${errBody.reason}`;
  } catch {
    /* ignore */
  }
  return "";
}

type CocBattleJson = {
  battleType?: string;
  attack?: boolean;
  opponentPlayerTag?: string;
  stars?: number;
  destructionPercentage?: number;
  armyShareCode?: string;
};

function pickClanBadgeUrl(
  clan: { badgeUrls?: Record<string, string> } | undefined,
): string | undefined {
  const b = clan?.badgeUrls;
  if (!b || typeof b !== "object") return undefined;
  const medium = b.medium;
  const large = b.large;
  const small = b.small;
  if (typeof medium === "string" && medium.length > 0) return medium;
  if (typeof large === "string" && large.length > 0) return large;
  if (typeof small === "string" && small.length > 0) return small;
  return undefined;
}

function pickLeagueIconUrl(p: Record<string, unknown>): string | undefined {
  const tier = p.leagueTier as
    | { iconUrls?: { small?: string; large?: string } }
    | undefined;
  const league = p.league as
    | { iconUrls?: { small?: string; medium?: string; tiny?: string } }
    | undefined;
  const tLarge = tier?.iconUrls?.large;
  const tSmall = tier?.iconUrls?.small;
  const lMed = league?.iconUrls?.medium;
  const lSmall = league?.iconUrls?.small;
  if (typeof tLarge === "string" && tLarge.length > 0) return tLarge;
  if (typeof tSmall === "string" && tSmall.length > 0) return tSmall;
  if (typeof lMed === "string" && lMed.length > 0) return lMed;
  if (typeof lSmall === "string" && lSmall.length > 0) return lSmall;
  return undefined;
}

function pickLeagueName(p: Record<string, unknown>): string | undefined {
  const tier = p.leagueTier as { name?: string } | undefined;
  const league = p.league as { name?: string } | undefined;
  if (typeof tier?.name === "string" && tier.name.length > 0) return tier.name;
  if (typeof league?.name === "string" && league.name.length > 0)
    return league.name;
  return undefined;
}

function parseCocHeroesHome(p: Record<string, unknown>): CocHeroRow[] | undefined {
  const raw = p.heroes;
  if (!Array.isArray(raw)) return undefined;
  const rows: CocHeroRow[] = [];
  for (const h of raw) {
    if (!h || typeof h !== "object") continue;
    const o = h as {
      name?: string;
      level?: number;
      maxLevel?: number;
      village?: string;
      iconUrls?: { medium?: string; small?: string };
    };
    if (o.village !== "home") continue;
    if (typeof o.name !== "string" || typeof o.level !== "number") continue;
    const fromApi =
      typeof o.iconUrls?.medium === "string" && o.iconUrls.medium.length > 0
        ? o.iconUrls.medium
        : typeof o.iconUrls?.small === "string" && o.iconUrls.small.length > 0
          ? o.iconUrls.small
          : undefined;
    const portraitUrl = fromApi ?? cocHeroPortraitUrl(o.name);
    rows.push({
      name: o.name,
      level: o.level,
      maxLevel: typeof o.maxLevel === "number" ? o.maxLevel : o.level,
      ...(portraitUrl ? { portraitUrl } : {}),
    });
  }
  rows.sort((a, b) => b.level - a.level);
  return rows.slice(0, 6);
}

function buildCocLegendLine(
  legend: Record<string, unknown> | undefined,
): { legendTrophies?: number; legendSeasonLine?: string } {
  if (!legend || typeof legend !== "object") return {};
  const lt = legend.legendTrophies;
  const legendTrophies = typeof lt === "number" ? lt : undefined;
  const cur = legend.currentSeason as
    | { rank?: number; trophies?: number }
    | undefined;
  if (cur && typeof cur === "object") {
    const parts: string[] = [];
    if (typeof cur.rank === "number") parts.push(`rank ${cur.rank}`);
    if (typeof cur.trophies === "number")
      parts.push(`${cur.trophies.toLocaleString()} legend trophies`);
    if (parts.length) {
      return { legendTrophies, legendSeasonLine: parts.join(" · ") };
    }
  }
  return { legendTrophies };
}

async function fetchCocProfile(
  base: string,
  pathTag: string,
  token: string,
): Promise<{ profile: CocProfileSummary | null; error?: string }> {
  const url = `${base}/v1/players/${pathTag}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const remote = await parseCocError(res);
    return {
      profile: null,
      error: cocErrorMessage(res, res.status, remote),
    };
  }
  const p = (await res.json()) as Record<string, unknown>;
  const clan = p.clan as
    | { name?: string; tag?: string; badgeUrls?: Record<string, string> }
    | undefined;
  const legendRaw = p.legendStatistics as Record<string, unknown> | undefined;
  const { legendTrophies, legendSeasonLine } = buildCocLegendLine(legendRaw);

  const roleRaw = p.role;
  const role = typeof roleRaw === "string" ? roleRaw : undefined;

  const heroesHome = parseCocHeroesHome(p);
  const clanBadgeUrl = pickClanBadgeUrl(clan);
  const leagueIconUrl = pickLeagueIconUrl(p);
  const leagueName = pickLeagueName(p);

  const profile: CocProfileSummary = {
    name: String(p.name ?? ""),
    tag: String(p.tag ?? ""),
    townHallLevel: Number(p.townHallLevel ?? 0),
    townHallWeaponLevel:
      typeof p.townHallWeaponLevel === "number"
        ? p.townHallWeaponLevel
        : undefined,
    expLevel: typeof p.expLevel === "number" ? p.expLevel : undefined,
    trophies: Number(p.trophies ?? 0),
    bestTrophies: Number(p.bestTrophies ?? 0),
    warStars: Number(p.warStars ?? 0),
    attackWins: Number(p.attackWins ?? 0),
    defenseWins: Number(p.defenseWins ?? 0),
    builderHallLevel:
      typeof p.builderHallLevel === "number" ? p.builderHallLevel : undefined,
    builderBaseTrophies:
      typeof p.builderBaseTrophies === "number"
        ? p.builderBaseTrophies
        : undefined,
    clanName: typeof clan?.name === "string" ? clan.name : undefined,
    clanTag: typeof clan?.tag === "string" ? clan.tag : undefined,
    clanBadgeUrl,
    role,
    leagueName,
    leagueIconUrl,
    heroesHome: heroesHome?.length ? heroesHome : undefined,
    legendTrophies,
    legendSeasonLine,
  };
  return { profile };
}

function formatCocBattleRow(b: CocBattleJson): CocBattleRow {
  const battleType =
    typeof b.battleType === "string" && b.battleType.length > 0
      ? b.battleType
      : "unknown";
  return {
    battleType,
    attack: b.attack === true,
    opponentTag:
      typeof b.opponentPlayerTag === "string" ? b.opponentPlayerTag : "—",
    stars: typeof b.stars === "number" ? b.stars : 0,
    destructionPercent:
      typeof b.destructionPercentage === "number"
        ? b.destructionPercentage
        : 0,
    armyShareCode:
      typeof b.armyShareCode === "string" && b.armyShareCode.length > 0
        ? b.armyShareCode
        : undefined,
  };
}

async function fetchCocBattleLog(
  base: string,
  pathTag: string,
  token: string,
): Promise<CocBattleRow[]> {
  const url = `${base}/v1/players/${pathTag}/battlelog`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as
    | CocBattleJson[]
    | { items?: CocBattleJson[] };
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: CocBattleJson[] }).items)
      ? (data as { items: CocBattleJson[] }).items
      : [];
  return items.slice(0, 5).map((row) => formatCocBattleRow(row));
}

async function fetchCoc(
  env: GameLogEnv | undefined,
): Promise<GamesLoaderData["coc"]> {
  const token = env?.CLASH_OF_CLANS_API_TOKEN?.trim();
  const rawTag = env?.CLASH_OF_CLANS_PLAYER_TAG?.trim();
  if (!token || !rawTag) {
    return {
      ok: false,
      message:
        "Set CLASH_OF_CLANS_API_TOKEN and CLASH_OF_CLANS_PLAYER_TAG in wrangler vars or .dev.vars (JWT from developer.clashofclans.com).",
    };
  }

  const tagForUrl = rawTag.startsWith("#") ? rawTag : `#${rawTag}`;
  const pathTag = encodeURIComponent(tagForUrl);
  const base = cocApiBase(env);

  const [result, battles] = await Promise.all([
    fetchCocProfile(base, pathTag, token),
    fetchCocBattleLog(base, pathTag, token),
  ]);
  if (result.error) {
    return { ok: false, message: result.error };
  }
  return { ok: true, profile: result.profile, battles };
}

export async function loadGameLogs(
  context: AppLoadContext,
): Promise<GamesLoaderData> {
  const env = context.cloudflare?.env as GameLogEnv | undefined;

  return withMemoryCache(
    gameLogsCacheKey(env),
    GAME_LOGS_CACHE_MS,
    async () => {
      const [lichess, clash, coc] = await Promise.all([
        fetchLichess(env),
        fetchClash(env),
        fetchCoc(env),
      ]);
      return { lichess, clash, coc };
    },
  );
}
