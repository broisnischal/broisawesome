import { redirect } from "react-router";
import {
  clearStateCookie,
  exchangeCodeForToken,
  fetchViewerLogin,
  readOAuthState,
  serializeSessionCookie,
  setStar,
  storeSession,
} from "~/.server/github-oauth";
import type { Route } from "./+types/github-callback";

const DEFAULT_OWNER = "broisnischal";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const saved = readOAuthState(request);
  const redirectTo = saved?.redirectTo ?? "/";

  const headers = new Headers();
  headers.append("Set-Cookie", clearStateCookie());

  const fail = () => {
    headers.set("Location", `${redirectTo}?auth=error`);
    return new Response(null, { status: 302, headers });
  };

  // CSRF: the state GitHub echoes must match our short-lived cookie.
  if (!env || !code || !saved || saved.state !== returnedState) return fail();

  const token = await exchangeCodeForToken(env, code, url.origin);
  if (!token) return fail();

  const login = await fetchViewerLogin(token);

  // Opaque session id → cookie; token stays server-side in KV.
  const id = crypto.randomUUID();
  await storeSession(env.NEWSLETTER_KV, id, { token, login });
  headers.append("Set-Cookie", serializeSessionCookie(id));

  // Honor a pending star captured before the login redirect.
  if (saved.star) {
    const [owner, repo] = saved.star.split("/");
    if (owner && repo) await setStar(token, owner || DEFAULT_OWNER, repo, true);
  }

  headers.set("Location", `${redirectTo}?auth=ok`);
  return new Response(null, { status: 302, headers });
}
