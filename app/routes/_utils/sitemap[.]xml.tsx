import { getBlogs } from "~/.server/all-content";
import { getPublicRoutes } from "~/.server/route-paths";
import { CANONICAL_SITE_URL } from "~/lib/meta";
import { xml } from "remix-utils/responses";
import type { Route } from "./+types/sitemap[.]xml";

function formatW3CDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function loader({}: Route.LoaderArgs) {
  const blogs = getBlogs();
  const staticRoutes = getPublicRoutes();
  const today = formatW3CDate(new Date());

  const staticUrls = staticRoutes.map((route) => {
    const priority =
      route === "/" ? "1.0" : route === "/blog" ? "0.95" : "0.8";
    return {
      loc: `${CANONICAL_SITE_URL}${route}`,
      lastmod: today,
      changefreq: "weekly" as const,
      priority,
    };
  });

  const blogUrls = blogs.map((blog) => {
    const raw = blog.date || blog.frontmatter?.published;
    const lastmod = raw ? formatW3CDate(new Date(raw)) : today;
    return {
      loc: `${CANONICAL_SITE_URL}/blog/${blog.slug}`,
      lastmod,
      changefreq: "monthly" as const,
      priority: "0.85",
    };
  });

  const entries = [...staticUrls, ...blogUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return xml(sitemap);
}