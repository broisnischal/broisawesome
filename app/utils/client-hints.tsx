/**
 * This file contains utilities for using client hints for user preference which
 * are needed by the server, but are only known by the browser.
 */
import { getHintUtils } from "@epic-web/client-hints";
import {
  clientHint as colourSchemeHint,
  subscribeToSchemeChange,
} from "@epic-web/client-hints/color-scheme";
import { clientHint as timeZoneHint } from "@epic-web/client-hints/time-zone";

import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { useRequestInfo } from "./request-info";

const hintsUtils = getHintUtils({
  theme: colourSchemeHint,
  timeZone: timeZoneHint,
});

export const { getHints } = hintsUtils;

function readCookie(name: string): string | null {
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + "="));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=31536000; SameSite=Lax; Path=/`;
}

/**
 * Mirrors the browser's real client hints (system colour scheme, time zone)
 * into cookies so the server can render the correct theme on the *next*
 * request — and triggers a **soft** revalidation (not a full page reload)
 * whenever a hint changes.
 *
 * Unlike the stock `getClientHintCheckScript()`, this never calls
 * `window.location.reload()`. It doesn't need to: the first paint is already
 * correct because the SSR'd `<html>` class comes from the explicit-preference
 * cookie and "system" mode is driven entirely by the CSS `prefers-color-scheme`
 * media query. So there is no flash.
 */
export function ClientHintCheck() {
  const { revalidate } = useRevalidator();
  const userTheme = useRequestInfo().userPrefs.theme;

  // On mount, reconcile cookies with the actual browser values once.
  useEffect(() => {
    let changed = false;

    const actualTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    if (readCookie(colourSchemeHint.cookieName) !== actualTheme) {
      writeCookie(colourSchemeHint.cookieName, actualTheme);
      changed = true;
    }

    const actualTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (readCookie(timeZoneHint.cookieName) !== actualTimeZone) {
      writeCookie(timeZoneHint.cookieName, actualTimeZone);
      changed = true;
    }

    if (changed) void revalidate();
    // Run once on mount; the browser values don't change without a reload.
  }, []);

  // While following the system, keep up with live OS light/dark changes.
  // (CSS updates the paint instantly; this keeps server-rendered state in sync.)
  useEffect(() => {
    if (userTheme !== "system") return;
    return subscribeToSchemeChange(() => void revalidate());
  }, [revalidate, userTheme]);

  return null;
}

/**
 * @returns an object with the client hints and their values
 */
export function useHints() {
  return useRequestInfo().hints;
}
