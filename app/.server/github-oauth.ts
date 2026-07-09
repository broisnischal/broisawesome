/**
 * GitHub OAuth (Web Application Flow) so a visitor can star repos in place.
 *
 * Security model:
 *   - The visitor's GitHub access token is NEVER sent to the browser. It lives
 *     in KV, keyed by a high-entropy opaque session id.
 *   - The browser only holds that session id in an httpOnly/secure cookie.
 *   - CSRF is handled with a random `state` echoed by GitHub and compared
 *     against a short-lived httpOnly cookie.
 *
 * Setup (owner, one-time):
 *   1. Create an OAuth App: https://github.com/settings/developers
 *      Authorization callback URL: `<origin>/resources/github-callback`
 *   2. `wrangler secret put GITHUB_OAUTH_CLIENT_ID`
 *      `wrangler secret put GITHUB_OAUTH_CLIENT_SECRET`
 *      (or add them to `.dev.vars` for local dev)
 */

import * as cookie from "cookie";

/** Classic scope required to star public repos (PUT /user/starred). */
const SCOPE = "public_repo";
const SESSION_COOKIE = "gh_session";
const STATE_COOKIE = "gh_oauth_state";
const KV_PREFIX = "gh_oauth:";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const STATE_TTL_SECONDS = 60 * 10; // 10 minutes
const CALLBACK_PATH = "/resources/github-callback";

export function isConfigured(env: Cloudflare.Env | undefined): boolean {
  return Boolean(
    env?.GITHUB_OAUTH_CLIENT_ID?.trim() &&
      env?.GITHUB_OAUTH_CLIENT_SECRET?.trim(),
  );
}

export function callbackUrl(origin: string): string {
  return `${origin}${CALLBACK_PATH}`;
}

/** 256 bits of entropy, hex-encoded — used for session ids and CSRF state. */
function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const baseCookie = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

// ── Session (opaque id in cookie ↔ token in KV) ────────────────────────────

export function readSessionId(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  return header ? cookie.parse(header)[SESSION_COOKIE] : undefined;
}

export function serializeSessionCookie(id: string): string {
  return cookie.serialize(SESSION_COOKIE, id, {
    ...baseCookie,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(): string {
  return cookie.serialize(SESSION_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

type StoredSession = { token: string; login?: string };

export async function storeSession(
  kv: KVNamespace | undefined,
  id: string,
  session: StoredSession,
): Promise<void> {
  if (!kv) return;
  await kv.put(KV_PREFIX + id, JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
}

async function readSession(
  kv: KVNamespace | undefined,
  id: string | undefined,
): Promise<StoredSession | undefined> {
  if (!kv || !id) return undefined;
  const raw = await kv.get(KV_PREFIX + id);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return undefined;
  }
}

export async function deleteSession(
  kv: KVNamespace | undefined,
  id: string | undefined,
): Promise<void> {
  if (kv && id) await kv.delete(KV_PREFIX + id);
}

/** The signed-in visitor's GitHub token + login, or null when anonymous. */
export async function getViewer(
  request: Request,
  env: Cloudflare.Env | undefined,
): Promise<StoredSession | null> {
  const session = await readSession(env?.NEWSLETTER_KV, readSessionId(request));
  return session ?? null;
}

// ── OAuth authorize / callback ─────────────────────────────────────────────

export type OAuthState = { state: string; redirectTo: string; star: string };

export function beginAuth(
  env: Cloudflare.Env,
  origin: string,
  intent: { redirectTo: string; star: string },
): { authorizeUrl: string; stateCookie: string } {
  const state = randomToken();
  const params = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_CLIENT_ID!.trim(),
    redirect_uri: callbackUrl(origin),
    scope: SCOPE,
    state,
    allow_signup: "true",
  });
  const payload: OAuthState = { state, ...intent };
  const stateCookie = cookie.serialize(STATE_COOKIE, JSON.stringify(payload), {
    ...baseCookie,
    maxAge: STATE_TTL_SECONDS,
  });
  return {
    authorizeUrl: `https://github.com/login/oauth/authorize?${params}`,
    stateCookie,
  };
}

export function readOAuthState(request: Request): OAuthState | undefined {
  const header = request.headers.get("cookie");
  const raw = header ? cookie.parse(header)[STATE_COOKIE] : undefined;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as OAuthState;
  } catch {
    return undefined;
  }
}

export function clearStateCookie(): string {
  return cookie.serialize(STATE_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

export async function exchangeCodeForToken(
  env: Cloudflare.Env,
  code: string,
  origin: string,
): Promise<string | null> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID!.trim(),
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET!.trim(),
      code,
      redirect_uri: callbackUrl(origin),
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    access_token?: string;
    error?: string;
  };
  return body.access_token ?? null;
}

/** Login of the token's owner, for display. */
export async function fetchViewerLogin(token: string): Promise<string | undefined> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "nischal-portfolio-star",
    },
  });
  if (!res.ok) return undefined;
  const body = (await res.json()) as { login?: string };
  return body.login;
}

// ── Star / unstar ──────────────────────────────────────────────────────────

export type StarResult = { ok: boolean; status: number; message?: string };

/** PUT (star) or DELETE (unstar). GitHub returns 204 on success. */
export async function setStar(
  token: string,
  owner: string,
  repo: string,
  on: boolean,
): Promise<StarResult> {
  const res = await fetch(
    `https://api.github.com/user/starred/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      method: on ? "PUT" : "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "nischal-portfolio-star",
      },
    },
  );

  if (res.status === 204) return { ok: true, status: 204 };

  let message: string | undefined;
  try {
    const body = (await res.json()) as { message?: string };
    message = body?.message;
  } catch {
    // non-JSON body
  }
  return { ok: false, status: res.status, message };
}
