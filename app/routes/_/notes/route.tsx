import { Link, data, useSearchParams } from "react-router";
import type { Route } from "./+types/route";
import { useState, useMemo } from "react";
import { createMetaTags, createHeaders } from "~/lib/meta";
import { XIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const handle = {
  breadcrumb: () => <Link to="/notes">Notes</Link>,
};

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Notes",
    description:
      "Notes by Nischal Dahal - Personal notes, glossary terms, and bookmarks. Technical definitions and useful resources for developers.",
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Personal notes, glossary terms, and bookmarks I&apos;ve collected.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search notes, terms, or bookmarks..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as Category)}
      >
        <TabsList className="mb-4">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
              <span className="opacity-70">({category.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {allTags.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">
              Filter by tags:
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const isYouTube = tag === "youtube";
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={` cursor-pointer
                                        px-3 py-1 text-xs font-medium rounded-full transition-all
                                        ${
                                          isSelected
                                            ? isYouTube
                                              ? "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
                                              : "bg-primary/20 text-primary border border-primary/30"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                                        }
                                    `}
                  >
                    {tag}
                  </button>
                );
              })}
              {selectedTags.length > 0 && (
                <button
                  onClick={() =>
                    setSearchParams(new URLSearchParams(), { replace: true })
                  }
                  className="cursor-pointer px-3 py-1 text-xs font-medium rounded-full transition-all bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            <div className="space-y-8">
              {filteredNotes
                .filter((note) => note.category === category.value)
                .map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tags Filter */}

      {/* Notes List */}
      <div className="space-y-8">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredNotes.map((note) => <NoteItem key={note.id} note={note} />)
        )}
      </div>
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
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      {/* Category and Date */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {note.category}
        </span>
        {note.date && (
          <span className="text-xs text-muted-foreground">
            {formatDate(note.date)}
          </span>
        )}
      </div>

      {note.category === "glossary" ? (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {note.term || note.title}
          </h3>
          {note.definition && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {note.definition}
            </p>
          )}
          {note.references && note.references.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                References
              </p>
              {note.references.map((ref, index) => {
                return (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="flex-1 min-w-0">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 group/link"
                      >
                        {ref.title || ref.url}
                        <svg
                          className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ref.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : note.category === "bookmark" ? (
        <div>
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-semibold text-primary hover:underline inline-flex items-center gap-2 group/link mb-2"
          >
            {note.title}
            <svg
              className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          {isYouTube && videoId && (
            <div className="mt-3 rounded-lg overflow-hidden max-w-2xl">
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={note.title}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                />
              </a>
            </div>
          )}
          {note.url && !isYouTube && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {note.url}
            </p>
          )}
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {note.title}
          </h3>
          {note.content && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {note.content}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
