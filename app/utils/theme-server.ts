import * as cookie from "cookie";

export type Theme = "light" | "dark";

// Align with @epic-web/client-hints default so the same cookie
// is used for both client hints and explicit theme switches.
const HINT_COOKIE_NAME = "CH-prefers-color-scheme";
// Backwards-compat for the previous custom name.
const LEGACY_COOKIE_NAME = "en_theme";

export function setTheme(theme: Theme | "system") {
  if (theme === "system") {
    // Clear explicit preference; client hints (OS preference) will be used.
    return cookie.serialize(HINT_COOKIE_NAME, "", { path: "/", maxAge: -1 });
  } else {
    // Persist explicit user preference; this overrides client hints everywhere.
    return cookie.serialize(HINT_COOKIE_NAME, theme, {
      path: "/",
      maxAge: 31536000,
    });
  }
}

export function getTheme(request: Request): Theme | "system" {
  const cookieHeader = request.headers.get("cookie");
  const all = cookieHeader ? cookie.parse(cookieHeader) : {};

  // Prefer the unified hint/explicit cookie, but still honor the old name if present.
  const raw =
    all[HINT_COOKIE_NAME] !== undefined
      ? all[HINT_COOKIE_NAME]
      : all[LEGACY_COOKIE_NAME];

  if (raw === "light" || raw === "dark") return raw;
  return "system";
}
