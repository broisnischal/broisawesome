import { redirect } from "react-router";
import { beginAuth, isConfigured } from "~/.server/github-oauth";
import type { Route } from "./+types/github-auth";

/** Only allow same-origin relative return paths (block open redirects). */
function safePath(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const url = new URL(request.url);
  const redirectTo = safePath(url.searchParams.get("redirectTo"));

  // Not configured → nothing to authorize against; just go back.
  if (!env || !isConfigured(env)) throw redirect(redirectTo);

  const star = url.searchParams.get("star") ?? "";
  const { authorizeUrl, stateCookie } = beginAuth(env, url.origin, {
    redirectTo,
    star,
  });

  return redirect(authorizeUrl, { headers: { "Set-Cookie": stateCookie } });
}
