import type { LucideIcon } from "lucide-react";
import { Github, Instagram, Linkedin, Rss, Send, Twitter } from "lucide-react";
import type { ReactNode } from "react";
import { Link, data } from "react-router";
import {
  CANONICAL_SITE_URL,
  createHeaders,
  createMetaTags,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/about">About</Link>,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "About",
    description:
      "Nischal Dahal — system architect and developer in Kathmandu (@broisnees / broisnischal). Goes deep on code, serverless, web, and Android.",
    path: "/about",
    keywords: [
      "Nischal Dahal",
      "broisnischal",
      "broisnees",
      "Kathmandu",
      "Nepal",
      "system architect",
      "software developer",
    ],
  });

  const schema = createPersonSchema({
    jobTitle: "System architect",
    description:
      "System architect and developer based in Kathmandu, Nepal. Works across web, serverless, and Android; writes and open-sources what he learns.",
  });

  return [...metaTags, createSchemaMetaTag(schema)];
};

export function headers() {
  return createHeaders();
}

export async function loader() {
  return data({});
}

const SOCIAL: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "GitHub", href: "https://github.com/broisnischal", Icon: Github },
  { label: "X", href: "https://twitter.com/broisnees", Icon: Twitter },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/nischalxdahal/",
    Icon: Linkedin,
  },
  { label: "Telegram", href: "https://t.me/broisnees", Icon: Send },
  {
    label: "Instagram",
    href: "https://instagram.com/broisnees",
    Icon: Instagram,
  },
  { label: "RSS", href: `${CANONICAL_SITE_URL}/blogs.rss`, Icon: Rss },
];

function TextLink({
  to,
  href,
  children,
}: {
  children: ReactNode;
  href?: string;
  to?: string;
}) {
  const className =
    "border-b border-foreground/25 pb-px text-foreground transition-colors hover:border-foreground";

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  );
}

export default function Page() {
  return (
    <article className="relative max-w-2xl p-0">
      <div
        className="pointer-events-none absolute -right-24 -top-8 h-64 w-64 rounded-full bg-linear-to-br from-foreground/6 via-transparent to-transparent blur-3xl dark:from-foreground/9"
        aria-hidden
      />

      <header className="relative mb-10 md:mb-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          About
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-tighter">
          Nischal Dahal
        </h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          @broisnees · broisnischal
        </p>
        <p className="mt-8 max-w-lg text-lg leading-snug text-foreground md:text-xl md:leading-snug">
          I&apos;m a <span className="font-semibold">system architect</span>{" "}
          first before any job title on LinkedIn. I care how the pieces connect,
          where they break, and whether the thing still makes sense six months
          later when you&apos;re tired and reading logs at 1&nbsp;a.m.
        </p>
      </header>

      <div className="relative space-y-10 md:space-y-12">
        <div className="space-y-6 text-[15px] leading-[1.75] text-foreground">
          <p>
            If you open my{" "}
            <TextLink href="https://github.com/broisnischal">GitHub</TextLink>{" "}
            profile, the bio is basically one line about <em>being</em> a system
            architect, a bit ungrammatical, and honestly how I still think about
            the work.
          </p>

          <p className="text-muted-foreground">
            If something here resonates, you can write{" "}
            <a
              href="mailto:nischaldahal01395@gmail.com"
              className="border-b border-foreground/25 pb-px text-foreground transition-colors hover:border-foreground"
            >
              nischaldahal01395@gmail.com
            </a>
            . I read it.
          </p>
        </div>

        <section
          className="border-t border-border pt-10"
          aria-labelledby="find-me"
        >
          <h2
            id="find-me"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            Elsewhere
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon
                    className="size-4 shrink-0 opacity-70 group-hover:opacity-100"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="border-b border-transparent pb-px group-hover:border-foreground/40">
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            More on <TextLink to="/links">/links</TextLink>.
          </p>
        </section>
      </div>
    </article>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
      <p className="text-destructive">{error.message}</p>
    </div>
  );
}
