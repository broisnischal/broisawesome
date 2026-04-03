import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Code,
  FileText,
  Github,
  Globe,
  Image,
  Link2,
  Rss,
  ScrollText,
  Sparkles,
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
    title: "Nischal Dahal - aka broisnischal",
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

type WorkExperience = {
  role: string;
  company?: string;
  period: string;
  location?: string;
  description: string;
  highlights?: string[];
};

/**
 * Homepage work list.
 * Edit this array to keep your work/experience section current.
 */
const WORK_EXPERIENCE: WorkExperience[] = [
  {
    role: "DX Engineer",
    company: "AITC International",
    period: "2025 — Present",
    location: "Onsite",
    description: "",
  },
  {
    role: "System Architect",
    company: "Veda Studios",
    period: "2023 — Present",
    location: "Kathmandu, Nepal",
    description:
      "Designing and shipping serverless-first systems with a focus on reliability, cost control, and developer experience.",
    highlights: ["Cloudflare Workers", "System design", "DX", "Performance"],
  },
  {
    role: "Full Stack Engineer",
    company: "Freelance / Product Work",
    period: "2021 — Present",
    location: "Remote",
    description:
      "Building production web products end-to-end: architecture, API design, frontend implementation, and deployment.",
    highlights: ["React", "TypeScript", "API design", "UI engineering"],
  },
];

export default function Page({ loaderData }: Route.ComponentProps) {
  const { activityPreview, activityError } = loaderData;

  return (
    <div className="max-w-4xl px-4 md:px-0">
      <section className="mb-14 max-w-md" aria-label="Profile">
        <img
          src="https://lh3.googleusercontent.com/a/ACg8ocIfOkkApycqNKsCPiAgwPeqiYI6WxM_2Tzbro5EuFBj42vok1B3vA=s256-c"
          alt="Nischal Dahal profile picture"
          className="h-24 w-24 rounded-full object-cover ring-1 ring-border"
          width={96}
          height={96}
          loading="eager"
          fetchPriority="high"
          referrerPolicy="no-referrer"
        />
        <h1 className="mt-5 font-clash text-2xl font-normal tracking-tight text-foreground md:text-5xl">
          Nischal Dahal
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">@broisnees</p>
        <p className="mt-4 max-w-prose text-lg text-muted-foreground leading-relaxed">
          building cool stuffs on web, platform agnostic, tech savvy guy,
          <span className="font-medium"> romantic </span>, sophisticated, and a
          bit of a nerd.
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
        <p className="mb-8 text-base text-muted-foreground" role="status">
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

      <section
        aria-labelledby="work-heading"
        className="relative mt-12 border-t border-border/70 pt-8"
      >
        <div
          className="pointer-events-none absolute -left-14 top-8 h-36 w-36 rounded-full bg-linear-to-br from-foreground/[0.06] via-foreground/[0.02] to-transparent blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-24 h-28 w-28 rounded-full bg-linear-to-tr from-foreground/[0.05] via-transparent to-transparent blur-2xl"
          aria-hidden
        />

        <div className="mb-6 flex items-end justify-between gap-3">
          <h2
            id="work-heading"
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
          >
            Work Experience
          </h2>
          <Link
            to="/about"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            more on /about
          </Link>
        </div>

        <ol className="relative ml-1 list-none border-l border-border/60 p-0">
          {WORK_EXPERIENCE.map((item) => (
            <li
              key={`${item.role}-${item.company}-${item.period}`}
              className="relative pb-8 pl-6 last:pb-0"
            >
              <span
                className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-foreground/80 ring-4 ring-background"
                aria-hidden
              />

              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 leading-tight">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {item.role}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  {item.period}
                </p>
              </div>

              {item.company ? (
                <p className="font-mono text-xs text-muted-foreground">
                  {item.company}
                </p>
              ) : null}

              {/* <p className="mt-1 text-sm text-muted-foreground">
                  {item.company}
                  {item.location ? <span className="opacity-70"> · {item.location}</span> : null}
                </p> */}

              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
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
      description: "GitHub activity timeline",
      icon: Activity,
    },
    {
      to: "/blog",
      title: "Blog",
      description: "Articles and notes",
      icon: FileText,
    },
    // {
    //   to: "/notes",
    //   title: "Notes",
    //   description: "Glossary, bookmarks, and short notes",
    //   icon: StickyNote,
    //   disabled: true,
    // },
    {
      to: "/projects",
      title: "Projects",
      description: "Things I'm working on",
      icon: Briefcase,
    },
    {
      to: "/links",
      title: "Links",
      description: "Social and profile links",
      icon: Link2,
    },
    {
      to: "/log?tab=game",
      title: "Log",
      description: "Games, reading list.",
      icon: ScrollText,
    },
    // {
    //   to: "/listening",
    //   title: "Listening",
    //   description: "recently played songs",
    //   icon: Headphones,
    // },
    {
      to: "/portfolio-curation",
      title: "Sites",
      description: "Sites I like — jump in",
      icon: Sparkles,
    },
    {
      to: "/use",
      title: "Use",
      description: "Setup and hardware I use",
      icon: Wrench,
    },
    {
      to: "/about",
      title: "About",
      description: "background and interests",
      icon: User,
    },
    {
      to: "/stack",
      title: "Stack",
      description: "languages, frameworks, and tools",
      icon: Code,
    },
    {
      to: "https://photos.app.goo.gl/2RHWh9PyAGyRCZAP9",
      title: "Gallery",
      description: "Photos on Google Photos",
      icon: Image,
      disabled: false,
    },
  ];

  return (
    <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isExternal = /^https?:\/\//.test(item.to);
        const inner = (
          <>
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/55",
                item.disabled
                  ? "text-muted-foreground/70"
                  : "text-foreground/85",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 font-sans">
              <span
                className={cn(
                  "block text-[0.98rem] font-medium tracking-tight",
                  item.disabled ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {item.title}
              </span>
              <span className="mt-0.5 block text-[0.86rem] leading-relaxed text-muted-foreground">
                {item.description}
              </span>
            </span>
            <span
              className={cn(
                "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-all",
                item.disabled
                  ? "opacity-0"
                  : "translate-x-0.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
              )}
              aria-hidden
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </>
        );

        if (item.disabled) {
          return (
            <li key={item.to}>
              <div
                className="flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 opacity-45 pointer-events-none cursor-not-allowed select-none"
                aria-disabled="true"
              >
                {inner}
              </div>
            </li>
          );
        }

        return (
          <li key={item.to}>
            {isExternal ? (
              <a
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-start gap-3 rounded-lg border border-border/35 bg-background/30 px-3 py-2.5 transition-all duration-150 hover:border-border/70 hover:bg-muted/25",
                  "hover:border-border/50 hover:bg-muted/25",
                )}
              >
                {inner}
              </a>
            ) : (
              <NavLink
                to={item.to}
                end
                prefetch="intent"
                className={({ isActive }) =>
                  cn(
                    "group flex items-start gap-3 rounded-lg border border-border/35 bg-background/30 px-3 py-2.5 transition-all duration-150 hover:border-border/70 hover:bg-muted/25",
                    isActive && "border-border/70 bg-muted/30",
                  )
                }
              >
                {inner}
              </NavLink>
            )}
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
