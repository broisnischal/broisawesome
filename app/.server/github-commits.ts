import { withConditionalMemoryCache } from "~/.server/memory-cache";

const DEFAULT_USERNAME = "broisnischal";
const TEN_MINUTES = 10 * 60 * 1000;

export type RecentCommit = {
  hash: string;
  subject: string;
  add: number;
  del: number;
  /** `owner/name` of the repo the commit lives in. */
  repo: string;
  url: string;
};

type SearchItem = {
  sha: string;
  url: string;
  html_url: string;
  commit: { message: string };
  parents: unknown[];
  repository: { full_name: string; private: boolean };
};

/**
 * My latest commits across every public repo I push to (not just this one),
 * newest first, with line stats. One commit search plus one call per commit
 * for stats; private repos are dropped so their messages never reach the
 * page, and merge commits are skipped. Cached for ten minutes.
 */
export function fetchRecentCommits(
  env: Cloudflare.Env | undefined,
  limit = 8,
): Promise<RecentCommit[]> {
  const username = (env?.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME).replace(
    /^@/,
    "",
  );
  const token = env?.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "nischal-portfolio-commits",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return withConditionalMemoryCache(
    `recent-commits:${username}`,
    TEN_MINUTES,
    async () => {
      try {
        const q = encodeURIComponent(`author:${username}`);
        const res = await fetch(
          `https://api.github.com/search/commits?q=${q}&sort=author-date&order=desc&per_page=30`,
          { headers },
        );
        if (!res.ok) return [];
        const body = (await res.json()) as { items?: SearchItem[] };
        const picked = (body.items ?? [])
          .filter((c) => !c.repository.private && c.parents.length < 2)
          .slice(0, limit);

        return await Promise.all(
          picked.map(async (c) => {
            let add = 0;
            let del = 0;
            try {
              const r = await fetch(c.url, { headers });
              if (r.ok) {
                const d = (await r.json()) as {
                  stats?: { additions: number; deletions: number };
                };
                add = d.stats?.additions ?? 0;
                del = d.stats?.deletions ?? 0;
              }
            } catch {
              // Stats are a nice-to-have; keep the row without them.
            }
            return {
              hash: c.sha.slice(0, 7),
              subject: c.commit.message.split("\n")[0],
              add,
              del,
              repo: c.repository.full_name,
              url: c.html_url,
            };
          }),
        );
      } catch {
        return [];
      }
    },
    (list) => list.length > 0,
  );
}
