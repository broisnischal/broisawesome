import { Link, data } from "react-router";
import { Newsletter } from "~/components/newsletter";
import { getBlogs, type BlogListItem } from "~/lib/blog-content";
import type { Route } from "./+types/blogs";

export const handle = {
  breadcrumb: () => <Link to="/blog">Blogs</Link>,
};

export async function loader() {
  const blogs = getBlogs();

  // Sort by date (most recent first)
  const sortedBlogs = blogs
    .filter(blog => blog.date || blog.frontmatter?.published)
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

    <div className=" border-border">
      <div className="max-w-2xl mb-8">
        <p className="text-muted-foreground leading-relaxed mb-4">
          I write about <strong className="text-foreground">modern web development</strong>,
          <strong className="text-foreground"> serverless architecture</strong>,
          <strong className="text-foreground"> React Router</strong>, and
          <strong className="text-foreground"> best practices</strong>.
          Each post shares knowledge and insights from real-world projects and experiences.
        </p>
        <p className="text-sm text-muted-foreground">
          I typically publish <strong className="text-foreground">1-2 articles per month</strong>,
          focusing on practical solutions and lessons learned from building production applications.
        </p>
      </div>
      <Blogs data={loaderData.blogs} url="/blog" />
      <br />
      <Newsletter />


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
      <p className="text-zinc-700 dark:text-zinc-50 mb-2">
        Subscribe to my articles using{' '}
        <a className="underline" href={url + 'rss'}>
          RSS
        </a>
        .
      </p>
      <ul className=" md:list-inside md:list-disc flex flex-col gap-2">
        {data.map((blog) => (
          <li className="" key={blog.slug}>
            <Link
              // viewTransition
              state={{ back: url }}
              prefetch="intent"
              className=" visited:text-zinc-500! dark:visited:text-zinc-300! text-blue-600 dark:text-blue-400! hover:underline hover:text-black dark:hover:text-white"
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