import {
  formatForDisplay,
  HotkeysProvider,
  useHotkey,
} from "@tanstack/react-hotkeys";
import { Search } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, data } from "react-router";
import { getBlogs, type BlogListItem } from "~/lib/blog-content";
import {
  CANONICAL_SITE_URL,
  createBlogIndexSchema,
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/writing";

export const handle = {
  hideBreadcrumbs: true,
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

type YearGroup = { year: number; posts: BlogListItem[] };

function filterGroups(groups: YearGroup[], query: string): YearGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map(({ year, posts }) => ({
      year,
      posts: posts.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inExcerpt = p.excerpt?.toLowerCase().includes(q) ?? false;
        return inTitle || inExcerpt;
      }),
    }))
    .filter((g) => g.posts.length > 0);
}

function groupByYear(posts: BlogListItem[]): YearGroup[] {
  const map = new Map<number, BlogListItem[]>();
  for (const p of posts) {
    const raw = p.date;
    if (!raw) continue;
    const y = new Date(raw).getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(p);
  }
  const years = [...map.keys()].sort((a, b) => b - a);
  return years.map((year) => ({ year, posts: map.get(year)! }));
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const posts = loaderData?.groups.flatMap((g) => g.posts) ?? [];
  const metaTags = createMetaTags({
    title: "Writing — Nischal Dahal",
    description:
      "Chronological list of articles and notes by Nischal Dahal (broisnischal): web development, serverless, and software engineering.",
    path: "/writing",
    keywords: [
      "Nischal Dahal",
      "broisnischal",
      "writing",
      "blog",
      "articles",
      "web development",
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
  const sorted = blogs
    .filter((blog) => blog.date || blog.frontmatter?.published)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.frontmatter?.published || 0).getTime();
      const dateB = new Date(b.date || b.frontmatter?.published || 0).getTime();
      return dateB - dateA;
    });

  const serializable = sorted.map((b) => ({
    title: b.title,
    slug: b.slug,
    date: b.date || b.frontmatter?.published,
    excerpt: b.excerpt,
  })) as BlogListItem[];

  return data({ groups: groupByYear(serializable) });
}

export default function WritingPage({ loaderData }: Route.ComponentProps) {
  const { groups } = loaderData;

  return (
    <HotkeysProvider>
      <div className="writing-archive min-h-[55vh] font-sans text-foreground">
        <div className="max-w-xl w-full">
          <header className="pb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
              Writing
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Long-form posts, newest first. Also available via{" "}
              <a
                href="/blogs.rss"
                className="font-medium text-foreground underline decoration-border underline-offset-[3px] transition-colors hover:decoration-foreground"
              >
                RSS
              </a>{" "}
              or the{" "}
              <Link
                to="/blog"
                className="font-medium text-foreground underline decoration-border underline-offset-[3px] transition-colors hover:decoration-foreground"
              >
                full blog page
              </Link>
              .
            </p>
          </header>

          {groups.length === 0 ? (
            <p className="mt-12 text-base text-muted-foreground">
              No dated posts yet.
            </p>
          ) : (
            <WritingPostList groups={groups} />
          )}
        </div>
      </div>
    </HotkeysProvider>
  );
}

function WritingPostList({ groups }: { groups: YearGroup[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [shortcutParts, setShortcutParts] = useState<string[]>(["Ctrl", "F"]);

  useLayoutEffect(() => {
    setShortcutParts(
      formatForDisplay("Mod+F", { useSymbols: false }).split("+"),
    );
  }, []);

  useHotkey("Mod+F", () => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  });

  const filtered = useMemo(() => filterGroups(groups, query), [groups, query]);
  const trimmed = query.trim();
  const emptySearch = trimmed.length > 0 && filtered.length === 0;

  return (
    <>
      <div className="w-full">
        <label className="sr-only" htmlFor="writing-search">
          Search posts
        </label>
        <div className="flex w-full items-center gap-2.5 rounded-full border border-border bg-muted/30 px-3.5 py-2.5 pl-3">
          <Search
            className="size-4.5 shrink-0 text-muted-foreground"
            aria-hidden
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            id="writing-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          />
          <span
            className="hidden shrink-0 items-center gap-1 sm:flex"
            aria-hidden
          >
            {shortcutParts.map((part) => (
              <kbd
                key={part}
                className="rounded-md border border-border bg-muted/80 px-1.5 py-0.5 font-sans text-xs font-medium text-muted-foreground"
              >
                {part}
              </kbd>
            ))}
          </span>
        </div>
      </div>

      {emptySearch ? (
        <p className="mt-12 text-base text-muted-foreground">
          No posts match &ldquo;{trimmed}&rdquo;.
        </p>
      ) : (
        <div className="mt-12 space-y-14 sm:space-y-16">
          {filtered.map(({ year, posts }) => (
            <section key={year} aria-labelledby={`writing-y-${year}`}>
              <h2
                id={`writing-y-${year}`}
                className="text-sm font-medium tabular-nums tracking-wide text-muted-foreground"
              >
                {year}
              </h2>
              <ul className="mt-5 space-y-3.5 sm:space-y-4">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      to={`/blog/${post.slug}`}
                      prefetch="intent"
                      className="block text-lg font-normal leading-snug text-foreground transition-colors hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
