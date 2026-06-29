import { Link, data, useSearchParams } from "react-router";
import type { Route } from "./+types/route";
import { useState, useMemo } from "react";
import { createMetaTags, createHeaders, createPageSchema } from "~/lib/meta";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";

export const handle = {
  breadcrumb: () => <Link to="/notes">notes</Link>,
};

const NOTES_DESCRIPTION =
  "Notes by Nischal Dahal - Personal notes, glossary terms, and bookmarks. Technical definitions and useful resources for developers.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Notes",
    description: NOTES_DESCRIPTION,
    path: "/notes",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "notes",
      "glossary",
      "bookmarks",
      "technical notes",
      "developer resources",
      "programming notes",
    ],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Notes — Nischal Dahal",
      description: NOTES_DESCRIPTION,
      path: "/notes",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Notes", path: "/notes" },
      ],
      type: "CollectionPage",
    }),
  ];
};

export function headers() {
  return createHeaders();
}

export type ReferenceLink = {
  url: string;
  description: string;
  title?: string;
};

export type NoteItem = {
  id: string;
  title: string;
  content?: string;
  category: "note" | "glossary" | "bookmark" | "watch later";
  tags?: string[];
  url?: string;
  date?: string;
  term?: string; // For glossary items
  definition?: string; // For glossary items
  references?: ReferenceLink[]; // Multiple reference links for glossary
};

// Sample data - in a real app, this would come from a database or file system
const notesData: NoteItem[] = [
  {
    id: "1",
    title: "React Server Components",
    content:
      "RSC allows rendering components on the server, reducing client-side JavaScript.",
    category: "note",
    tags: ["react", "server-components", "nextjs"],
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Youtube watch later video",
    content:
      "RSC allows rendering components on the server, reducing client-side JavaScript.",
    category: "watch later",
    tags: ["react", "server-components", "nextjs"],
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "TypeScript Utility Types",
    content:
      "Pick, Omit, Partial, Required - essential utility types for type manipulation.",
    category: "note",
    tags: ["typescript", "types"],
    date: "2024-01-10",
  },
  {
    id: "3",
    title: "Hydration",
    term: "Hydration",
    definition:
      "The process of attaching event listeners and making server-rendered HTML interactive.",
    category: "glossary",
    tags: ["react", "ssr", "web"],
    references: [
      {
        url: "https://react.dev/reference/react-dom/client/hydrateRoot",
        description: "Official React documentation on hydration",
        title: "React Docs",
      },
      {
        url: "https://www.youtube.com/watch?v=ZJP9k9L7g0s",
        description: "Deep dive into React hydration",
        title: "YouTube Tutorial",
      },
    ],
  },
  {
    id: "4",
    title: "MDX",
    term: "MDX",
    definition:
      "Markdown for the component era. Write JSX in your Markdown documents.",
    category: "glossary",
    tags: ["markdown", "react", "jsx"],
    references: [
      {
        url: "https://mdxjs.com/",
        description: "Official MDX documentation",
      },
    ],
  },
  {
    id: "5",
    title: "React Router v7",
    url: "https://reactrouter.com/",
    category: "bookmark",
    tags: ["react", "routing", "framework"],
    date: "2024-01-20",
  },
  {
    id: "6",
    title: "Tailwind CSS Documentation",
    url: "https://tailwindcss.com/docs",
    category: "bookmark",
    tags: ["css", "styling", "utility"],
    date: "2024-01-18",
  },
  {
    id: "7",
    title: "React Server Components Explained",
    url: "https://www.youtube.com/watch?v=TQQPAU21ZUw",
    category: "bookmark",
    tags: ["react", "youtube", "tutorial"],
    date: "2024-01-22",
  },
];

export async function loader() {
  return data({ notes: notesData });
}

type Category = "all" | "note" | "glossary" | "bookmark" | "watch later";

export default function Page({ loaderData }: Route.ComponentProps) {
  const { notes } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const searchQuery = searchParams.get("q") || "";
  const tagsParam = searchParams.get("tags") || "";
  const selectedTags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => {
        return selectedTags.some((tag) => note.tags?.includes(tag));
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((note) => {
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content?.toLowerCase().includes(query);
        const matchesTerm = note.term?.toLowerCase().includes(query);
        const matchesDefinition = note.definition
          ?.toLowerCase()
          .includes(query);
        const matchesTags = note.tags?.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        const matchesReferences = note.references?.some(
          (ref) =>
            ref.description.toLowerCase().includes(query) ||
            ref.title?.toLowerCase().includes(query),
        );
        return (
          matchesTitle ||
          matchesContent ||
          matchesTerm ||
          matchesDefinition ||
          matchesTags ||
          matchesReferences
        );
      });
    }

    // Sort by date (most recent first) or by title
    return filtered.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (a.date) return -1;
      if (b.date) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [notes, selectedCategory, searchQuery, selectedTags]);

  const handleSearchChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newSearchParams.set("q", value);
    } else {
      newSearchParams.delete("q");
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const toggleTag = (tag: string) => {
    if (tag === "all") {
      setSearchParams(new URLSearchParams(), { replace: true });
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    const currentTags =
      newSearchParams.get("tags")?.split(",").filter(Boolean) || [];

    if (currentTags.includes(tag)) {
      const updatedTags = currentTags.filter((t) => t !== tag);
      if (updatedTags.length > 0) {
        newSearchParams.set("tags", updatedTags.join(","));
      } else {
        newSearchParams.delete("tags");
      }
    } else {
      newSearchParams.set("tags", [...currentTags, tag].join(","));
    }

    setSearchParams(newSearchParams, { replace: true });
  };

  const categories: { value: Category; label: string; count: number }[] = [
    { value: "all", label: "All", count: notes.length },
    {
      value: "note",
      label: "Notes",
      count: notes.filter((n) => n.category === "note").length,
    },
    {
      value: "glossary",
      label: "Glossary",
      count: notes.filter((n) => n.category === "glossary").length,
    },
    {
      value: "bookmark",
      label: "Bookmarks",
      count: notes.filter((n) => n.category === "bookmark").length,
    },
    {
      value: "watch later",
      label: "Watch Later",
      count: notes.filter((n) => n.category === "watch later").length,
    },
  ];

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Notes</h1>
      <p className="mt-2 text-muted-foreground">
        personal notes, glossary terms, and bookmarks
      </p>

      <Squiggle />

      {/* Search */}
      <div className="mb-6">
        <SectionLabel>Search:</SectionLabel>
        <div className="mt-2">
          <input
            type="text"
            placeholder="search notes, terms, bookmarks..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border border-border bg-muted px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-term-link focus:outline-none"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`border px-2 py-0.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              selectedCategory === cat.value
                ? "border-term-link text-term-link"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
            <span className="ml-1 opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <SectionLabel>Tags:</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`border px-2 py-0.5 font-mono text-xs transition-colors ${
                    isSelected
                      ? "border-term-link text-term-link"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() =>
                  setSearchParams(new URLSearchParams(), { replace: true })
                }
                className="border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                clear
              </button>
            )}
          </div>
        </div>
      )}

      <Squiggle />

      {filteredNotes.length === 0 ? (
        <p className="text-muted-foreground">no items found</p>
      ) : (
        <div className="space-y-0">
          {filteredNotes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteItem({ note }: { note: NoteItem }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isYouTubeUrl = (url?: string): boolean => {
    if (!url) return false;
    return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.test(
      url,
    );
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    );
    return match ? match[1] : null;
  };

  const isYouTube = note.url && isYouTubeUrl(note.url);
  const videoId = isYouTube && note.url ? getYouTubeVideoId(note.url) : null;

  return (
    <div className="border-b border-border py-5 last:border-b-0">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground/60">
          {note.category}
        </span>
        {note.date && (
          <span className="font-mono text-xs text-muted-foreground/50">
            {formatDate(note.date)}
          </span>
        )}
        {note.tags && note.tags.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground/40">
            {note.tags.map((t) => `#${t}`).join(" ")}
          </span>
        )}
      </div>

      {note.category === "glossary" ? (
        <div>
          <p className="text-bright uppercase tracking-[0.1em]">
            {note.term || note.title}
          </p>
          {note.definition && (
            <p className="mt-1 text-muted-foreground">{note.definition}</p>
          )}
          {note.references && note.references.length > 0 && (
            <div className="mt-3">
              <SectionLabel className="text-xs">References:</SectionLabel>
              <MdList className="mt-1">
                {note.references.map((ref, index) => (
                  <MdListItem key={index}>
                    <span className="text-muted-foreground">
                      <MdLink
                        label={ref.title || ref.url}
                        href={ref.url}
                      />{" "}
                      — {ref.description}
                    </span>
                  </MdListItem>
                ))}
              </MdList>
            </div>
          )}
        </div>
      ) : note.category === "bookmark" ? (
        <div>
          <MdLink label={note.title} href={note.url ?? "#"} />
          {isYouTube && videoId && (
            <div className="mt-3 border border-border overflow-hidden max-w-md">
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={note.title}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </a>
            </div>
          )}
          {note.url && !isYouTube && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground/50 truncate">
              {note.url}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-foreground">{note.title}</p>
          {note.content && (
            <p className="mt-1 text-muted-foreground">{note.content}</p>
          )}
        </div>
      )}
    </div>
  );
}
