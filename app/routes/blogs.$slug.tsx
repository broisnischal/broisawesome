import { data, Link } from "react-router";
import { useMemo } from "react";
import type { Route } from "./+types/blogs.$slug";
import { getBlogBySlug, getBlogs } from "~/lib/blog-content";

export async function loader({ params }: Route.LoaderArgs) {
    const { slug } = params;
    const blog = getBlogBySlug(slug);

    if (!blog) {
        throw new Response(`Blog post with slug "${slug}" not found`, {
            status: 404,
            statusText: "Not Found",
        });
    }

    // Only serialize the data, not the component (functions can't be serialized)
    return data({
        blog: {
            title: blog.title,
            slug: blog.slug,
            date: blog.date,
            excerpt: blog.excerpt,
            frontmatter: blog.frontmatter,
        },
        slug, // Pass slug so we can fetch the component in the component
    });
}

export async function headers() {
    return {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    } as HeadersInit;
}
export const handle = {
    breadcrumb: ({ loaderData }: Route.ComponentProps) => (
        <Link to={`/blog/${loaderData.blog?.slug}`}>
            {loaderData.blog?.title || loaderData.blog?.slug}
        </Link>
    ),
};

export default function BlogPost({ loaderData }: Route.ComponentProps) {
    const { blog, slug } = loaderData;

    if (!blog) {
        return (
            <div>
                <h1>Blog post not found</h1>
            </div>
        );
    }

    // Get the full blog object again to access the component
    // (components can't be serialized, so we fetch it here)
    // Using useMemo to avoid re-fetching on every render
    const fullBlog = useMemo(() => {
        // Get all blogs and find the one we need
        // This works because modules are eagerly loaded
        const blogs = getBlogs();
        return blogs.find((b) => b.slug === slug);
    }, [slug]);

    const BlogComponent = fullBlog?.component;

    if (!BlogComponent) {
        return (
            <div>
                <h1>Blog component not found</h1>
                <p>Slug: {slug}</p>
                {import.meta.env.DEV && (
                    <pre>{JSON.stringify({ slug, hasFullBlog: !!fullBlog, hasComponent: !!fullBlog?.component }, null, 2)}</pre>
                )}
            </div>
        );
    }

    return (
        <article className="blog-content">
            <header className="mb-8 pb-6 border-b border-border">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {blog.title}
                </h1>
                {blog.date && (
                    <time className="text-muted-foreground text-sm block mb-4">
                        {new Date(blog.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </time>
                )}
                {blog.excerpt && (
                    <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                        {blog.excerpt}
                    </p>
                )}
            </header>
            <div>
                <BlogComponent />
            </div>
        </article>
    );
}