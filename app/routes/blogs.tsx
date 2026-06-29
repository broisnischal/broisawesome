import { Link, data } from "react-router";
import { MdLink, SectionLabel, Squiggle } from "~/components/terminal";
import { getBlogs, type BlogListItem } from "~/lib/blog-content";
import {
  CANONICAL_SITE_URL,
  createBlogIndexSchema,
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/blogs";

export const handle = {
  breadcrumb: () => <Link to="/blog">blog</Link>,
};

export const links: Route.LinksFunction = () => [
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: "Blog by Nischal Dahal (RSS)",
    href: `${CANONICAL_SITE_URL}/blogs.rss`,
  },
  {
    rel: "alternate",
    type: "application/feed+json",
    title: "Blog by Nischal Dahal (JSON Feed)",
    href: `${CANONICAL_SITE_URL}/feed.json`,
  },
];

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const posts = loaderData?.blogs ?? [];

  const metaTags = createMetaTags({
    title: "Blog by Nischal Dahal — articles & tutorials",
    description:
      "Blog by Nischal Dahal (broisnischal): articles on web development, serverless architecture, React Router, TypeScript, and software engineering — practical posts from real projects.",
    path: "/blog",
    keywords: [
      "blog by Nischal",
      "Nischal Dahal blog",
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "blog",
      "articles",
      "web development",
      "serverless architecture",
      "React Router",
      "software development",
      "programming",
      "tutorials",
    ],
  });

  const blogSchema = createBlogIndexSchema(
    posts.map((b) => ({
      title: b.title,
      slug: b.slug,
      date: b.date,
    })),
  );

  return [...metaTags, createSchemaMetaTag(blogSchema)];
};

export function headers() {
  return createHeaders();
}

export async function loader() {
  const blogs = getBlogs();

  // Sort by date (most recent first)
  const sortedBlogs = blogs
    .filter((blog) => blog.date || blog.frontmatter?.published)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.frontmatter?.published || 0).getTime();
      const dateB = new Date(b.date || b.frontmatter?.published || 0).getTime();
      return dateB - dateA;
    });

  const serializable = sortedBlogs.map((b) => ({
    title: b.title,
    slug: b.slug,
    date: b.date,
    excerpt: b.excerpt,
  })) as BlogListItem[];

  return data({ blogs: serializable });
}

function formatDate(date?: string) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export default function BlogLayout({ loaderData }: Route.ComponentProps) {
  const { blogs } = loaderData;

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Blog</h1>

      <Squiggle />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <span className="uppercase tracking-[0.12em] text-muted-foreground/70">
          subscribe:
        </span>
        <MdLink label="rss" href="/blogs.rss" display="blogs.rss" />
        <MdLink label="json" href="/feed.json" display="feed.json" />
      </div>

      <Squiggle />

      <SectionLabel>Posts:</SectionLabel>
      <ol className="mt-3 space-y-2.5">
        {blogs.map((blog) => {
          const date = formatDate(blog.date);
          return (
            <li
              key={blog.slug}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-1"
            >
              <span className="text-xs tabular-nums text-muted-foreground/55">
                {date}
              </span>
              <span className="min-w-0">
                <MdLink
                  label={blog.title}
                  to={`/blog/${blog.slug}`}
                  display={blog.slug}
                />
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
