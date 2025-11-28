import { Link } from "react-router";
import type { Route } from "./+types/route";

export type BlogFrontmatter = {
  title: string;
  slug?: string;
  date?: string;
  excerpt?: string;
};

export type BlogListItem = {
  title: string;
  slug: string;
  date?: string; 
  excerpt?: string;
};

export function getBlogs() {
  const modules = import.meta.glob("./_contents/*.mdx", { eager: true }) as Record<string, any>;

  return Object.entries(modules).map(([path, mod]) => {
    const filename = path.split("/").pop() as string;
    const slug = filename.replace(/\.mdx$/, "");
    const fm = (mod.frontmatter ?? mod.attributes ?? {}) as BlogFrontmatter;
    const title = fm.title ?? slug.replace(/-/g, " ");
    const link = `/blogs/${slug}`;

    return {
      title,
      slug,
      link,
      date: fm.date,
      excerpt: fm.excerpt,
      component: mod.default,
      frontmatter: fm,
    } as const;
  });
}

export async function loader(_: Route.LoaderArgs) {
  const blogs = getBlogs();

  const serializable = blogs.map((b) => ({
    title: b.title,
    slug: b.slug,
    date: b.date,
    excerpt: b.excerpt,
  })) as BlogListItem[];

  return { blogs: serializable };
}

export default function BlogLayout({ loaderData }: Route.ComponentProps) {
  const blogs: BlogListItem[] = loaderData?.blogs ?? [];

  return (
    <div>
      <h1>List of the blogs are available here</h1>
      <ul className=" rounded-md space-y-4">
        {blogs.length === 0 && <li>No posts found</li>}

        {blogs.map((blog) => (
          <Link to={blog.slug} key={blog.slug} className="text-inherit ">  
            <li key={blog.slug} className="bg-black/5 p-4 rounded-md hover:bg-black/10 transition">
              <strong>{blog.title}</strong>
              {blog.date && (
                <div style={{ color: "#666", fontSize: 12 }}>{new Date(blog.date).toLocaleDateString()}</div>
              )}
              {blog.excerpt && <p>{blog.excerpt}</p>}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
