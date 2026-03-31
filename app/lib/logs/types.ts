export type LogStatus = "active" | "done" | "paused";

export type BookLog = {
  title: string;
  author?: string;
  /** Optional publication year (shown under author like the reference shelf). */
  year?: number;
  status: LogStatus;
  note?: string;
  url?: string;
  /** Cover image URL (Open Library, CDN, etc.). */
  coverUrl?: string;
  /** ISBN-10/13; used to build Open Library cover URL when `coverUrl` is missing or fails. */
  isbn?: string;
  /** 0–5 stars; if omitted, stars are derived from `status` for the shelf UI. */
  rating?: number;
};

export type MovieLog = {
  title: string;
  year?: number;
  status: LogStatus;
  note?: string;
  url?: string;
  /** Poster image URL (e.g. TMDB `w185`). */
  posterUrl?: string;
  /** 0–5 stars under the poster; omitted → derived from `status`. */
  rating?: number;
  /** Use accent star color (e.g. “featured” slots in the reference layout). */
  featured?: boolean;
};

export type BlogLog = {
  title: string;
  url: string;
  status: LogStatus;
  note?: string;
};

/** English vocabulary / phrases — same JSON as books & movies (`glossary` array). */
export type GlossaryEntry = {
  term: string;
  definition?: string;
  example?: string;
  note?: string;
};

export type LichessProfileSummary = {
  username: string;
  title?: string;
  blitz?: number;
  rapid?: number;
  bullet?: number;
  classical?: number;
  allGames?: number;
  profileHref: string;
};

export type LichessGameRow = {
  id: string;
  playedAt: string;
  href: string;
  opponent: string;
  speed: string;
  rated: boolean;
  result: "win" | "loss" | "draw";
};

export type ClashProfileSummary = {
  name: string;
  tag: string;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  battleCount: number;
  threeCrownWins?: number;
  clanName?: string;
  clanTag?: string;
};

export type ClashBattleRow = {
  /** Raw value from the API (often `YYYYMMDDThhmmss.sssZ`, not ISO-8601). */
  battleTimeRaw: string;
  /** Parsed instant for `<time dateTime>` and formatting; null if unparseable. */
  battleTimeIso: string | null;
  title: string;
  /** Your crowns vs opponent (0–3); shown as small crown icons in the UI. */
  myCrowns: number;
  oppCrowns: number;
  /** Short labels (deck / ladder); omit redundant opponent name and raw event tags. */
  subtitleTags: string[];
  /** From crown counts (your team vs opponent in the API). */
  outcome: "win" | "loss" | "draw";
  /** Resolved from official `/v1/cards` `iconUrls.medium` (same order as API `cards`). */
  myDeckIconUrls: string[];
  oppDeckIconUrls: string[];
  opponentName: string;
};

/** Home-village heroes from GET /v1/players/{tag}. */
export type CocHeroRow = {
  name: string;
  level: number;
  maxLevel: number;
  /** Prefer API `iconUrls` when Supercell adds them; else wiki-mirrored in-game icon. */
  portraitUrl?: string;
};

/** Clash of Clans — GET /v1/players/{tag} + badge/icon URLs; GET /v1/players/{tag}/battlelog. */
export type CocProfileSummary = {
  name: string;
  tag: string;
  townHallLevel: number;
  /** Giga Tesla / monolith level when TH12+. */
  townHallWeaponLevel?: number;
  expLevel?: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  clanName?: string;
  clanTag?: string;
  /** Supercell CDN — clan badge. */
  clanBadgeUrl?: string;
  role?: string;
  leagueName?: string;
  /** Supercell CDN — league / legend league tier art. */
  leagueIconUrl?: string;
  /** Top home heroes by level (with portrait URLs when known). */
  heroesHome?: CocHeroRow[];
  /** Legend league legend trophies when in / recently in legends. */
  legendTrophies?: number;
  /** e.g. current legend season rank + trophies, when API returns them. */
  legendSeasonLine?: string;
};

/** From GET /v1/players/{tag}/battlelog — no replay URLs; armyShareCode is in-game army link. */
export type CocBattleRow = {
  battleType: string;
  attack: boolean;
  opponentTag: string;
  stars: number;
  destructionPercent: number;
  armyShareCode?: string;
};

export type GamesLoaderData = {
  lichess:
    | { ok: true; profile: LichessProfileSummary | null; games: LichessGameRow[] }
    | { ok: false; message: string };
  clash:
    | { ok: true; profile: ClashProfileSummary | null; battles: ClashBattleRow[] }
    | { ok: false; message: string };
  coc:
    | { ok: true; profile: CocProfileSummary | null; battles: CocBattleRow[] }
    | { ok: false; message: string };
};
