import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Code,
  Github,
  Globe,
  Link2,
  Rss,
  ScrollText,
  Server,
  StickyNote,
  Twitter,
  User,
  Wrench,
} from "lucide-react";
import { Link, NavLink, data } from "react-router";
import { fetchGitHubActivity } from "~/.server/github-activity";
import {
  CANONICAL_SITE_URL,
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
  createWebSiteSchema,
} from "~/lib/meta";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/">Home</Link>,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Nischal Dahal - Software Developer",
    description:
      "Nischal Dahal (broisnischal) — software developer building serverless systems, Android apps, and modern web experiences. Portfolio, blog, projects, and latest GitHub activity.",
    path: "/",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "software developer",
      "portfolio",
      "web development",
      "React",
      "TypeScript",
      "serverless",
      "Android development",
      "Nepal",
    ],
  });

  const website = createWebSiteSchema({
    description:
      "Official portfolio of Nischal Dahal: writing, projects, tools, gallery, and open-source activity.",
  });

  return [...metaTags, createSchemaMetaTag(website)];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const gh = await fetchGitHubActivity(env, { perPage: 20 });

  return data({
    activityPreview: gh.items.slice(0, 5),
    activityUsername: gh.username,
    activityError: gh.error,
  });
}

const SOCIAL_LINKS = [
  {
    label: "X (Twitter)",
    href: "https://twitter.com/broisnees",
    Icon: Twitter,
  },
  {
    label: "GitHub",
    href: "https://github.com/broisnischal",
    Icon: Github,
  },
  {
    label: "Website",
    href: CANONICAL_SITE_URL,
    Icon: Globe,
  },
  {
    label: "RSS feed",
    href: `${CANONICAL_SITE_URL}/blogs.rss`,
    Icon: Rss,
  },
] as const;

export default function Page({ loaderData }: Route.ComponentProps) {
  const { activityPreview, activityUsername, activityError } = loaderData;

  return (
    <div className="max-w-4xl">
      <section className="mb-14 max-w-md" aria-label="Profile">
        <img
          src="https://lh3.googleusercontent.com/a/ACg8ocIfOkkApycqNKsCPiAgwPeqiYI6WxM_2Tzbro5EuFBj42vok1B3vA=s96-c"
          alt="Nischal Dahal"
          className="h-18 w-18 rounded-full object-cover ring-1 ring-border"
          loading="eager"
          fetchPriority="high"
        />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Nischal Dahal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">@broisnees</p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          building cool stuffs on web
        </p>
        <ul className="mt-6 flex flex-wrap items-center gap-5">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {activityError && activityPreview.length === 0 && (
        <p className="mb-8 text-sm text-muted-foreground" role="status">
          GitHub preview unavailable ({activityError}). Full timeline on{" "}
          <Link to="/activity" className="underline underline-offset-4">
            /activity
          </Link>
          .
        </p>
      )}

      <section aria-labelledby="nav-heading">
        <h2 id="nav-heading" className="sr-only">
          Site sections
        </h2>
        <NavigationCards />
      </section>
    </div>
  );
}

type NavItem = {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Temporarily hidden from navigation (faded, not clickable). */
  disabled?: boolean;
};

function NavigationCards() {
  const navItems: NavItem[] = [
    {
      to: "/activity",
      title: "Activity",
      description: "Commits, repos, stars, and PRs from GitHub",
      icon: Activity,
    },
    {
      to: "/blog",
      title: "Blog",
      description: "Articles and thoughts on technology",
      icon: BookOpen,
    },
    {
      to: "/notes",
      title: "Notes",
      description: "Glossary, bookmarks, and short notes",
      icon: StickyNote,
      disabled: true,
    },
    {
      to: "/projects",
      title: "Projects",
      description: "Things I've built and shipped",
      icon: Briefcase,
    },
    {
      to: "/links",
      title: "Links",
      description: "Socials and contact",
      icon: Link2,
    },
    {
      to: "/log",
      title: "Log",
      description: "Books, media, games, listening",
      icon: ScrollText,
    },
    {
      to: "/use",
      title: "Use",
      description: "Hardware and software I use",
      icon: Wrench,
    },
    {
      to: "/about",
      title: "About",
      description: "Background and interests",
      icon: User,
    },
    {
      to: "/stack",
      title: "Stack",
      description: "Languages, frameworks, and tools",
      icon: Code,
    },
    {
      to: "/gallery",
      title: "Gallery",
      description: "Photos from Google Photos",
      icon: Server,
      disabled: true,
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2 ">
      {navItems.map((item) => {
        const Icon = item.icon;
        const inner = (
          <>
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80",
                item.disabled ? "text-muted-foreground" : "text-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm font-medium",
                  item.disabled ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground leading-snug">
                {item.description}
              </span>
            </span>
          </>
        );

        if (item.disabled) {
          return (
            <li key={item.to}>
              <div
                className="flex gap-3 rounded-xl border border-transparent p-3 opacity-45 pointer-events-none cursor-not-allowed select-none"
                aria-disabled="true"
              >
                {inner}
              </div>
            </li>
          );
        }

        return (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex gap-3 rounded-xl border border-transparent p-3 transition-colors",
                  "hover:border-border hover:bg-muted/40",
                  isActive && "border-border bg-muted/30",
                )
              }
            >
              {inner}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
