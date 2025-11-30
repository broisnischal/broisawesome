import { getBlogs } from "~/.server/all-content";
import { getPublicRoutes } from "~/.server/route-paths";
import { xml } from "remix-utils/responses";
import type { Route } from "./+types/sitemap[.]xml";

export async function loader({ request }: Route.LoaderArgs) {
    const blogs = getBlogs();
    const staticRoutes = getPublicRoutes();

    const url = new URL(request.url);
    const host = url.host;
    const baseUrl = `https://${host}`;

    // Combine static routes with dynamic blog routes
    const publicRoutes = [
        ...staticRoutes,
        ...blogs.map((blog) => `/blog/${blog.slug}`),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
            .map(
                (route) => `  <url> 
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
            )
            .join("\n")}
</urlset>`;

    return xml(sitemap);
}