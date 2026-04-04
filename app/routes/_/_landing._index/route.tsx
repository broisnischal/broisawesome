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
import { useState } from "react";
import { Link, NavLink, data, useLocation } from "react-router";
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
    description:
      "Improving internal tooling, documentation, and day-to-day developer workflows.",
    highlights: ["Tooling", "Documentation", "DX"],
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
    <div className="w-full max-w-3xl">
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
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground md:text-5xl">
          Nischal Dahal
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">@broisnees</p>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
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

      <section aria-labelledby="nav-heading" className="mt-2">
        <h2
          id="nav-heading"
          className="mb-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          Explore
        </h2>
        <NavigationCards />
      </section>

      <section
        aria-labelledby="work-heading"
        className="relative mt-14 border-t border-border/50 pt-10"
      >
        <div
          className="pointer-events-none absolute -left-12 top-10 h-32 w-32 rounded-full bg-linear-to-br from-foreground/6 via-foreground/2 to-transparent blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-28 h-24 w-24 rounded-full bg-linear-to-tr from-foreground/5 via-transparent to-transparent blur-2xl"
          aria-hidden
        />

        <div className="relative mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2
            id="work-heading"
            className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            Work experience
          </h2>
          <Link
            to="/about"
            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="underline decoration-muted-foreground/30 underline-offset-4 transition-colors group-hover:decoration-foreground/35">
              More on /about
            </span>
            <ArrowUpRight
              className="size-3.5 opacity-60 transition-all duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100"
              aria-hidden
            />
          </Link>
        </div>

        <div className="relative">
          {/* Rail: 12px column; line + particles centered at 6px */}
          <div
            className="pointer-events-none absolute top-2 bottom-2 left-[6px] w-px -translate-x-1/2 bg-linear-to-b from-border via-border/65 to-border/12 dark:from-white/14 dark:via-white/9 dark:to-white/4"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-2 bottom-2 left-[6px] w-4 -translate-x-1/2 overflow-hidden"
            aria-hidden
          >
            <span
              className="work-timeline-particle"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="work-timeline-particle"
              style={{ animationDelay: "1.25s" }}
            />
            <span
              className="work-timeline-particle"
              style={{ animationDelay: "2.5s" }}
            />
          </div>

          <ol className="relative m-0 list-none p-0">
            {WORK_EXPERIENCE.map((item, index) => {
              const metaParts = [item.company, item.location].filter(Boolean);
              const meta = metaParts.join(" · ");

              return (
                <li
                  key={`${item.role}-${item.company}-${item.period}`}
                  className={cn(
                    "group/item grid grid-cols-[12px_minmax(0,1fr)] gap-x-4",
                    index < WORK_EXPERIENCE.length - 1 ? "pb-10" : "pb-1",
                  )}
                >
                  <div className="flex justify-center pt-[0.35rem]">
                    <span
                      className={cn(
                        "relative z-1 flex size-2 shrink-0 items-center justify-center rounded-full bg-background ring-2",
                        index === 0
                          ? "ring-foreground/38 dark:ring-white/42"
                          : "ring-border/85 dark:ring-white/14",
                      )}
                      aria-hidden
                    >
                      <span
                        className={cn(
                          "block size-1 rounded-full",
                          index === 0
                            ? "bg-foreground/90"
                            : "bg-muted-foreground/60",
                        )}
                      />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
                      <div className="min-w-0 space-y-0.5">
                        <h3 className="text-base font-semibold tracking-tight text-foreground md:text-[1.0625rem]">
                          {item.role}
                        </h3>
                        {meta ? (
                          <p className="text-xs leading-snug text-muted-foreground">
                            {meta}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-mono text-[0.7rem] tracking-wide text-muted-foreground/90 tabular-nums">
                        {item.period}
                      </p>
                    </div>

                    {item.description ? (
                      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                        {item.description}
                      </p>
                    ) : null}

                    {item.highlights?.length ? (
                      <ul
                        className="mt-3 flex flex-wrap gap-1.5"
                        aria-label={`Focus areas for ${item.role}`}
                      >
                        {item.highlights.map((tag) => (
                          <li key={tag}>
                            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/25 px-2.5 py-0.5 text-[0.68rem] font-medium tracking-wide text-muted-foreground transition-colors duration-200 group-hover/item:border-border/80 group-hover/item:bg-muted/40 dark:border-white/10 dark:bg-white/5 dark:group-hover/item:border-white/15">
                              {tag}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
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

function navStableKey(item: NavItem) {
  return item.to;
}

function pathMatchesItem(pathname: string, to: string) {
  const base = to.split("?")[0] || to;
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}

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

  const location = useLocation();
  const firstEnabled = navItems.find((i) => !i.disabled);
  const firstKey = firstEnabled ? navStableKey(firstEnabled) : "";
  const [emphasizedKey, setEmphasizedKey] = useState(firstKey);

  const activeInternalItem = navItems.find(
    (i) =>
      !i.disabled &&
      !/^https?:\/\//.test(i.to) &&
      pathMatchesItem(location.pathname, i.to),
  );
  const activeInternalKey = activeInternalItem
    ? navStableKey(activeInternalItem)
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border border-border/70 bg-muted/25 shadow-[0_1px_0_0_oklch(0_0_0_/_0.04)]",
        "dark:border-white/[0.09] dark:bg-white/[0.025] dark:shadow-[0_1px_0_0_oklch(1_0_0_/_0.06)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,oklch(0.55_0.12_264_/_0.06),transparent_55%)] dark:bg-[radial-gradient(120%_80%_at_0%_0%,oklch(0.55_0.14_264_/_0.12),transparent_55%)]"
        aria-hidden
      />
      <ul className="relative grid gap-1 p-1.5 sm:grid-cols-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isExternal = /^https?:\/\//.test(item.to);
          const key = navStableKey(item);
          const isEmphasized = !item.disabled && emphasizedKey === key;

          const inner = (isLifted: boolean) => (
            <>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                  item.disabled
                    ? "bg-muted/40 text-muted-foreground/60"
                    : cn(
                        "text-foreground/75",
                        "bg-foreground/[0.045] dark:bg-white/[0.06]",
                        isLifted &&
                          "bg-foreground/[0.07] text-foreground dark:bg-white/[0.1] dark:text-foreground",
                      ),
                )}
              >
                <Icon className="" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span
                  className={cn(
                    "block text-sm font-medium tracking-tight text-balance",
                    item.disabled ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {item.title}
                </span>
                <span className=" block text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-all duration-200",
                  item.disabled
                    ? "opacity-0"
                    : cn(
                        isLifted
                          ? "translate-x-0 opacity-100"
                          : "translate-x-0.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                      ),
                )}
                aria-hidden
              >
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </>
          );

          const interactiveClass = ({
            isActive,
            isLifted,
          }: {
            isActive: boolean;
            isLifted: boolean;
          }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 outline-none transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
              "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              item.disabled
                ? ""
                : cn(
                    isLifted &&
                      cn(
                        "bg-background/80 shadow-[inset_0_0_0_1px_oklch(0_0_0_/_0.06)]",
                        "dark:bg-white/[0.06] dark:shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.1)]",
                      ),
                    !isLifted && "hover:bg-muted/35 dark:hover:bg-white/[0.04]",
                  ),
            );

          if (item.disabled) {
            return (
              <li key={item.to}>
                <div
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-2.5 py-2.5 opacity-40 select-none"
                  aria-disabled="true"
                >
                  {inner(false)}
                </div>
              </li>
            );
          }

          const setEmphasis = () => setEmphasizedKey(key);
          const resolveLifted = (isActive: boolean) =>
            isActive ||
            (isEmphasized && (!activeInternalKey || activeInternalKey === key));

          return (
            <li key={item.to}>
              {isExternal ? (
                <a
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={setEmphasis}
                  onFocus={setEmphasis}
                  className={interactiveClass({
                    isActive: false,
                    isLifted: resolveLifted(false),
                  })}
                >
                  {inner(resolveLifted(false))}
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  end
                  prefetch="intent"
                  onMouseEnter={setEmphasis}
                  onFocus={setEmphasis}
                  className={({ isActive }) => {
                    const isLifted = resolveLifted(isActive);
                    return interactiveClass({ isActive, isLifted });
                  }}
                >
                  {({ isActive }) => inner(resolveLifted(isActive))}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
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
