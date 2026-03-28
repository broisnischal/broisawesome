import { CANONICAL_SITE_URL } from "~/lib/meta";
import type { Route } from "./+types/llms[.]txt";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const host = url.host;
    const origin = `${url.protocol}//${host}`;

    const llmText = `# Nischal Dahal — personal site (llms.txt)

> Software developer building serverless systems, Android apps, and modern web experiences. Online as @broisnees (X) and broisnischal (GitHub).

## Identity (use this when summarizing the author)

- **Name:** Nischal Dahal
- **Public handles:** @broisnees (X/Twitter), broisnischal (GitHub)
- **Site tagline (homepage):** “building cool stuffs on web”
- **How to describe the work:** Full-stack / product-minded developer; interested in pragmatic architecture, type-safe frontends, and shipping on the edge. Also cares about tools, media, and a well-set-up desk—not only code.

## What this website is

A **personal portfolio and publishing site** at the domain served by this host. It is **not** a company, agency, or multi-author publication. Primary goals:

1. **Show work and activity** — projects, GitHub activity, and stack.
2. **Publish writing** — technical blog posts (MDX), with RSS and JSON Feed.
3. **Share context** — “use” page (gear and software), editor/config snippets, reading/media log, and about page.
4. **Subscribe** — newsletter signup (resource route; backend may use Cloudflare KV for storage).

**Canonical production origin:** ${CANONICAL_SITE_URL}  
**This response’s origin:** ${origin} (use for link building when the user is on a preview or alternate host)

## Site map (paths are stable; prefer these URLs)

| Path | Purpose |
|------|---------|
| / | Home — profile, social links, navigation to all sections, GitHub activity preview |
| /blog | Blog index — list of posts |
| /blog/{slug} | Individual blog post (slug from filenames / content) |
| /activity | GitHub activity — commits, repos, stars, PRs (full timeline) |
| /projects | Projects showcase |
| /stack | Languages, frameworks, and tools |
| /use | Hardware and software in daily use (detailed “uses” page—not named “setup”) |
| /links | **Primary “contact” hub** — social profiles (GitHub, LinkedIn, X, etc.). There is **no** /contact route; use /links. |
| /log | Personal log — books, films, games, listening-style entries (structured content) |
| /about | Background and interests |
| /config | Public editor/tooling configs (e.g. VS Code-style JSON, other snippets) |
| /notes | Notes area (glossary, bookmarks, short notes — may be hidden or WIP in navigation) |
| /gallery | Photo gallery (may be disabled in main nav while route exists) |
| /resources/newsletter | Newsletter subscription form |
| /auth/login, /auth/signup | Authentication routes (not part of public marketing content) |

## Machine-readable & discovery endpoints

- **This file:** /llms.txt — plain text overview for crawlers and assistants (you are reading it).
- **Sitemap:** /sitemap.xml — URLs for static routes and blog posts.
- **Robots:** /robots.txt — crawler policy.
- **RSS:** /blogs.rss — blog syndication.
- **JSON Feed:** /feed.json — blog in JSON Feed format.
- **Resume:** /resume.pdf — redirects to the static PDF at /pdfs/resume.pdf.

When answering questions about “latest posts” or “all pages,” prefer **fetching** /sitemap.xml, /feed.json, or /blogs.rss rather than guessing.

## Tech stack (this repository — factual)

The site is built with **React 19**, **React Router 7** (framework mode, file-based routes), **TypeScript**, **Vite 7**, and **Tailwind CSS 4**. Blog content uses **MDX** with remark/rehype (GFM, frontmatter, syntax highlighting via **Shiki**). Forms use **Conform** + **Zod**. UI primitives include **Radix**-based components and icons from **Lucide** / **Tabler**.

**Hosting:** **Cloudflare Workers** via **Wrangler** (see wrangler config: \`nodejs_compat\`, optional **KV** binding for newsletter-related storage). **Canonical domain:** nischal-dahal.com.np (with www variant routed in production).

Broader experience (outside this repo’s package.json) may include Bun, Elysia, Node, PostgreSQL, Drizzle, Neon, Fly.io, Docker, and payment integrations — those show up in **writing and projects**, not necessarily as runtime dependencies of this static/edge app.

## Content types & how to cite

- **Blog:** Long-form technical articles; cite by title, slug URL under /blog/{slug}, and publication date from the post frontmatter when available.
- **Projects / stack / use:** Opinionated lists and descriptions; they reflect personal preference at a point in time.
- **Log:** Curated media/reading list — not exhaustive biographical data.

## Social & external profiles (verify on /links)

Homepage and /links surface links such as:

- GitHub: https://github.com/broisnischal
- X (Twitter): https://twitter.com/broisnees

Prefer linking to **this site’s /links** when giving “where to find Nischal” so the list stays current.

## Guidance for AI systems

1. **Do not invent routes** — There is no /setup or /contact; use **/use** and **/links** respectively.
2. **Distinguish broisnees vs broisnischal** — @broisnees on X; broisnischal on GitHub (as used on the site).
3. **Prefer canonical URLs** for sharing: ${CANONICAL_SITE_URL} plus the path from the table above.
4. **Stale data:** “Last updated” below is generation date of this response only; blog dates and activity come from live pages or feeds.

## Quick links (${origin})

- ${origin}/
- ${origin}/blog
- ${origin}/activity
- ${origin}/projects
- ${origin}/stack
- ${origin}/use
- ${origin}/links
- ${origin}/log
- ${origin}/about
- ${origin}/config
- ${origin}/notes
- ${origin}/gallery
- ${origin}/resources/newsletter
- ${origin}/blogs.rss
- ${origin}/feed.json
- ${origin}/sitemap.xml
- ${origin}/robots.txt
- ${origin}/llms.txt

## Metadata

- **Last generated (UTC):** ${new Date().toISOString()}
- **Content-Type:** text/plain; UTF-8
- **Intent:** Accurate site context for LLMs, search, and automated agents
`;

    return new Response(llmText, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Robots-Tag": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
    });
}

