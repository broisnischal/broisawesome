export type LogStatus = "active" | "done" | "paused";

export type BookLog = {
  title: string;
  author?: string;
  status: LogStatus;
  note?: string;
  url?: string;
};

export type MovieLog = {
  title: string;
  year?: number;
  status: LogStatus;
  note?: string;
  url?: string;
};

export type BlogLog = {
  title: string;
  url: string;
  status: LogStatus;
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
  left: string;
  right: string;
  href: string;
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
  /** Crown line rendered bold, e.g. `0–3 crowns`. */
  crownsLine: string;
  /** Metadata after the crown line (` · ` joined). */
  subtitleRest: string;
  /** From crown counts (your team vs opponent in the API). */
  outcome: "win" | "loss" | "draw";
  /** Resolved from official `/v1/cards` `iconUrls.medium` (same order as API `cards`). */
  myDeckIconUrls: string[];
  oppDeckIconUrls: string[];
  opponentName: string;
};

export type GamesLoaderData = {
  lichess:
    | { ok: true; profile: LichessProfileSummary | null; games: LichessGameRow[] }
    | { ok: false; message: string };
  clash:
    | { ok: true; profile: ClashProfileSummary | null; battles: ClashBattleRow[] }
    | { ok: false; message: string };
};
