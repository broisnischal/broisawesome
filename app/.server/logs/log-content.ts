import { blogLogs, bookLogs, movieLogs } from "~/lib/logs/static";
import type { BlogLog, BookLog, LogStatus, MovieLog } from "~/lib/logs/types";

/**
 * GET `LOG_JSON_URL` each request. Easiest hosts (no backend):
 * - GitHub: commit `public/log-content.json`, then use raw URL, e.g.
 *   `https://raw.githubusercontent.com/<user>/<repo>/<branch>/public/log-content.json`
 * - Gist: paste the same JSON, click Raw, copy that URL.
 * CDN cache may lag a few minutes on GitHub raw; append `?t=<timestamp>` to bust if needed.
 *
 * JSON shape:
 * `{ "books": [...], "movies": [...], "blogs": [...] }` — see `public/log-content.json`.
 * Omitted or invalid `status` defaults to `active`. Malformed items are skipped.
 * If `LOG_JSON_URL` is unset or fetch fails, `~/lib/logs/static` fallback is used.
 */
type LogJsonEnv = { LOG_JSON_URL?: string };

type LogJsonRoot = {
  books?: unknown;
  movies?: unknown;
  blogs?: unknown;
};

const STATUSES: LogStatus[] = ["active", "done", "paused"];

function isStatus(s: unknown): s is LogStatus {
  return typeof s === "string" && STATUSES.includes(s as LogStatus);
}

function normalizeBook(raw: unknown): BookLog | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) return null;
  const status = isStatus(o.status) ? o.status : "active";
  return {
    title: o.title.trim(),
    ...(typeof o.author === "string" && o.author ? { author: o.author } : {}),
    status,
    ...(typeof o.note === "string" && o.note ? { note: o.note } : {}),
    ...(typeof o.url === "string" && o.url ? { url: o.url } : {}),
  };
}

function normalizeMovie(raw: unknown): MovieLog | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) return null;
  const status = isStatus(o.status) ? o.status : "active";
  const year =
    typeof o.year === "number" && Number.isFinite(o.year)
      ? Math.trunc(o.year)
      : undefined;
  return {
    title: o.title.trim(),
    ...(year != null ? { year } : {}),
    status,
    ...(typeof o.note === "string" && o.note ? { note: o.note } : {}),
    ...(typeof o.url === "string" && o.url ? { url: o.url } : {}),
  };
}

function normalizeBlog(raw: unknown): BlogLog | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) return null;
  if (typeof o.url !== "string" || !o.url.trim()) return null;
  const status = isStatus(o.status) ? o.status : "active";
  return {
    title: o.title.trim(),
    url: o.url.trim(),
    status,
    ...(typeof o.note === "string" && o.note ? { note: o.note } : {}),
  };
}

export type LogJsonContentResult = {
  bookLogs: BookLog[];
  movieLogs: MovieLog[];
  blogLogs: BlogLog[];
  fromRemote: boolean;
  remoteError: string | null;
};

function fallback(): Pick<
  LogJsonContentResult,
  "bookLogs" | "movieLogs" | "blogLogs"
> {
  return {
    bookLogs: bookLogs,
    movieLogs: movieLogs,
    blogLogs: blogLogs,
  };
}

export async function loadLogJsonContent(
  env: LogJsonEnv | undefined,
): Promise<LogJsonContentResult> {
  const fb = fallback();
  if (!env) {
    return { ...fb, fromRemote: false, remoteError: null };
  }

  const url = env.LOG_JSON_URL?.trim();
  if (!url) {
    return { ...fb, fromRemote: false, remoteError: null };
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      return {
        ...fb,
        fromRemote: false,
        remoteError: `LOG_JSON_URL HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as LogJsonRoot;
    const booksRaw = Array.isArray(data.books) ? data.books : [];
    const moviesRaw = Array.isArray(data.movies) ? data.movies : [];
    const blogsRaw = Array.isArray(data.blogs) ? data.blogs : [];

    const bookLogsOut = booksRaw
      .map(normalizeBook)
      .filter((x): x is BookLog => x != null);
    const movieLogsOut = moviesRaw
      .map(normalizeMovie)
      .filter((x): x is MovieLog => x != null);
    const blogLogsOut = blogsRaw
      .map(normalizeBlog)
      .filter((x): x is BlogLog => x != null);

    return {
      bookLogs: bookLogsOut,
      movieLogs: movieLogsOut,
      blogLogs: blogLogsOut,
      fromRemote: true,
      remoteError: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "request failed";
    return {
      ...fb,
      fromRemote: false,
      remoteError: msg,
    };
  }
}
