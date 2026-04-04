import { ArrowUpRight, Rss } from "lucide-react";
import { Link } from "react-router";

import { NewsletterSubscribeForm } from "~/components/newsletter";
import {
  PORTFOLIO_REPO_URL,
  formatBuildDate,
  getBuildInfo,
} from "~/lib/build-meta";
import { cn } from "~/lib/utils";
import { TextLink } from "~/routes/_/about/route";

const FOOTER_GROUPS: Array<{
  title: string;
  items: { to: string; label: string; external?: boolean }[];
}> = [
  {
    title: "Explore",
    items: [
      { to: "/", label: "Home" },
      { to: "/blog", label: "Blog" },
      { to: "/activity", label: "Activity" },
      { to: "/projects", label: "Projects" },
    ],
  },
  {
    title: "Docs",
    items: [
      {
        to: "https://reactrouter.com/",
        label: "React Router",
        external: true,
      },
      { to: "/resume.pdf", label: "Resume", external: true },
      { to: "/llms.txt", label: "LLM", external: true },
      { to: "/terms-of-service", label: "Terms", external: true },
    ],
  },
  {
    title: "Feeds",
    items: [
      { to: "/blogs.rss", label: "RSS", external: true },
      { to: "/feed.json", label: "JSON Feed", external: true },
    ],
  },
];

const footerLinkClass =
  "group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground";

export function Footer() {
  const year = new Date().getFullYear();
  const { version, commit, modified } = getBuildInfo();
  const commitUrl = `${PORTFOLIO_REPO_URL}/commit/${commit}`;

  return (
    <footer className="mt-auto border-t border-border/50 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-0 md:py-16">
        <div className="flex flex-col gap-14 md:gap-16">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:items-start md:gap-x-12 md:gap-y-0">
            <section className="grid gap-3" aria-labelledby="footer-heading">
              <p className="font-mono text-[0.62rem] uppercase leading-none tracking-[0.24em] text-muted-foreground/55">
                End of page
              </p>
              <h2
                id="footer-heading"
                className="max-w-md text-xl font-semibold tracking-tight text-foreground md:text-2xl"
              >
                Thanks for reading.
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Notes, projects, logs, and personal writing from Nischal Dahal,
                built and maintained by me — help me improve by subscribing to
                my newsletter.
              </p>
            </section>

            <section
              className="grid gap-3"
              aria-labelledby="footer-newsletter-heading"
            >
              <p className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase leading-none tracking-[0.24em] text-muted-foreground/55">
                <Rss
                  className="size-3 shrink-0 text-muted-foreground/65"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Updates
              </p>
              <h2
                id="footer-newsletter-heading"
                className="text-xl font-semibold tracking-tight text-foreground md:text-2xl"
              >
                Newsletter
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Occasional updates when something is worth sharing low volume,
                no spam.
              </p>
              <NewsletterSubscribeForm variant="minimal" />
            </section>
          </div>

          <div
            className={cn(
              "grid gap-10 border-t border-border/40 pt-10",
              "md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-12",
            )}
          >
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-tight text-foreground">
                Nischal Dahal
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                Software systems, web products, and personal writing from
                Kathmandu, Nepal.
              </p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/55">
                © {year}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {FOOTER_GROUPS.map((group) => (
                <nav
                  key={group.title}
                  aria-label={group.title}
                  className="space-y-3"
                >
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground/55">
                    {group.title}
                  </p>
                  <div className="flex flex-col items-start gap-2">
                    {group.items.map(({ to, label, external }) => (
                      <Link
                        key={to}
                        to={to}
                        className={footerLinkClass}
                        {...(external
                          ? { target: "_blank" as const, rel: "noreferrer" }
                          : {})}
                      >
                        <span className="transition-transform duration-200 ease-out group-hover:translate-x-px">
                          {label}
                        </span>
                        {external ? (
                          <ArrowUpRight
                            className="size-3.5 opacity-50 transition-all duration-200 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100"
                            aria-hidden
                          />
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </nav>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:gap-6">
            <p
              className="flex flex-col gap-1 font-mono tracking-tight sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1"
              aria-label="Build version, last modified date, and commit"
            >
              <span className="tabular-nums text-foreground/80">
                v{version}
              </span>
              <span className="tabular-nums opacity-90">
                updated {formatBuildDate(modified)}
              </span>
              <TextLink
                href={commitUrl}
                className="tabular-nums underline decoration-muted-foreground/25 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground/30"
              >
                {commit}
              </TextLink>
            </p>

            <p className="text-xs text-muted-foreground/80 md:text-right">
              Built with{" "}
              <TextLink href="https://reactrouter.com/">React Router</TextLink>{" "}
              and shipped with care.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
