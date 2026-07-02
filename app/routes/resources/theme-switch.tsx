import { useHints } from "../../utils/client-hints";
import { useRequestInfo } from "../../utils/request-info";
import { setTheme, type Theme } from "../../utils/theme-server";
import { invariantResponse } from "@epic-web/invariant";
import { useSyncExternalStore } from "react";
import { data, useFetcher, useFetchers } from "react-router";
import type { Route } from "./+types/theme-switch";
import { createMetaTags, createHeaders } from "~/lib/meta";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Theme Switch",
    description:
      "Theme switcher for Nischal Dahal's portfolio. Switch between light, dark, and system theme preferences.",
    path: "/resources/theme-switch",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "theme",
      "dark mode",
      "light mode",
    ],
  });
};

export function headers() {
  return createHeaders();
}

const VALID_THEMES = ["system", "light", "dark"] as const;
type ValidTheme = (typeof VALID_THEMES)[number];
const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies ReadonlyArray<{
  value: ValidTheme;
  label: string;
}>;

function isValidTheme(value: unknown): value is ValidTheme {
  return (
    typeof value === "string" && VALID_THEMES.includes(value as ValidTheme)
  );
}

/**
 * Client-side "active theme" store.
 *
 * Why this exists: the theme switch persists the choice in a cookie via its
 * action, and React Router auto-revalidates the root loader afterwards. But in
 * single-fetch the revalidation request is dispatched before the browser
 * commits the action's `Set-Cookie`, so the root loader re-runs *without* the
 * new cookie and reports the old value — snapping the theme back. (Verified in
 * a real browser: the `/_root.data` revalidation goes out with no `en_theme`.)
 *
 * So we keep the chosen mode here as a sticky client override that wins over
 * the (racy) loader value for the rest of the session. The cookie is still
 * written client-side immediately, so the next full page load is correct with
 * no flash. This makes the toggle instant and reliable without depending on the
 * round-trip at all.
 */
let clientThemeOverride: ValidTheme | null = null;
const themeSubscribers = new Set<() => void>();

function subscribeTheme(callback: () => void) {
  themeSubscribers.add(callback);
  return () => themeSubscribers.delete(callback);
}

function getThemeOverride() {
  return clientThemeOverride;
}

function getServerThemeOverride(): ValidTheme | null {
  // No override during SSR / initial hydration — fall back to the cookie value.
  return null;
}

/** Apply a theme choice instantly on the client and persist it for next load. */
export function setClientTheme(mode: ValidTheme) {
  clientThemeOverride = mode;
  if (typeof document !== "undefined") {
    document.cookie =
      mode === "system"
        ? "en_theme=; Max-Age=0; Path=/; SameSite=Lax"
        : `en_theme=${mode}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }
  themeSubscribers.forEach((fn) => fn());
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme");

  invariantResponse(
    isValidTheme(theme),
    "Invalid theme received. Must be one of: system, light, dark",
  );

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };

  return data({ success: true, theme }, responseInit);
}

function useOptimisticThemeSubmission() {
  const fetchers = useFetchers();

  const themeFetcher = fetchers.find((fetcher) => {
    const formAction = fetcher.formAction;

    return (
      formAction?.endsWith("/resources/theme-switch") &&
      typeof fetcher.formData?.get("theme") === "string"
    );
  });

  const pendingTheme = themeFetcher?.formData?.get("theme");
  return isValidTheme(pendingTheme) ? pendingTheme : null;
}

export function ThemeSwitch({
  userPreference,
  className,
}: {
  userPreference?: Theme | "system" | null;
  className?: string;
}) {
  const fetcher = useFetcher();
  const optimisticTheme = useOptimisticThemeSubmission();

  const activeMode = optimisticTheme ?? userPreference ?? "system";

  // Plain terminal-style switcher: lowercase words, no chrome. The active
  // option is wrapped in brackets ([dark]); the others render bare and turn
  // amber on hover, matching the footer links.
  return (
    <fetcher.Form
      method="POST"
      action="/resources/theme-switch"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="text-muted-foreground/50">theme:</span>
      <span
        className="inline-flex items-center gap-2"
        role="group"
        aria-label="Theme"
      >
        {THEME_OPTIONS.map(({ value, label }) => {
          const selected = activeMode === value;

          return (
            <button
              key={value}
              name="theme"
              value={value}
              type="submit"
              onClick={() => setClientTheme(value)}
              aria-pressed={selected}
              aria-label={`Use ${label.toLowerCase()} theme`}
              className={cn(
                "outline-none transition-colors focus-visible:underline",
                selected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-term-link",
              )}
            >
              {selected ? `[${value}]` : value}
            </button>
          );
        })}
      </span>
      <span className="sr-only" aria-live="polite">
        Current theme: {activeMode}
      </span>
    </fetcher.Form>
  );
}

/**
 * @returns the user's *mode* selection ("light" | "dark" | "system"),
 * reflecting an in-flight switch optimistically. Use this to drive UI that
 * needs to distinguish "system" from an explicit choice (e.g. the `<html>`
 * class and the theme switcher's active state).
 */
export function useThemeMode(): ValidTheme {
  const requestInfo = useRequestInfo();
  // A client override (set by the switch) wins over the loader value, which can
  // lag behind due to the post-action revalidation cookie race described above.
  const override = useSyncExternalStore(
    subscribeTheme,
    getThemeOverride,
    getServerThemeOverride,
  );
  return override ?? requestInfo.userPrefs.theme;
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference. Always returns 'light' or 'dark', never 'system'.
 */
export function useTheme() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticTheme = useOptimisticThemeSubmission();

  const userPref = optimisticTheme ?? requestInfo.userPrefs.theme;
  // If user preference is 'system' or null, use hints.theme
  // Otherwise return the user preference (light or dark)
  return userPref === "system" || !userPref ? hints.theme : userPref;
}
