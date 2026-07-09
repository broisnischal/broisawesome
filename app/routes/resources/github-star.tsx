import { data } from "react-router";
import { fetchGitHubRepoStars } from "~/.server/github-repos";
import {
  clearSessionCookie,
  deleteSession,
  getViewer,
  isConfigured,
  readSessionId,
  setStar,
} from "~/.server/github-oauth";
import type { Route } from "./+types/github-star";

const DEFAULT_OWNER = "broisnischal";

/** Per-visitor and never shared-cacheable. */
const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

function owner(env: Cloudflare.Env | undefined): string {
  return (env?.GITHUB_USERNAME?.trim() || DEFAULT_OWNER).replace(/^@/, "");
}

/** GET → the visitor's auth + per-repo starred state (client hydration). */
export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const url = new URL(request.url);
  const names = (url.searchParams.get("repos") ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const viewer = await getViewer(request, env);
  const starred: Record<string, boolean> = {};

  if (viewer && names.length) {
    const { stars } = await fetchGitHubRepoStars(env, names, viewer.token);
    for (const name of names) {
      starred[name.toLowerCase()] = Boolean(
        stars[name.toLowerCase()]?.viewerHasStarred,
      );
    }
  }

  return data(
    {
      configured: isConfigured(env),
      authed: Boolean(viewer),
      login: viewer?.login ?? null,
      starred,
    },
    { headers: NO_STORE },
  );
}

/** POST { repo, star } → toggles the star for the signed-in visitor. */
export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare?.env;
  const viewer = await getViewer(request, env);
  if (!viewer) {
    return data({ needsAuth: true }, { status: 401, headers: NO_STORE });
  }

  const form = await request.formData();
  const repo = String(form.get("repo") ?? "").trim();
  const want = String(form.get("star") ?? "") === "true";
  if (!repo) {
    return data({ error: "Missing repo." }, { status: 400, headers: NO_STORE });
  }

  const result = await setStar(viewer.token, owner(env), repo, want);
  if (!result.ok) {
    // 401/403 → the stored token is invalid or lacks the Starring permission.
    // Drop the session so the next click re-authorizes with a fresh token.
    if (result.status === 401 || result.status === 403) {
      await deleteSession(env?.NEWSLETTER_KV, readSessionId(request));
      const headers = new Headers(NO_STORE);
      headers.append("Set-Cookie", clearSessionCookie());
      const hint =
        " — re-authorizing. If it still fails, grant the GitHub App the “Starring” account permission (Read and write).";
      return data(
        {
          needsAuth: true,
          error: `${result.message || `GitHub returned ${result.status}`}${hint}`,
          status: result.status,
        },
        { status: 401, headers },
      );
    }
    return data(
      {
        error: result.message || `GitHub returned ${result.status}`,
        status: result.status,
      },
      { status: 502, headers: NO_STORE },
    );
  }

  return data({ starred: want }, { headers: NO_STORE });
}
