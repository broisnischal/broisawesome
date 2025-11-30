import { getBlogs } from "~/.server/all-content";
import { xml } from "remix-utils/responses";
import type { Route } from "./+types/blogs[.]rss";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Blogs by Nischal Dahal" },
    {
      name: "description",
      content: "The complete list of articles wrote by @broisnees.",
    },
  ];
};

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const baseUrl = `https://${url.host}`;

  const posts = getBlogs()
    .filter((blog) => blog.date || blog.frontmatter?.published)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.frontmatter?.published || 0).getTime();
      const dateB = new Date(b.date || b.frontmatter?.published || 0).getTime();
      return dateB - dateA;
    });

  const rssItems = posts
    .map((article) => {
      const link = `${baseUrl}/blog/${article.slug}`;
      const pubDate = article.date || article.frontmatter?.published;
      const description = escapeXml(article.excerpt || article.title || "");
      const title = escapeXml(article.title || article.slug.replace(/-/g, " "));

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${description}</description>
      ${pubDate ? `<pubDate>${new Date(pubDate).toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blogs by Nischal Dahal</title>
    <link>${baseUrl}/blog</link>
    <description>The complete list of articles wrote by @broisnees.</description>
    <atom:link href="${baseUrl}/blogs.rss" rel="self" type="application/rss+xml" />
    <language>en-us</language>
${rssItems}
  </channel>
</rss>`;

  return xml(rss);
}
