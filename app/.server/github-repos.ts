/** GitHub GraphQL: profile pinned repositories for the projects page. */

const DEFAULT_USERNAME = "broisnischal";

export type GitHubRepoItem = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stargazersCount: number;
  fork: boolean;
  private: boolean;
  archived: boolean;
  pushedAt: string | null;
  topics: string[];
};

export type GitHubReposResult = {
  repos: GitHubRepoItem[];
  username: string;
  fromApi: boolean;
  error?: string;
  rateLimitRemaining?: number;
};

const PINNED_QUERY = `
query UserPinnedRepos($login: String!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          databaseId
          name
          nameWithOwner
          description
          url
          isPrivate
          isFork
          isArchived
          stargazerCount
          pushedAt
          primaryLanguage { name }
          repositoryTopics(first: 10) {
            nodes { topic { name } }
          }
        }
      }
    }
  }
}
`;

type PinnedGraphQLResponse = {
  data?: {
    user: {
      pinnedItems: {
        nodes: Array<{
          databaseId: number | null;
          name: string;
          nameWithOwner: string;
          description: string | null;
          url: string;
          isPrivate: boolean;
          isFork: boolean;
          isArchived: boolean;
          stargazerCount: number;
          pushedAt: string | null;
          primaryLanguage: { name: string } | null;
          repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
        } | null> | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
  message?: string;
};

type PinnedRepoGqlNode = {
  databaseId: number | null;
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stargazerCount: number;
  pushedAt: string | null;
  primaryLanguage: { name: string } | null;
  repositoryTopics: { nodes: Array<{ topic: { name: string } } | null> | null };
};

function mapPinnedNode(node: PinnedRepoGqlNode): GitHubRepoItem | null {
  if (!node || node.databaseId == null) return null;
  const topics =
    node.repositoryTopics?.nodes
      ?.map((n) => n?.topic?.name)
      .filter((t): t is string => Boolean(t)) ?? [];
  return {
    id: node.databaseId,
    name: node.name,
    fullName: node.nameWithOwner,
    description: node.description,
    htmlUrl: node.url,
    language: node.primaryLanguage?.name ?? null,
    stargazersCount: node.stargazerCount,
    fork: node.isFork,
    private: node.isPrivate,
    archived: node.isArchived,
    pushedAt: node.pushedAt,
    topics,
  };
}

/**
 * Public profile pins only (private / hidden repos omitted from the grid).
 */
export async function fetchGitHubPinnedRepos(
  env: Cloudflare.Env | undefined,
): Promise<GitHubReposResult> {
  const username = (env?.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME).replace(/^@/, "");
  const token = env?.GITHUB_TOKEN?.trim();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "nischal-portfolio-projects",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: PINNED_QUERY,
        variables: { login: username },
      }),
    });

    const remaining = res.headers.get("x-ratelimit-remaining");
    const rateLimitRemaining = remaining ? Number(remaining) : undefined;

    const body = (await res.json()) as PinnedGraphQLResponse;

    if (!res.ok) {
      const msg =
        body.message ||
        body.errors?.[0]?.message ||
        `GitHub GraphQL ${res.status}`;
      return {
        repos: [],
        username,
        fromApi: true,
        error: msg,
        rateLimitRemaining,
      };
    }

    if (body.errors?.length) {
      return {
        repos: [],
        username,
        fromApi: true,
        error: body.errors.map((e) => e.message).join("; "),
        rateLimitRemaining,
      };
    }

    const user = body.data?.user;
    if (!user) {
      return {
        repos: [],
        username,
        fromApi: true,
        error: `GitHub user “${username}” not found`,
        rateLimitRemaining,
      };
    }

    const nodes = user.pinnedItems?.nodes ?? [];
    const mapped: GitHubRepoItem[] = [];
    for (const n of nodes) {
      if (!n || n.isPrivate) continue;
      const item = mapPinnedNode(n);
      if (item) mapped.push(item);
    }

    return { repos: mapped, username, fromApi: true, rateLimitRemaining };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { repos: [], username, fromApi: false, error: message };
  }
}
