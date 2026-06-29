import {
  formatForDisplay,
  HotkeysProvider,
  useHotkey,
} from "@tanstack/react-hotkeys";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { data } from "react-router";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
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
      <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
        <h1 className="text-lg font-medium tracking-tight text-bright">Writing</h1>
        <p className="mt-2 text-muted-foreground">
          long-form posts, newest first — also via{" "}
          <a href="/blogs.rss" className="term-link">
            /blogs.rss
          </a>{" "}
          or{" "}
          <MdLink label="blog" to="/blog" />
        </p>

        <Squiggle />

        {groups.length === 0 ? (
          <p className="text-muted-foreground">no dated posts yet.</p>
        ) : (
          <WritingPostList groups={groups} />
        )}
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
        <div className="flex w-full items-center gap-2 border border-border bg-muted px-3 py-1.5">
          <span className="select-none text-muted-foreground/60" aria-hidden>
            /
          </span>
          <input
            ref={inputRef}
            id="writing-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search posts"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
          />
          <span
            className="hidden shrink-0 items-center gap-1 sm:flex"
            aria-hidden
          >
            {shortcutParts.map((part) => (
              <kbd
                key={part}
                className="border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {part}
              </kbd>
            ))}
          </span>
        </div>
      </div>

      {emptySearch ? (
        <p className="mt-6 text-muted-foreground">
          no posts match &ldquo;{trimmed}&rdquo;.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {filtered.map(({ year, posts }, i) => (
            <section key={year} aria-label={`${year} posts`}>
              {i > 0 && <Squiggle />}
              <SectionLabel>{year}:</SectionLabel>
              <MdList>
                {posts.map((post) => (
                  <MdListItem key={post.slug}>
                    <MdLink
                      label={post.title}
                      to={`/blog/${post.slug}`}
                    />
                    {post.excerpt ? (
                      <span className="ml-1 text-muted-foreground">
                        — {post.excerpt}
                      </span>
                    ) : null}
                  </MdListItem>
                ))}
              </MdList>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
