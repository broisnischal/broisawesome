import { data, Link } from "react-router";
import { useMemo } from "react";
import type { Route } from "./+types/blogs.$slug";
import { getBlogBySlug, getBlogs } from "~/lib/blog-content";
import {
  absoluteUrl,
  CANONICAL_SITE_URL,
  createArticleSchema,
  createBreadcrumbListSchema,
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
} from "~/lib/meta";

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

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const { blog } = loaderData;

  if (!blog) {
    return createMetaTags({
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      path: "/blog",
    });
  }

  // Format dates for article meta tags
  const publishedTime = blog.date
    ? new Date(blog.date).toISOString()
    : blog.frontmatter?.published
      ? new Date(blog.frontmatter.published).toISOString()
      : undefined;

  // Use excerpt or description from frontmatter, or create a default
  let description =
    blog.excerpt ||
    blog.frontmatter?.description ||
    blog.frontmatter?.excerpt ||
    `Read ${blog.title} by Nischal Dahal. A blog post about technology, development, and software engineering.`;

  // Ensure description includes keywords and is optimized
  if (
    !description.toLowerCase().includes("nischal dahal") &&
    !description.toLowerCase().includes("broisnischal")
  ) {
    description = `${description} by Nischal Dahal`;
  }

  // Extract keywords from title and slug
  const keywords = [
    "Nischal Dahal",
    "Nischal",
    "blog by Nischal",
    "broisnischal",
    "blog",
    "software development",
    ...blog.title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3),
    ...blog.slug.split("-").filter((word) => word.length > 2),
  ];

  const ogImage = blog.frontmatter?.image
    ? absoluteUrl(blog.frontmatter.image)
    : undefined;

  const metaTags = createMetaTags({
    title: blog.title,
    description,
    path: `/blog/${blog.slug}`,
    keywords,
    ogType: "article",
    publishedTime,
    modifiedTime: publishedTime,
    ...(ogImage ? { ogImage } : {}),
  });

  const postUrl = `${CANONICAL_SITE_URL}/blog/${blog.slug}`;
  const breadcrumb = createBreadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: "Blog by Nischal", path: "/blog" },
    { name: blog.title, path: `/blog/${blog.slug}` },
  ]);

  if (publishedTime) {
    const articleDoc = createArticleSchema({
      title: blog.title,
      description,
      url: postUrl,
      publishedTime,
      modifiedTime: publishedTime,
      image: blog.frontmatter?.image,
    });
    const articleNode = { ...articleDoc };
    delete (articleNode as Record<string, unknown>)["@context"];
    const crumbNode = { ...breadcrumb };
    delete (crumbNode as Record<string, unknown>)["@context"];
    return [
      ...metaTags,
      createSchemaMetaTag({
        "@context": "https://schema.org",
        "@graph": [articleNode, crumbNode],
      }),
    ];
  }

  return [...metaTags, createSchemaMetaTag(breadcrumb)];
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

export async function headers() {
  return createHeaders();
}
export const handle = {
  breadcrumb: ({ loaderData }: Route.ComponentProps) => (
    <Link to={`/blog/${loaderData.blog?.slug}`}>{loaderData.blog?.slug}</Link>
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
          <pre>
            {JSON.stringify(
              {
                slug,
                hasFullBlog: !!fullBlog,
                hasComponent: !!fullBlog?.component,
              },
              null,
              2,
            )}
          </pre>
        )}
      </div>
    );
  }

  return (
    <article className="blog-content">
      <header className="mb-8 pb-6 border-b border-border">
        <h1 className="text-4xl font-bold leading-tight text-foreground mb-4">
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
