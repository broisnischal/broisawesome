import { useHints } from "../../utils/client-hints";
import { useRequestInfo } from "../../utils/request-info";
import { setTheme, type Theme } from "../../utils/theme-server";
import { invariantResponse } from "@epic-web/invariant";
import { Monitor, Moon, Sun } from "lucide-react";
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
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const satisfies ReadonlyArray<{
  value: ValidTheme;
  label: string;
  icon: typeof Monitor;
}>;

function isValidTheme(value: unknown): value is ValidTheme {
  return (
    typeof value === "string" && VALID_THEMES.includes(value as ValidTheme)
  );
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
  size = "default",
}: {
  userPreference?: Theme | "system" | null;
  className?: string;
  size?: "sm" | "default";
}) {
  const fetcher = useFetcher();
  const optimisticTheme = useOptimisticThemeSubmission();

  const mode = userPreference ?? "system";
  const activeMode = optimisticTheme ?? mode;
  const isSubmitting = fetcher.state !== "idle";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <fetcher.Form
      method="POST"
      action="/resources/theme-switch"
      className={cn("inline-flex", className)}
    >
      <fieldset
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/95 p-1 shadow-sm backdrop-blur-sm",
          isSubmitting && "opacity-80",
        )}
        aria-label="Theme switcher"
        disabled={isSubmitting}
      >
        <legend className="sr-only">Theme switcher</legend>
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const selected = activeMode === value;

          return (
            <button
              key={value}
              name="theme"
              value={value}
              type="submit"
              aria-pressed={selected}
              aria-label={`Use ${label.toLowerCase()} theme`}
              title={label}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
                selected
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={iconSize} />
              <span className={cn(size === "sm" ? "sr-only" : "inline")}>
                {label}
              </span>
            </button>
          );
        })}
        <span className="sr-only" aria-live="polite">
          Current theme: {activeMode}
        </span>
      </fieldset>
    </fetcher.Form>
  );
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
