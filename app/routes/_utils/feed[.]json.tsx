import { getBlogs } from "~/.server/all-content";
import { CANONICAL_SITE_URL } from "~/lib/meta";
import { data } from "react-router";
import type { Route } from "./+types/feed[.]json";

export async function loader({}: Route.LoaderArgs) {
  const baseUrl = CANONICAL_SITE_URL;

  const posts = getBlogs()
    .filter((blog) => blog.date || blog.frontmatter?.published)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.frontmatter?.published || 0).getTime();
      const dateB = new Date(b.date || b.frontmatter?.published || 0).getTime();
      return dateB - dateA;
    });

  const list = posts.map((post) => ({
    id: post.slug,
    url: `${baseUrl}/blog/${post.slug}`,
    title: post.title,
    content_text: post.excerpt || post.title,
    date_published: post.date || post.frontmatter?.published,
  }));

  return data({
    version: "https://jsonfeed.org/version/1",
    title: "Blog by Nischal Dahal",
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/feed.json`,
    description:
      "JSON Feed of posts by Nischal Dahal (broisnischal): software engineering, serverless, React, and web development — the blog by Nischal.",
    icon: "https://avatars.githubusercontent.com/u/98168009?v=4",
    author: {
      name: "Nischal Dahal",
      url: "https://x.com/broisnees",
      avatar: "https://avatars.githubusercontent.com/u/98168009?v=4",
    },
    items: list,
  });
}
