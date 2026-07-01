import { type loader as rootLoaders } from "../root";

import { invariant } from "@epic-web/invariant";
import { useRouteLoaderData } from "react-router";

/**
 * @returns the request info from the root loader (resolved on the server from
 * cookies/headers): the current path, the client hints (system preferences),
 * and the user's explicit preferences.
 */
export function useRequestInfo() {
  const data = useRouteLoaderData<typeof rootLoaders>("root");
  invariant(data?.requestInfo, "No requestInfo found in root loader");

  return data.requestInfo;
}
