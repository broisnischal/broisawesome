import { data } from "react-router";
import { fetchRecentCommits } from "~/.server/github-commits";
import type { Route } from "./+types/recent-commits";

/** GET → my latest public commits across all repos, for the footer ticker. */
export async function loader({ context }: Route.LoaderArgs) {
  const commits = await fetchRecentCommits(context.cloudflare?.env);
  return data(
    { commits },
    {
      headers: {
        "Cache-Control": commits.length
          ? "public, max-age=300, s-maxage=600"
          : "no-store",
      },
    },
  );
}
