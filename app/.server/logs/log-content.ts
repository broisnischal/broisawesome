import { withConditionalMemoryCache } from "~/.server/memory-cache";
import { blogLogs, bookLogs, glossaryLogs, movieLogs } from "~/lib/logs/static";
import type {
  BlogLog,
  BookLog,
  GlossaryEntry,
  LogStatus,
  MovieLog,
} from "~/lib/logs/types";

/** Remote JSON refetch interval (GitHub raw CDN is slow; cache cuts repeat latency). */
const LOG_JSON_CACHE_MS = 5 * 60 * 1000;

/**
 * GET `LOG_JSON_URL` with a short in-memory TTL between refetches. Easiest hosts (no backend):
 * - GitHub: commit `public/log-content.json`, then use raw URL, e.g.
 *   `https://raw.githubusercontent.com/<user>/<repo>/<branch>/public/log-content.json`
 * - Gist: paste the same JSON, click Raw, copy that URL.
 * CDN cache may lag a few minutes on GitHub raw; append `?t=<timestamp>` to bust if needed.
 *
 * JSON shape:
 * `{ "books": [...], "movies": [...], "blogs": [...], "glossary": [...] }` — see `public/log-content.json`.
 * Omitted or invalid `status` defaults to `active`. Malformed items are skipped.
 * If `LOG_JSON_URL` is unset or fetch fails, `~/lib/logs/static` fallback is used.
 */
type LogJsonEnv = { LOG_JSON_URL?: string };

type LogJsonRoot = {
  books?: unknown;
  movies?: unknown;
  blogs?: unknown;
  glossary?: unknown;
};

const STATUSES: LogStatus[] = ["active", "done", "paused"];

function isStatus(s: unknown): s is LogStatus {
  return typeof s === "string" && STATUSES.includes(s as LogStatus);
}

function clampRating(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(5, Math.max(0, n));
}

function normalizeBook(raw: unknown): BookLog | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) return null;
  const status = isStatus(o.status) ? o.status : "active";
  const year =
    typeof o.year === "number" && Number.isFinite(o.year)
      ? Math.trunc(o.year)
      : undefined;
  const rating = clampRating(o.rating);
  return {
    title: o.title.trim(),
    ...(typeof o.author === "string" && o.author ? { author: o.author } : {}),
    ...(year != null ? { year } : {}),
    status,
    ...(typeof o.note === "string" && o.note ? { note: o.note } : {}),
    ...(typeof o.url === "string" && o.url ? { url: o.url } : {}),
    ...(typeof o.coverUrl === "string" && o.coverUrl.trim()
      ? { coverUrl: o.coverUrl.trim() }
      : {}),
    ...(typeof o.isbn === "string" && o.isbn.trim()
      ? { isbn: o.isbn.trim() }
      : {}),
    ...(rating != null ? { rating } : {}),
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
  const rating = clampRating(o.rating);
  const featured =
    o.featured === true ||
    o.featured === "true" ||
    o.featured === 1;
  return {
    title: o.title.trim(),
    ...(year != null ? { year } : {}),
    status,
    ...(typeof o.note === "string" && o.note ? { note: o.note } : {}),
    ...(typeof o.url === "string" && o.url ? { url: o.url } : {}),
    ...(typeof o.posterUrl === "string" && o.posterUrl.trim()
      ? { posterUrl: o.posterUrl.trim() }
      : {}),
    ...(rating != null ? { rating } : {}),
    ...(featured ? { featured: true } : {}),
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

function normalizeGlossary(raw: unknown): GlossaryEntry | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.term !== "string" || !o.term.trim()) return null;
  return {
    term: o.term.trim(),
    ...(typeof o.definition === "string" && o.definition.trim()
      ? { definition: o.definition.trim() }
      : {}),
    ...(typeof o.example === "string" && o.example.trim()
      ? { example: o.example.trim() }
      : {}),
    ...(typeof o.note === "string" && o.note.trim() ? { note: o.note.trim() } : {}),
  };
}

export type LogJsonContentResult = {
  bookLogs: BookLog[];
  movieLogs: MovieLog[];
  blogLogs: BlogLog[];
  glossaryLogs: GlossaryEntry[];
  fromRemote: boolean;
  remoteError: string | null;
};

function fallback(): Pick<
  LogJsonContentResult,
  "bookLogs" | "movieLogs" | "blogLogs" | "glossaryLogs"
> {
  return {
    bookLogs: bookLogs,
    movieLogs: movieLogs,
    blogLogs: blogLogs,
    glossaryLogs: glossaryLogs,
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

  const cacheKey = `log-json:${url}`;

  return withConditionalMemoryCache(
    cacheKey,
    LOG_JSON_CACHE_MS,
    async () => {
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
          } satisfies LogJsonContentResult;
        }

        const data = (await res.json()) as LogJsonRoot;
        const booksRaw = Array.isArray(data.books) ? data.books : [];
        const moviesRaw = Array.isArray(data.movies) ? data.movies : [];
        const blogsRaw = Array.isArray(data.blogs) ? data.blogs : [];
        const glossaryRaw = Array.isArray(data.glossary) ? data.glossary : [];

        const bookLogsOut = booksRaw
          .map(normalizeBook)
          .filter((x): x is BookLog => x != null);
        const movieLogsOut = moviesRaw
          .map(normalizeMovie)
          .filter((x): x is MovieLog => x != null);
        const blogLogsOut = blogsRaw
          .map(normalizeBlog)
          .filter((x): x is BlogLog => x != null);
        const glossaryLogsOut = glossaryRaw
          .map(normalizeGlossary)
          .filter((x): x is GlossaryEntry => x != null);

        return {
          bookLogs: bookLogsOut,
          movieLogs: movieLogsOut,
          blogLogs: blogLogsOut,
          glossaryLogs: glossaryLogsOut,
          fromRemote: true,
          remoteError: null,
        } satisfies LogJsonContentResult;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "request failed";
        return {
          ...fb,
          fromRemote: false,
          remoteError: msg,
        } satisfies LogJsonContentResult;
      }
    },
    (r) => r.fromRemote === true && r.remoteError == null,
  );
}
