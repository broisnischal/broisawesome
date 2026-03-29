/** GitHub Events API → normalized items for activity UI. */

const DEFAULT_USERNAME = "broisnischal";
const API_VERSION = "2022-11-28";

export type GitHubActivityIcon =
  | "commit"
  | "repo"
  | "star"
  | "fork"
  | "issue"
  | "pr"
  | "release"
  | "public"
  | "delete"
  | "gist"
  | "default";

/** Timeline / feed colors: push = green, merge = purple, opened / starred = amber, etc. */
export type GitHubActivityAccent =
  | "push"
  | "merge"
  | "pr_open"
  | "pr"
  | "star"
  | "issue_open"
  | "issue_closed"
  | "issue"
  | "create"
  | "fork"
  | "release"
  | "public"
  | "delete"
  | "default";

export type GitHubActivityItem = {
  id: string;
  eventType: string;
  icon: GitHubActivityIcon;
  accent: GitHubActivityAccent;
  title: string;
  subtitle?: string;
  href: string;
  createdAt: string;
  /**
   * GitHub-style row: gray `action` + blue repo link + gray `tail`.
   * When all three of action, repoLabel, repoUrl are set, the UI renders this pattern.
   */
  action?: string;
  repoLabel?: string;
  repoUrl?: string;
  tail?: string;
  /** Push events: 7-char SHA for link label (matches `href` tip when present). */
  pushHeadShort?: string;
};

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  actor?: { login?: string };
  repo: { name: string } | null;
  payload: Record<string, unknown>;
};

function repoUrl(name: string) {
  return `https://github.com/${name}`;
}

/** Like GitHub feed: own repos show short name; others show owner/repo. */
function displayRepoLabel(actorLogin: string, fullName: string): string {
  const i = fullName.indexOf("/");
  if (i === -1) return fullName;
  const owner = fullName.slice(0, i);
  const short = fullName.slice(i + 1);
  return owner.toLowerCase() === actorLogin.toLowerCase() ? short : fullName;
}

/** GitHub often omits `payload.commits` in the REST Events API; `size` / `distinct_size` are authoritative. */
function pushCommitCount(p: Record<string, unknown>): number {
  const distinct =
    typeof p.distinct_size === "number" && p.distinct_size >= 0
      ? p.distinct_size
      : 0;
  const size = typeof p.size === "number" && p.size >= 0 ? p.size : 0;
  const fromArray = Array.isArray(p.commits) ? p.commits.length : 0;
  return Math.max(distinct, size, fromArray);
}

function pushEventHref(
  baseRepoHref: string,
  p: Record<string, unknown>,
  branch: string,
): string {
  const head = typeof p.head === "string" ? p.head : "";
  const before = typeof p.before === "string" ? p.before : "";
  const beforeIsNull = before === "" || /^0+$/.test(before);
  if (head && before && !beforeIsNull && before !== head) {
    return `${baseRepoHref}/compare/${before}...${head}`;
  }
  if (head) {
    return `${baseRepoHref}/commit/${head}`;
  }
  if (branch) {
    return `${baseRepoHref}/tree/${encodeURIComponent(branch)}`;
  }
  return `${baseRepoHref}/commits`;
}

/** Short display SHA for push rows (`payload.head`, or last entry in `payload.commits`). */
function pushHeadShortSha(p: Record<string, unknown>): string | undefined {
  const head = typeof p.head === "string" ? p.head.trim() : "";
  if (/^[0-9a-f]{7,40}$/i.test(head)) {
    return head.slice(0, 7);
  }
  const commits = Array.isArray(p.commits) ? p.commits : [];
  const last = commits[commits.length - 1] as { sha?: string } | undefined;
  const sha = typeof last?.sha === "string" ? last.sha.trim() : "";
  if (/^[0-9a-f]{7,40}$/i.test(sha)) {
    return sha.slice(0, 7);
  }
  return undefined;
}

function pickIcon(type: string): GitHubActivityIcon {
  switch (type) {
    case "PushEvent":
      return "commit";
    case "CreateEvent":
      return "repo";
    case "WatchEvent":
      return "star";
    case "ForkEvent":
      return "fork";
    case "IssuesEvent":
      return "issue";
    case "PullRequestEvent":
      return "pr";
    case "ReleaseEvent":
      return "release";
    case "PublicEvent":
      return "public";
    case "DeleteEvent":
      return "delete";
    case "GistEvent":
      return "gist";
    default:
      return "default";
  }
}

function parseEvent(ev: GitHubEvent): GitHubActivityItem | null {
  const repoName = ev.repo?.name;
  if (!repoName) return null;

  const actorLogin = ev.actor?.login?.trim() || DEFAULT_USERNAME;
  const baseHref = repoUrl(repoName);
  const p = ev.payload;
  const shortRepo = displayRepoLabel(actorLogin, repoName);

  switch (ev.type) {
    case "PushEvent": {
      const ref = typeof p.ref === "string" ? p.ref.replace(/^refs\/heads\//, "") : "";
      const commitCount = pushCommitCount(p);
      const href = pushEventHref(baseHref, p, ref);
      const pushHeadShort = pushHeadShortSha(p);
      const action =
        commitCount <= 0
          ? "Pushed to "
          : commitCount === 1
            ? "Pushed 1 commit to "
            : `Pushed ${commitCount} commits to `;
      const title =
        commitCount <= 0
          ? `Pushed to ${shortRepo}`
          : commitCount === 1
            ? `Pushed 1 commit to ${shortRepo}`
            : `Pushed ${commitCount} commits to ${shortRepo}`;
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "commit",
        accent: "push",
        title,
        subtitle: ref ? `on ${ref}` : undefined,
        href,
        createdAt: ev.created_at,
        action,
        repoLabel: shortRepo,
        repoUrl: baseHref,
        pushHeadShort,
      };
    }
    case "CreateEvent": {
      const refType = typeof p.ref_type === "string" ? p.ref_type : "";
      const ref = typeof p.ref === "string" ? p.ref : "";
      if (refType === "repository") {
        return {
          id: ev.id,
          eventType: ev.type,
          icon: "repo",
          accent: "create",
          title: `Created repository ${shortRepo}`,
          href: baseHref,
          createdAt: ev.created_at,
          action: "Created repository ",
          repoLabel: shortRepo,
          repoUrl: baseHref,
        };
      }
      if (refType === "branch" && ref) {
        const treeHref = `${baseHref}/tree/${encodeURIComponent(ref)}`;
        return {
          id: ev.id,
          eventType: ev.type,
          icon: "repo",
          accent: "create",
          title: `Created branch ${ref} in ${shortRepo}`,
          href: treeHref,
          createdAt: ev.created_at,
          action: `Created branch ${ref} in `,
          repoLabel: shortRepo,
          repoUrl: baseHref,
        };
      }
      if (refType === "tag" && ref) {
        const tagHref = `${baseHref}/releases/tag/${encodeURIComponent(ref)}`;
        return {
          id: ev.id,
          eventType: ev.type,
          icon: "release",
          accent: "release",
          title: `Created tag ${ref} in ${shortRepo}`,
          href: tagHref,
          createdAt: ev.created_at,
          action: `Created tag ${ref} in `,
          repoLabel: shortRepo,
          repoUrl: baseHref,
        };
      }
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "repo",
        accent: "create",
        title: `Created ${refType || "resource"} in ${repoName}`,
        href: baseHref,
        createdAt: ev.created_at,
      };
    }
    case "WatchEvent": {
      if (p.action !== "started") return null;
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "star",
        accent: "star",
        title: `Starred ${repoName}`,
        href: baseHref,
        createdAt: ev.created_at,
        action: "Starred ",
        repoLabel: repoName,
        repoUrl: baseHref,
      };
    }
    case "ForkEvent": {
      const forkee = p.forkee as { full_name?: string } | undefined;
      const forkName = forkee?.full_name;
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "fork",
        accent: "fork",
        title: `Forked ${repoName}`,
        subtitle: forkName ? `→ ${forkName}` : undefined,
        href: forkName ? repoUrl(forkName) : baseHref,
        createdAt: ev.created_at,
      };
    }
    case "IssuesEvent": {
      const action = typeof p.action === "string" ? p.action : "updated";
      const issue = p.issue as { title?: string; number?: number; html_url?: string } | undefined;
      const num = issue?.number;
      const title = issue?.title ?? "issue";
      const accent: GitHubActivityAccent =
        action === "opened"
          ? "issue_open"
          : action === "closed"
            ? "issue_closed"
            : "issue";
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "issue",
        accent,
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} issue${num != null ? ` #${num}` : ""}`,
        subtitle: title,
        href: typeof issue?.html_url === "string" ? issue.html_url : `${baseHref}/issues`,
        createdAt: ev.created_at,
      };
    }
    case "PullRequestEvent": {
      const action = typeof p.action === "string" ? p.action : "updated";
      const pr = p.pull_request as {
        title?: string;
        number?: number;
        html_url?: string;
        merged?: boolean;
      } | undefined;
      const num = pr?.number;
      const title = pr?.title ?? "pull request";
      const merged = pr?.merged === true;
      const accent: GitHubActivityAccent =
        action === "closed" && merged
          ? "merge"
          : action === "opened"
            ? "pr_open"
            : "pr";
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "pr",
        accent,
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} PR${num != null ? ` #${num}` : ""}`,
        subtitle: title,
        href: typeof pr?.html_url === "string" ? pr.html_url : `${baseHref}/pulls`,
        createdAt: ev.created_at,
      };
    }
    case "ReleaseEvent": {
      const action = typeof p.action === "string" ? p.action : "published";
      const release = p.release as { name?: string; tag_name?: string; html_url?: string } | undefined;
      const label = release?.name || release?.tag_name || "release";
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "release",
        accent: "release",
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${label}`,
        subtitle: repoName,
        href: typeof release?.html_url === "string" ? release.html_url : `${baseHref}/releases`,
        createdAt: ev.created_at,
      };
    }
    case "PublicEvent":
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "public",
        accent: "public",
        title: `Open-sourced ${repoName.split("/")[1] ?? repoName}`,
        href: baseHref,
        createdAt: ev.created_at,
      };
    case "DeleteEvent": {
      const refType = typeof p.ref_type === "string" ? p.ref_type : "ref";
      const ref = typeof p.ref === "string" ? p.ref : "";
      return {
        id: ev.id,
        eventType: ev.type,
        icon: "delete",
        accent: "delete",
        title: `Deleted ${refType}${ref ? ` ${ref}` : ""}`,
        subtitle: repoName,
        href: baseHref,
        createdAt: ev.created_at,
      };
    }
    default:
      return {
        id: ev.id,
        eventType: ev.type,
        icon: pickIcon(ev.type),
        accent: "default",
        title: `${ev.type.replace(/Event$/, "")} on ${repoName}`,
        href: baseHref,
        createdAt: ev.created_at,
      };
    }
}

export type GitHubActivityResult = {
  items: GitHubActivityItem[];
  username: string;
  fromApi: boolean;
  error?: string;
  rateLimitRemaining?: number;
};

export async function fetchGitHubActivity(
  env: Cloudflare.Env | undefined,
  options?: { perPage?: number },
): Promise<GitHubActivityResult> {
  const username = (env?.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME).replace(/^@/, "");
  const token = env?.GITHUB_TOKEN?.trim();
  const perPage = Math.min(Math.max(options?.perPage ?? 30, 1), 100);

  const url = `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=${perPage}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "nischal-portfolio-activity",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { headers });
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
        items: [],
        username,
        fromApi: true,
        error: message,
        rateLimitRemaining,
      };
    }

    const raw = (await res.json()) as GitHubEvent[];
    if (!Array.isArray(raw)) {
      return {
        items: [],
        username,
        fromApi: true,
        error: "Unexpected GitHub response",
        rateLimitRemaining,
      };
    }

    const items: GitHubActivityItem[] = [];
    for (const ev of raw) {
      const parsed = parseEvent(ev);
      if (parsed) items.push(parsed);
    }

    return { items, username, fromApi: true, rateLimitRemaining };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { items: [], username, fromApi: false, error: message };
  }
}

export function groupActivityByDate(items: GitHubActivityItem[]) {
  const groups: { dateKey: string; label: string; items: GitHubActivityItem[] }[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  for (const item of items) {
    const d = new Date(item.createdAt);
    const dateKey = d.toISOString().slice(0, 10);
    const label = formatter.format(d);
    let g = groups.find((x) => x.dateKey === dateKey);
    if (!g) {
      g = { dateKey, label, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}
