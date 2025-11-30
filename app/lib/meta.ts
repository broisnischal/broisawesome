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

const SITE_URL = "https://nischal-dahal.com.np";
const DEFAULT_AUTHOR = "Nischal Dahal";
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.ico`;

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

    const fullTitle = title.includes("Nischal Dahal")
        ? title
        : `${title} | Nischal Dahal - aka broisnischal`;

    const url = `${SITE_URL}${path}`;
    const keywordsString = keywords.length > 0
        ? keywords.join(", ")
        : "Nischal Dahal, broisnischal, software developer, portfolio, web development, React, TypeScript";

    const metaTags = [
        // Basic SEO
        { title: fullTitle },
        { name: "description", content: description },
        { name: "keywords", content: keywordsString },
        { name: "author", content: author },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        { name: "googlebot", content: "index, follow" },

        // Open Graph / Facebook
        { property: "og:type", content: ogType },
        { property: "og:title", content: fullTitle },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { property: "og:site_name", content: "Nischal Dahal" },
        { property: "og:locale", content: "en_US" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: fullTitle },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:creator", content: "@broisnees" },
        { name: "twitter:site", content: "@broisnees" },

        // Article specific (if type is article)
        ...(ogType === "article" && publishedTime ? [
            { property: "article:published_time", content: publishedTime },
            { property: "article:author", content: author },
        ] : []),
        ...(modifiedTime ? [
            { property: "article:modified_time", content: modifiedTime },
        ] : []),

        // Canonical URL
        { rel: "canonical", href: url },
    ];

    return metaTags;
}

/**
 * Creates HTTP headers for SEO and performance
 */
export function createHeaders(options?: {
    cacheControl?: string;
    contentType?: string;
}) {
    const {
        cacheControl = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        contentType,
    } = options || {};

    const headers: HeadersInit = {
        "Cache-Control": cacheControl,
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

