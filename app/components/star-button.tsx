import { Star } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { useFetcher, useLocation } from "react-router";
import { cn } from "~/lib/utils";

type StarState = {
  /** OAuth is set up server-side; when false the button just links to GitHub. */
  configured: boolean;
  authed: boolean;
  /** Lowercased repo name → viewer has starred it. */
  starred: Record<string, boolean>;
};

const StarStateContext = createContext<StarState>({
  configured: false,
  authed: false,
  starred: {},
});

/**
 * Loads the visitor's auth + per-repo starred state after mount, so the
 * document itself stays anonymous and publicly cacheable. Wrap the tree that
 * contains <StarButton>s in the returned <Provider>.
 */
export function StarStateProvider({
  repoNames,
  children,
}: {
  repoNames: string[];
  children: React.ReactNode;
}) {
  const fetcher = useFetcher<StarState>();
  const load = fetcher.load;
  // Stable key so the effect fires once, not on every render (the array prop
  // gets a fresh identity each parent render).
  const repos = repoNames.join(",");

  useEffect(() => {
    if (!repos) return;
    load(`/resources/github-star?repos=${encodeURIComponent(repos)}`);
  }, [load, repos]);

  const value: StarState = fetcher.data ?? {
    configured: false,
    authed: false,
    starred: {},
  };

  return (
    <StarStateContext.Provider value={value}>
      {children}
    </StarStateContext.Provider>
  );
}

type ToggleResponse = { starred?: boolean; needsAuth?: boolean; error?: string };

/**
 * Star badge + toggle. Shows the count only when it exceeds 10 (per the design),
 * but the star icon is always actionable:
 *   - not configured → links to the repo on GitHub
 *   - not signed in  → kicks off GitHub OAuth, remembering the intended star
 *   - signed in      → toggles the star in place (optimistic)
 */
export function StarButton({
  owner,
  repo,
  githubUrl,
  count,
}: {
  owner: string;
  repo: string;
  githubUrl: string;
  count?: number;
}) {
  const { configured, authed, starred } = useContext(StarStateContext);
  const key = repo.toLowerCase();
  const fetcher = useFetcher<ToggleResponse>();
  const { pathname } = useLocation();

  const [on, setOn] = useState(false);
  // Sync from hydration (and reconcile after a toggle response).
  useEffect(() => setOn(Boolean(starred[key])), [starred, key]);

  const authUrl = `/resources/github-auth?redirectTo=${encodeURIComponent(
    pathname,
  )}&star=${encodeURIComponent(`${owner}/${repo}`)}`;

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (fetcher.data.needsAuth) window.location.href = authUrl;
    else if (typeof fetcher.data.starred === "boolean") setOn(fetcher.data.starred);
    else if (fetcher.data.error) setOn(Boolean(starred[key])); // revert
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  const hasCount = typeof count === "number" && count > 10;
  const label = on ? `Unstar ${repo} on GitHub` : `Star ${repo} on GitHub`;
  const badge = (
    <>
      <Star
        className={cn("size-3", (on || hasCount) && "fill-current")}
        aria-hidden
      />
      {hasCount && count}
    </>
  );
  const shared =
    "ml-2 inline-flex items-center gap-0.5 rounded-xs align-middle text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  // Fallback: no OAuth configured → link to the repo (visitor stars there).
  if (!configured) {
    return (
      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer noopener"
        title={hasCount ? `${count} stars on GitHub` : "Star on GitHub"}
        aria-label={label}
        className={cn(shared, "text-muted-foreground/60 hover:text-bright")}
      >
        {badge}
      </a>
    );
  }

  const busy = fetcher.state !== "idle";
  function onClick() {
    if (!authed) {
      window.location.href = authUrl;
      return;
    }
    const next = !on;
    setOn(next); // optimistic
    fetcher.submit(
      { repo, star: String(next) },
      { method: "post", action: "/resources/github-star" },
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      title={on ? "Starred — click to unstar" : "Star this repo"}
      aria-label={label}
      className={cn(
        shared,
        "cursor-pointer disabled:opacity-60",
        on ? "text-amber-500 hover:text-amber-400" : "text-muted-foreground/60 hover:text-bright",
      )}
    >
      {badge}
    </button>
  );
}
