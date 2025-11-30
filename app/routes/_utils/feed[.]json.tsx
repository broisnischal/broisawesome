import { getBlogs } from "~/.server/all-content";
import { data } from "react-router";
import type { Route } from "./+types/feed[.]json";

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

  const list = posts.map((post) => ({
    id: post.slug,
    url: `${baseUrl}/blog/${post.slug}`,
    title: post.title,
    content_text: post.excerpt || post.title,
    date_published: post.date || post.frontmatter?.published,
  }));

  return data({
    version: "https://jsonfeed.org/version/1",
    title: "nischal-dahal.com.np",
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/feed.json`,
    description:
      "Nischal Dahal is a full-stack developer and a founder of nischal-dahal.com.np",
    icon: "https://avatars.githubusercontent.com/u/98168009?v=4",
    author: {
      name: "Nischal Dahal",
      url: "https://x.com/broisnees",
      avatar: "https://avatars.githubusercontent.com/u/98168009?v=4",
    },
    items: list,
  });
}
