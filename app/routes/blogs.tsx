import { ArrowRightIcon } from "lucide-react";
import { Link, data } from "react-router";
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
  breadcrumb: () => <Link to="/blog">Blogs</Link>,
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

export default function BlogLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="border-border font-sans">
      <div className="mb-8 max-w-2xl">
        <p className="mb-4 text-base leading-relaxed text-muted-foreground">
          I write about topics like{" "}
          <strong className="text-foreground">modern web development</strong>,
          <strong className="text-foreground"> serverless architecture</strong>,
          <strong className="text-foreground"> system design</strong>, and
          <strong className="text-foreground"> core computer science</strong>.
          Each post shares knowledge and insights from real-world projects and
          experiences.
        </p>
        <p className="text-base text-muted-foreground">
          Prefer a minimal, date-grouped list? See{" "}
          <Link
            to="/writing"
            className="text-foreground underline underline-offset-4 hover:text-foreground/90"
          >
            Writing
          </Link>
          .
        </p>
      </div>
      <Blogs data={loaderData.blogs} url="/blog" />
      <br />
      {/* <Newsletter /> */}
    </div>
  );
}

function Blogs({
  data,
  url,
}: {
  data: (BlogListItem & { slug: string })[];
  url: string;
}) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-1 text-base text-muted-foreground">
        Subscribe to my articles using{" "}
        <a
          className="flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
          href="/blogs.rss"
          target="_blank"
          rel="noreferrer"
          aria-label="Subscribe to my articles using RSS"
        >
          RSS <ArrowRightIcon className="size-4" aria-hidden />
        </a>
      </p>
      <ul className="flex flex-col gap-2.5 md:list-inside md:list-disc">
        {data.map((blog) => (
          <li className="" key={blog.slug}>
            <Link
              // viewTransition
              state={{ back: url }}
              prefetch="intent"
              className="text-lg text-foreground underline-offset-4 visited:text-muted-foreground hover:text-primary hover:underline"
              to={`/blog/${blog.slug}`}
            >
              {blog.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
