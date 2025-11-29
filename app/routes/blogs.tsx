import { Link, data } from "react-router";
import { Newsletter } from "~/components/newsletter";
import { getBlogs, type BlogListItem } from "~/lib/blog-content";
import type { Route } from "./+types/blogs";

export const handle = {
  breadcrumb: () => <Link to="/blog">Blogs</Link>,
};

export async function loader() {
  const blogs = getBlogs();

  const serializable = blogs.map((b) => ({
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
      <Newsletter />

      <ul>
        {loaderData.blogs.map((blog) => (
          <li key={blog.slug}>
            <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
