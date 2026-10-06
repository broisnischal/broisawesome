import { withConditionalMemoryCache } from "~/.server/memory-cache";

const DEFAULT_USERNAME = "broisnischal";
const HOUR = 60 * 60 * 1000;

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

export type ContributionDay = { date: string; count: number; level: number };
export type Contributions = { total: number; weeks: ContributionDay[][] };

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

/**
 * My contribution calendar for the last year (the green squares on my GitHub
 * profile): per-day counts and quartile levels only, no repo names. Needs
 * GITHUB_TOKEN (GraphQL). Cached for an hour; failures aren't cached.
 */
export function fetchContributions(
  env: Cloudflare.Env | undefined,
): Promise<Contributions | null> {
  const login = (env?.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME).replace(
    /^@/,
    "",
  );
  const token = env?.GITHUB_TOKEN?.trim();
  if (!token) return Promise.resolve(null);

  return withConditionalMemoryCache(
    `contributions:${login}`,
    HOUR,
    async () => {
      try {
        const res = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "nischal-portfolio-contributions",
          },
          body: JSON.stringify({ query: QUERY, variables: { login } }),
        });
        if (!res.ok) return null;
        const body = (await res.json()) as {
          data?: {
            user?: {
              contributionsCollection: {
                contributionCalendar: {
                  totalContributions: number;
                  weeks: Array<{
                    contributionDays: Array<{
                      date: string;
                      contributionCount: number;
                      contributionLevel: keyof typeof LEVELS;
                    }>;
                  }>;
                };
              };
            };
          };
        };
        const cal =
          body.data?.user?.contributionsCollection.contributionCalendar;
        if (!cal) return null;
        return {
          total: cal.totalContributions,
          weeks: cal.weeks.map((w) =>
            w.contributionDays.map((d) => ({
              date: d.date,
              count: d.contributionCount,
              level: LEVELS[d.contributionLevel] ?? 0,
            })),
          ),
        };
      } catch {
        return null;
      }
    },
    (c) => c != null,
  );
}
