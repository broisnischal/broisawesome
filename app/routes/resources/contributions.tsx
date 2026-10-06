import { data } from "react-router";
import { fetchContributions } from "~/.server/github-contributions";
import type { Route } from "./+types/contributions";

/** GET → my GitHub contribution calendar, for the header graph. */
export async function loader({ context }: Route.LoaderArgs) {
  const contributions = await fetchContributions(context.cloudflare?.env);
  return data(
    { contributions },
    {
      headers: {
        "Cache-Control": contributions
          ? "public, max-age=1800, s-maxage=3600"
          : "no-store",
      },
    },
  );
}
