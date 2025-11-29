
export type BlogFrontmatter = {
    title: string;
    slug?: string;
    date?: string;
    published?: string;
    excerpt?: string;
    description?: string;
};

export type BlogListItem = {
    title: string;
    slug: string;
    date?: string;
    excerpt?: string;
};

export function getBlogs() {
    const modules = import.meta.glob("../contents/**/*.mdx", { eager: true }) as Record<string, any>;

    return Object.entries(modules).map(([path, mod]) => {
        // Path format: "../contents/test.mdx" or "../contents/strongly-typed-env/route.mdx"
        // Remove "../contents/" prefix
        const relative = path.replace(/^\.\.\/contents\//, "");

        // Generate slug: remove .mdx, remove /route, remove trailing slashes
        let slug = relative.replace(/\.mdx$/, "").replace(/\/route$/, "").replace(/\/$/, "");

        // Handle nested paths - convert to single slug (e.g., "strongly-typed-env/route" -> "strongly-typed-env")
        // If slug contains "/", take the directory name (first part)
        if (slug.includes("/")) {
            slug = slug.split("/")[0];
        }

        const fm = (mod.frontmatter ?? mod.attributes ?? {}) as BlogFrontmatter;
        const title = fm.title ?? slug.replace(/-/g, " ");
        const link = `/blogs/${slug}`;

        return {
            title,
            slug,
            link,
            date: fm.date || fm.published, // Support both 'date' and 'published' fields
            excerpt: fm.excerpt || fm.description, // Support both 'excerpt' and 'description' fields
            component: mod.default,
            frontmatter: fm,
        } as const;
    });
}

export function getBlogBySlug(slug: string) {
    const blogs = getBlogs();

    // Normalize slug (remove trailing slashes, handle variations)
    const normalizedSlug = slug?.replace(/\/$/, "") || "";

    console.log("normalizedSlug", normalizedSlug)


    const blog = blogs.find((b) => {
        // Match exact slug or handle variations
        return b.slug === normalizedSlug ||
            b.slug === `${normalizedSlug}/` ||
            b.slug.replace(/\/$/, "") === normalizedSlug;
    });
    console.log("blog", blog)

    if (!blog && import.meta.env.DEV) {
        console.log("Available slugs:", blogs.map(b => b.slug));
        console.log("Looking for slug:", normalizedSlug);
    }

    return blog;
}