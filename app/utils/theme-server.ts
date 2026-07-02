import * as cookie from "cookie";

export type Theme = "light" | "dark";

/**
 * Explicit user preference cookie. This is kept SEPARATE from the client-hint
 * cookie (`CH-prefers-color-scheme`, written by `@epic-web/client-hints`):
 *
 *   - `en_theme`                 → the user's explicit choice ("light"/"dark").
 *                                  Absent means "follow the system".
 *   - `CH-prefers-color-scheme`  → the system preference, detected in the
 *                                  browser and mirrored into a cookie so the
 *                                  server can render the right theme.
 *
 * Keeping them apart is what lets us tell "system" apart from an explicit
 * choice that happens to match the system — without it the theme switch can't
 * offer a real "System" option.
 */
const THEME_COOKIE_NAME = "en_theme";

export function setTheme(theme: Theme | "system") {
  if (theme === "system") {
    // Clear the explicit preference; rendering falls back to the system
    // preference (client hint + CSS `prefers-color-scheme`).
    return cookie.serialize(THEME_COOKIE_NAME, "", { path: "/", maxAge: -1 });
  }

  // Persist the explicit preference; it overrides the system preference.
  return cookie.serialize(THEME_COOKIE_NAME, theme, {
    path: "/",
    maxAge: 31536000,
  });
}

export function getTheme(request: Request): Theme | "system" {
  const cookieHeader = request.headers.get("cookie");
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[THEME_COOKIE_NAME]
    : undefined;

  if (parsed === "light" || parsed === "dark") return parsed;
  return "system";
}
