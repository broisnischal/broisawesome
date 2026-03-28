/**
 * GitHub REST: list public owner repos (with topics) for categorised sections
 * on the projects page (MCP, extensions, database, core infra).
 */

import type { GitHubRepoItem } from "~/.server/github-repos";

const DEFAULT_USERNAME = "broisnischal";
const API_VERSION = "2022-11-28";

export type GitHubOwnerReposResult = {
  repos: GitHubRepoItem[];
  username: string;
  fromApi: boolean;
  error?: string;
  rateLimitRemaining?: number;
};

type GitHubRepoJson = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  private?: boolean;
  archived: boolean;
  pushed_at: string | null;
  topics?: string[];
};

function normalizeRepo(r: GitHubRepoJson): GitHubRepoItem {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    htmlUrl: r.html_url,
    language: r.language,
    stargazersCount: r.stargazers_count,
    fork: r.fork,
    private: Boolean(r.private),
    archived: r.archived,
    pushedAt: r.pushed_at,
    topics: Array.isArray(r.topics) ? r.topics : [],
  };
}

export async function fetchGitHubOwnerRepos(
  env: Cloudflare.Env | undefined,
  options?: { perPage?: number },
): Promise<GitHubOwnerReposResult> {
  const username = (env?.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME).replace(/^@/, "");
  const token = env?.GITHUB_TOKEN?.trim();
  const perPage = Math.min(Math.max(options?.perPage ?? 100, 1), 100);

  const url = new URL(`https://api.github.com/users/${encodeURIComponent(username)}/repos`);
  url.searchParams.set("type", "owner");
  url.searchParams.set("sort", "pushed");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(perPage));

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "nischal-portfolio-projects",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url.toString(), { headers });
    const remaining = res.headers.get("x-ratelimit-remaining");
    const rateLimitRemaining = remaining ? Number(remaining) : undefined;

    if (!res.ok) {
      const errText = await res.text();
      let message = `GitHub API ${res.status}`;
      try {
        const j = JSON.parse(errText) as { message?: string };
        if (j.message) message = j.message;
      } catch {
        if (errText.length < 200) message = errText;
      }
      return {
        repos: [],
        username,
        fromApi: true,
        error: message,
        rateLimitRemaining,
      };
    }

    const raw = (await res.json()) as GitHubRepoJson[];
    if (!Array.isArray(raw)) {
      return {
        repos: [],
        username,
        fromApi: true,
        error: "Unexpected GitHub response",
        rateLimitRemaining,
      };
    }

    const repos = raw.map(normalizeRepo);
    return { repos, username, fromApi: true, rateLimitRemaining };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { repos: [], username, fromApi: false, error: message };
  }
}

function topicSet(repo: GitHubRepoItem): Set<string> {
  return new Set(repo.topics.map((t) => t.toLowerCase()));
}

/** Model Context Protocol servers & tooling */
export function isMcpRepository(repo: GitHubRepoItem): boolean {
  if (repo.private || repo.fork) return false;
  const name = repo.name.toLowerCase();
  const topics = topicSet(repo);
  if ([...topics].some((t) => t === "mcp" || t.includes("mcp"))) return true;
  if (/(^|[-_])mcp([-_]|$)/i.test(repo.name) || name.endsWith("-mcp") || name.startsWith("mcp-")) {
    return true;
  }
  const d = (repo.description || "").toLowerCase();
  if (d.includes("model context protocol")) return true;
  if (/\bmcp\b/.test(d) && (d.includes("server") || d.includes("client"))) return true;
  return false;
}

const BROWSER_TOPICS = new Set([
  "chrome-extension",
  "browser-extension",
  "webextension",
  "web-extension",
  "firefox-extension",
  "firefox-addon",
  "wxt",
  "plasmo",
  "edge-extension",
]);

const VSCODE_TOPICS = new Set([
  "vscode-extension",
  "vsce",
  "visual-studio-code",
  "visualstudiocode",
]);

export type ExtensionKind = "browser" | "vscode";

export function classifyExtensionRepository(
  repo: GitHubRepoItem,
): ExtensionKind[] {
  if (repo.private || repo.fork) return [];
  const topics = topicSet(repo);
  const name = repo.name.toLowerCase();
  const desc = (repo.description || "").toLowerCase();

  let browser =
    [...topics].some((t) => BROWSER_TOPICS.has(t)) ||
    name.includes("chrome-extension") ||
    name.includes("browser-extension") ||
    (name.includes("webextension") && !name.includes("vscode"));

  if (!browser) {
    browser =
      (name.includes("extension") &&
        (name.includes("chrome") ||
          name.includes("firefox") ||
          name.includes("edge") ||
          name.includes("browser") ||
          name.includes("safari"))) ||
      /\bchrome extension\b/i.test(repo.description || "") ||
      /\bbrowser extension\b/i.test(repo.description || "");
  }

  let vscode =
    [...topics].some((t) => VSCODE_TOPICS.has(t)) ||
    name.startsWith("vscode-") ||
    name.includes("vscode-extension") ||
    /\.vscode/i.test(repo.name);

  if (!vscode) {
    vscode =
      desc.includes("vscode extension") ||
      desc.includes("visual studio code extension") ||
      desc.includes("vs code extension");
  }

  const kinds: ExtensionKind[] = [];
  if (browser) kinds.push("browser");
  if (vscode) kinds.push("vscode");
  return kinds;
}

export function filterMcpRepos(
  repos: GitHubRepoItem[],
  excludeIds: Set<number>,
): GitHubRepoItem[] {
  return repos
    .filter((r) => isMcpRepository(r) && !excludeIds.has(r.id))
    .sort((a, b) => {
      const ta = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
      const tb = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
      return tb - ta;
    });
}

export type ExtensionRepoEntry = {
  repo: GitHubRepoItem;
  kinds: ExtensionKind[];
};

export function filterExtensionRepos(
  repos: GitHubRepoItem[],
  excludeIds: Set<number>,
): ExtensionRepoEntry[] {
  const out: ExtensionRepoEntry[] = [];
  for (const r of repos) {
    if (excludeIds.has(r.id)) continue;
    const kinds = classifyExtensionRepository(r);
    if (kinds.length === 0) continue;
    out.push({ repo: r, kinds });
  }
  out.sort((a, b) => {
    const ta = a.repo.pushedAt ? new Date(a.repo.pushedAt).getTime() : 0;
    const tb = b.repo.pushedAt ? new Date(b.repo.pushedAt).getTime() : 0;
    return tb - ta;
  });
  return out;
}

const DATABASE_TOPICS = new Set([
  "prisma",
  "drizzle",
  "drizzle-orm",
  "pglite",
  "postgresql",
  "postgres",
  "sqlite",
  "mysql",
  "mongodb",
  "redis",
  "typeorm",
  "kysely",
  "sequelize",
  "mikro-orm",
  "libsql",
  "turso",
  "neon",
  "orm",
  "database",
]);

/** Prisma, Drizzle, PGlite, SQL/ORM stacks, embedded DBs */
export function isDatabaseRelatedRepository(repo: GitHubRepoItem): boolean {
  if (repo.private || repo.fork) return false;
  const topics = topicSet(repo);
  if ([...topics].some((t) => DATABASE_TOPICS.has(t))) return true;
  if ([...topics].some((t) => t.includes("prisma") || t.includes("drizzle"))) {
    return true;
  }

  const name = repo.name.toLowerCase();
  if (
    name.includes("prisma") ||
    name.includes("drizzle") ||
    name.includes("pglite") ||
    name.includes("typeorm") ||
    name.includes("kysely") ||
    (name.includes("postgres") && !name.includes("postgrest")) ||
    name.includes("sqlite") ||
    name.includes("libsql") ||
    name.includes("turso")
  ) {
    return true;
  }

  const d = repo.description || "";
  const dl = d.toLowerCase();
  if (/\bprisma\b/i.test(d)) return true;
  if (/\bdrizzle\b/i.test(d) && (dl.includes("orm") || dl.includes("sql"))) {
    return true;
  }
  if (/\bpglite\b/i.test(d)) return true;
  if (/\blibsql\b/i.test(d) || /\bturso\b/i.test(d)) return true;
  return false;
}

/** Content delivery: edges, caches, asset networks */
export function isCdnRepository(repo: GitHubRepoItem): boolean {
  if (repo.private || repo.fork) return false;
  const topics = topicSet(repo);
  if (topics.has("cdn")) return true;
  const name = repo.name.toLowerCase();
  if (name === "cdn") return true;
  if (
    name.startsWith("cdn-") ||
    name.endsWith("-cdn") ||
    name.includes("-cdn-") ||
    /^cdn[-_]/.test(name)
  ) {
    return true;
  }
  const d = repo.description || "";
  if (/\bcdn\b/i.test(d)) return true;
  return false;
}

const DNS_TOPICS = new Set(["dns", "doh", "dot", "nameserver", "coredns"]);

/** Resolvers, authoritative servers, DoH/DoT experiments */
export function isDnsRepository(repo: GitHubRepoItem): boolean {
  if (repo.private || repo.fork) return false;
  const topics = topicSet(repo);
  if ([...topics].some((t) => DNS_TOPICS.has(t))) return true;
  const name = repo.name.toLowerCase();
  if (name === "dns") return true;
  if (
    /\bdns\b/.test(name) ||
    name.includes("nameserver") ||
    name.includes("coredns") ||
    name.startsWith("doh-") ||
    name.includes("-doh")
  ) {
    return true;
  }
  const dl = (repo.description || "").toLowerCase();
  if (/\bdns\b/.test(dl)) {
    if (
      dl.includes("server") ||
      dl.includes("resolver") ||
      dl.includes("nameserver") ||
      dl.includes("coredns") ||
      dl.includes("from scratch") ||
      dl.includes("from core")
    ) {
      return true;
    }
  }
  if (dl.includes("domain name system")) return true;
  return false;
}

const VPN_TOPICS = new Set(["vpn", "wireguard", "openvpn", "tailscale", "zerotier"]);

/** Tunnels, WireGuard, OpenVPN, VPN clients/servers */
export function isVpnRepository(repo: GitHubRepoItem): boolean {
  if (repo.private || repo.fork) return false;
  const topics = topicSet(repo);
  if ([...topics].some((t) => VPN_TOPICS.has(t))) return true;
  const name = repo.name.toLowerCase();
  if (name === "vpn") return true;
  if (
    /\bvpn\b/.test(name) ||
    name.includes("wireguard") ||
    name.includes("openvpn") ||
    name.includes("ipsec")
  ) {
    return true;
  }
  const d = repo.description || "";
  const dl = d.toLowerCase();
  if (/\bvpn\b/i.test(d) || /\bwireguard\b/i.test(d) || /\bopenvpn\b/i.test(d)) {
    return true;
  }
  if (dl.includes("virtual private network")) return true;
  if (
    name.includes("tunnel") &&
    (dl.includes("vpn") || dl.includes("wireguard") || dl.includes("encrypted"))
  ) {
    return true;
  }
  return false;
}

export function filterDatabaseRepos(
  repos: GitHubRepoItem[],
  excludeIds: Set<number>,
): GitHubRepoItem[] {
  return repos
    .filter((r) => isDatabaseRelatedRepository(r) && !excludeIds.has(r.id))
    .sort((a, b) => {
      const ta = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
      const tb = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
      return tb - ta;
    });
}

export type EdgeInfraKind = "cdn" | "dns" | "vpn";

export type EdgeInfraRepoEntry = {
  repo: GitHubRepoItem;
  kinds: EdgeInfraKind[];
};

const EDGE_PRIORITY_NAMES = new Set(["cdn", "dns", "vpn"]);

/** CDN, DNS, and VPN edge projects in one list (badges show which apply). */
export function filterEdgeInfraRepos(
  repos: GitHubRepoItem[],
  excludeIds: Set<number>,
): EdgeInfraRepoEntry[] {
  const out: EdgeInfraRepoEntry[] = [];
  for (const r of repos) {
    if (excludeIds.has(r.id)) continue;
    const kinds: EdgeInfraKind[] = [];
    if (isCdnRepository(r)) kinds.push("cdn");
    if (isDnsRepository(r)) kinds.push("dns");
    if (isVpnRepository(r)) kinds.push("vpn");
    if (kinds.length === 0) continue;
    out.push({ repo: r, kinds });
  }
  out.sort((a, b) => {
    const pa = EDGE_PRIORITY_NAMES.has(a.repo.name) ? 0 : 1;
    const pb = EDGE_PRIORITY_NAMES.has(b.repo.name) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const ta = a.repo.pushedAt ? new Date(a.repo.pushedAt).getTime() : 0;
    const tb = b.repo.pushedAt ? new Date(b.repo.pushedAt).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return a.repo.name.localeCompare(b.repo.name);
  });
  return out;
}
