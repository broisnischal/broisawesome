import { CANONICAL_SITE_URL } from "~/lib/meta";
import type { Route } from "./+types/[robots.txt]";

export const loader = ({}: Route.LoaderArgs) => {
  const robotText = `User-agent: *
Allow: /
Disallow: /dashboard
Sitemap: ${CANONICAL_SITE_URL}/sitemap.xml`;

  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
