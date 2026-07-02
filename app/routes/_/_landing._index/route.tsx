import { Github } from "lucide-react";
import { Link } from "react-router";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
import {
  createHeaders,
  createMetaTags,
  createSchemaMetaTag,
  createWebSiteSchema,
} from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/">home</Link>,
  hideBreadcrumbs: true,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Nischal Dahal - aka broisnischal",
    description:
      "Nischal Dahal (broisnischal) — software developer building serverless systems, products, and modern web experiences. Projects, writing, and links.",
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
      "Nepal",
    ],
  });

  const website = createWebSiteSchema({
    description:
      "Official portfolio of Nischal Dahal: writing, projects, tools, and open-source work.",
  });

  return [...metaTags, createSchemaMetaTag(website)];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
  });
}

type LinkItem = {
  label: string;
  href?: string;
  to?: string;
  display?: string;
  strike?: boolean;
  /** GitHub repo URL, rendered as a small icon button beside the link. */
  github?: string;
};

const PROJECTS: LinkItem[] = [
  {
    label: "battlify",
    href: "https://github.com/broisnischal/battlify",
    display: "github.com/broisnischal/battlify",
    github: "https://github.com/broisnischal/battlify",
  },
  {
    label: "stroke.click",
    href: "https://stroke.click",
    display: "stroke.click",
    github: "https://github.com/broisnischal/stroke",
  },
  {
    label: "wasper",
    href: "https://studio.stroke.click",
    display: "studio.stroke.click",
    github: "https://github.com/broisnischal/wasper",
  },
  {
    label: "zorail",
    href: "https://github.com/broisnischal/zorail",
    display: "github.com/broisnischal/zorail",
    github: "https://github.com/broisnischal/zorail",
  },
  {
    label: "azure-mcp",
    href: "https://github.com/broisnischal/azure-mcp",
    display: "github.com/broisnischal/azure-mcp",
    github: "https://github.com/broisnischal/azure-mcp",
  },
  {
    label: "prisma-type-generator",
    href: "https://github.com/broisnischal/prisma-type-generator",
    display: "github.com/broisnischal/prisma-type-generator",
    github: "https://github.com/broisnischal/prisma-type-generator",
  },
  {
    label: "zap",
    href: "https://github.com/broisnischal/zap",
    display: "github.com/broisnischal/zap",
    github: "https://github.com/broisnischal/zap",
  },
  { label: "lexicon", display: "sunset 2026", strike: true },
];

const WRITING: LinkItem[] = [
  { label: "Strongly Typed Env", to: "/blog/strongly-typed-env" },
  { label: "Dockerizing a Remix App", to: "/blog/dockerizing-remix-app" },
  { label: "Theme Inconsistency on SSR", to: "/blog/theme-inconsistency-ssr" },
  { label: "All posts", to: "/blog" },
];

const EXPLORE: LinkItem[] = [
  { label: "Blog", to: "/blog" },
  { label: "Activity", to: "/activity" },
  { label: "Links", to: "/links" },
  { label: "Uses", to: "/use" },
  { label: "Chess", to: "/chess" },
];

/** Renders a LinkItem as a `- [label](display)` list row. */
function Item({ item }: { item: LinkItem }) {
  if (item.strike) {
    return (
      <MdListItem>
        <span className="text-muted-foreground/55 line-through">
          [{item.label}]({item.display})
        </span>
      </MdListItem>
    );
  }
  return (
    <MdListItem>
      <MdLink
        label={item.label}
        to={item.to}
        href={item.href}
        display={item.display}
      />
      {item.github && (
        <a
          href={item.github}
          target="_blank"
          rel="noreferrer noopener"
          title={item.github}
          aria-label={`${item.label} on GitHub`}
          className="ml-2 inline-flex rounded-xs align-middle text-muted-foreground/60 outline-none transition-colors hover:text-bright focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Github className="size-3.5" aria-hidden />
        </a>
      )}
    </MdListItem>
  );
}

function Section({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <>
      <Squiggle />
      <section aria-label={title}>
        <SectionLabel>{title}</SectionLabel>
        <MdList>
          {items.map((item, i) => (
            <Item key={item.label + i} item={item} />
          ))}
        </MdList>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-base font-medium tracking-tight text-bright">
        nischal dahal
      </h1>

      <p className="mt-3 text-muted-foreground">
        building cool stuff — platform-agnostic, allergic to bloat, and pipes
        things into <code className="text-term-link">{"<(…)"}</code> for fun.
        part engineer, part romantic, quietly sophisticated, and an
        unapologetic nerd who ships.
      </p>

      <Section title="Projects" items={PROJECTS} />
      <Section title="Writing" items={WRITING} />
      <Section title="Explore" items={EXPLORE} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full text-sm">
      <SectionLabel>Error</SectionLabel>
      <p className="mt-2 text-destructive">{error.message}</p>
    </div>
  );
}
