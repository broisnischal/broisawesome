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

/**
 * @returns inline script element that checks for client hints and sets cookies
 * if they are not set then reloads the page if any cookie was set to an
 * inaccurate value.
 */
/** `nonce` must be stable between SSR and hydration; never use `Date`/`random` here. */
export function ClientHintCheck({ nonce }: { nonce?: string }) {
  const { revalidate } = useRevalidator();
  const requestInfo = useRequestInfo();

  useEffect(() => {
    // Only subscribe to system theme changes if user preference is 'system' or null
    // This prevents unwanted theme switches when user has manually set a theme
    const userPref = requestInfo?.userPrefs?.theme;

    if (userPref === "system" || !userPref) {
      // User wants to follow system theme, so subscribe to changes
      return subscribeToSchemeChange(() => revalidate());
    }

    // User has manual theme preference, don't subscribe to system changes
    // This prevents the theme from switching when system theme changes
    return () => {};
  }, [revalidate, requestInfo?.userPrefs?.theme]);

  return (
    <script
      {...(nonce ? { nonce } : {})}
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}

/**
 * @returns an object with the client hints and their values
 */
export function useHints() {
  const requestInfo = useRequestInfo();
  return requestInfo.hints;
}

export const { getHints, getClientHintCheckScript } = hintsUtils;
