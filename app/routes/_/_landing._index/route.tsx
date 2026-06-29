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
};

const PROJECTS: LinkItem[] = [
  { label: "stroke.click", href: "https://stroke.click", display: "stroke.click" },
  {
    label: "studio.stroke.click",
    href: "https://studio.stroke.click",
    display: "studio.stroke.click",
  },
  {
    label: "azure-mcp",
    href: "https://github.com/broisnischal/azure-mcp",
    display: "github.com/broisnischal/azure-mcp",
  },
  {
    label: "zap",
    href: "https://github.com/broisnischal/zap",
    display: "github.com/broisnischal/zap",
  },
  {
    label: "prisma-type-generator",
    href: "https://github.com/broisnischal/primsa-type-generator",
    display: "github.com/broisnischal/prisma-type-generator",
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
