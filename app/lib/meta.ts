/**
 * Common meta tags creator for SEO optimization
 * Helps Google and other search engines rank your site better
 */

export interface MetaConfig {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/** Canonical origin — use for sitemaps, canonical tags, and JSON-LD URLs. */
export const CANONICAL_SITE_URL = "https://nischal-dahal.com.np";

const SITE_URL = CANONICAL_SITE_URL;
const DEFAULT_AUTHOR = "Nischal Dahal";
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.ico`;
const PUBLISHER_LOGO = "https://avatars.githubusercontent.com/u/98168009?v=4";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Truncates description to optimal SEO length (120-160 chars)
 * Ensures keywords are included if not already present
 */
function optimizeDescription(description: string, keywords: string[]): string {
  // Check if keywords are already in description
  const hasKeywords = keywords.some((keyword) =>
    description.toLowerCase().includes(keyword.toLowerCase()),
  );

  // If no keywords, add primary keyword naturally
  let optimized = description;
  if (!hasKeywords && keywords.length > 0) {
    const primaryKeyword = keywords[0];
    // Try to add keyword naturally at the beginning or end
    if (optimized.length < 100) {
      optimized = `${primaryKeyword} - ${optimized}`;
    } else {
      optimized = `${optimized} by ${primaryKeyword}`;
    }
  }

  // Truncate to 160 chars max, but prefer 120-160 range
  if (optimized.length > 160) {
    optimized = optimized.substring(0, 157) + "...";
  }

  // Ensure minimum length
  if (optimized.length < 120 && description.length >= 120) {
    optimized =
      description.substring(0, 157) + (description.length > 157 ? "..." : "");
  }

  return optimized;
}

/**
 * Truncates title to optimal SEO length (50-60 chars)
 */
function optimizeTitle(title: string): string {
  if (title.length > 60) {
    return title.substring(0, 57) + "...";
  }
  return title;
}

/**
 * Creates comprehensive meta tags for SEO
 */
export function createMetaTags(config: MetaConfig) {
  const {
    title,
    description,
    path = "",
    keywords = [],
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    author = DEFAULT_AUTHOR,
    publishedTime,
    modifiedTime,
  } = config;

  // Ensure keywords include target keywords (name variants + common search phrases)
  const targetKeywords = [
    "Nischal Dahal",
    "Nischal",
    "broisnischal",
    "blog by Nischal",
    "Nischal blog",
    "articles by Nischal Dahal",
  ];
  const allKeywords = [
    ...new Set([
      ...targetKeywords,
      ...keywords,
      "software developer",
      "portfolio",
      "web development",
    ]),
  ];

  // Optimize title and description
  const optimizedDescription = optimizeDescription(description, allKeywords);
  const fullTitle = title.includes("Nischal Dahal")
    ? optimizeTitle(title)
    : optimizeTitle(`${title} | Nischal Dahal - aka broisnischal`);

  const url = `${SITE_URL}${path}`;
  const keywordsString = allKeywords.join(", ");

  const metaTags = [
    // Basic SEO
    { title: fullTitle },
    { name: "description", content: optimizedDescription },
    { name: "keywords", content: keywordsString },
    { name: "author", content: author },
    {
      name: "robots",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { name: "googlebot", content: "index, follow" },

    // Open Graph / Facebook
    { property: "og:type", content: ogType },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: optimizedDescription },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:site_name", content: "Nischal Dahal" },
    { property: "og:locale", content: "en_US" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: optimizedDescription },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:creator", content: "@broisnees" },
    { name: "twitter:site", content: "@broisnees" },

    // Article specific (if type is article)
    ...(ogType === "article" && publishedTime
      ? [
          { property: "article:published_time", content: publishedTime },
          { property: "article:author", content: author },
        ]
      : []),
    ...(modifiedTime
      ? [{ property: "article:modified_time", content: modifiedTime }]
      : []),

    // Canonical URL
    { rel: "canonical", href: url },
  ];

  return metaTags;
}

export function createPersonSchema(options?: {
  url?: string;
  jobTitle?: string;
  description?: string;
}) {
  const {
    url = SITE_URL,
    jobTitle = "Software Engineer",
    description = "Self-started software developer focusing on serverless architecture, Android development, user experience, and product development.",
  } = options || {};

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nischal Dahal",
    alternateName: ["broisnischal", "broisnees", "Nischal"],
    url,
    jobTitle,
    description,
    sameAs: [
      "https://github.com/broisnischal",
      "https://twitter.com/broisnees",
      "https://www.linkedin.com/in/nischalxdahal/",
      "https://t.me/broisnees",
      "https://instagram.com/broisnischal",
    ],
  };
}

/**
 * WebSite + Person for the homepage (helps sitelinks and brand queries).
 */
export function createWebSiteSchema(options?: { description?: string }) {
  const description =
    options?.description ??
    "Portfolio, blog, and GitHub activity by Nischal Dahal (broisnischal): software engineering, serverless, Android, and web development.";

  const personDescription =
    "Self-started software developer focusing on serverless architecture, Android development, user experience, and product development.";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Nischal Dahal",
        alternateName: [
          "broisnischal",
          "blog by Nischal",
          "Nischal Dahal portfolio",
          "Nischal blog",
        ],
        url: SITE_URL,
        description,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Nischal Dahal",
        alternateName: ["broisnischal", "broisnees", "Nischal"],
        url: SITE_URL,
        jobTitle: "Software Engineer",
        description: personDescription,
        sameAs: [
          "https://github.com/broisnischal",
          "https://twitter.com/broisnees",
          "https://www.linkedin.com/in/nischalxdahal/",
          "https://t.me/broisnees",
          "https://instagram.com/broisnischal",
        ],
      },
    ],
  };
}

export type BlogIndexPost = {
  title: string;
  slug: string;
  date?: string;
};

/**
 * Blog listing schema — ties posts to author for queries like "blog by Nischal".
 */
export function createBlogIndexSchema(posts: BlogIndexPost[]) {
  const blogUrl = `${SITE_URL}/blog`;
  const blogPost = posts.map((p) => {
    const date = p.date ? new Date(p.date).toISOString() : undefined;
    return {
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      ...(date ? { datePublished: date } : {}),
      author: {
        "@type": "Person",
        name: DEFAULT_AUTHOR,
        url: SITE_URL,
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog by Nischal Dahal",
    alternateName: "Nischal Dahal blog",
    description:
      "Technical articles and tutorials by Nischal Dahal on web development, serverless architecture, React Router, and software engineering.",
    url: blogUrl,
    author: {
      "@type": "Person",
      name: DEFAULT_AUTHOR,
      url: SITE_URL,
      sameAs: [
        "https://github.com/broisnischal",
        "https://twitter.com/broisnees",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_AUTHOR,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
    blogPost,
  };
}

export function createBreadcrumbListSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Creates JSON-LD schema markup for Blog/Article
 */
export function createArticleSchema(options: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  author?: string;
  modifiedTime?: string;
  image?: string;
}) {
  const {
    title,
    description,
    url,
    publishedTime,
    author = DEFAULT_AUTHOR,
    modifiedTime,
    image,
  } = options;

  const imageUrl = image ? absoluteUrl(image) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Person",
      name: author,
      url: SITE_URL,
      sameAs: [
        "https://github.com/broisnischal",
        "https://twitter.com/broisnees",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_AUTHOR,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
    datePublished: publishedTime,
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(imageUrl && { image: imageUrl }),
  };
}

/**
 * Creates a properly typed meta tag for JSON-LD schema markup
 * This ensures type safety without using 'as any'
 * Returns a meta tag object that can be spread into the meta array
 */
export function createSchemaMetaTag(schema: Record<string, unknown>): {
  "script:ld+json": string;
} {
  return {
    "script:ld+json": JSON.stringify(schema),
  };
}

export function createHeaders(options?: {
  cacheControl?: string;
  contentType?: string;
}) {
  const {
    cacheControl = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    contentType,
  } = options || {};

  const headers: HeadersInit = {
    ...(options?.cacheControl !== undefined && {
      "Cache-Control": options.cacheControl,
    }),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}
