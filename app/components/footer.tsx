import { Link } from "react-router";

import { NewsletterSubscribeForm } from "~/components/newsletter";
import {
  PORTFOLIO_REPO_URL,
  formatBuildDate,
  getBuildInfo,
} from "~/lib/build-meta";
import { TextLink } from "~/routes/_/about/route";

const FOOTER_LINKS: { to: string; label: string; external?: boolean }[] = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/activity", label: "Activity" },
  { to: "/projects", label: "Projects" },
  { to: "/llms.txt", label: "LLM", external: true },
  { to: "/blogs.rss", label: "RSS", external: true },
  { to: "/feed.json", label: "Feed", external: true },
  { to: "/resume.pdf", label: "Resume", external: true },
  { to: "/terms-of-service", label: "Terms of Service", external: true },
];

const linkClass =
  "underline underline-offset-4 transition-colors hover:text-foreground";

const metaSep = (
  <span className="select-none text-muted-foreground/35" aria-hidden>
    ·
  </span>
);

export function Footer() {
  const year = new Date().getFullYear();
  const { version, commit, modified } = getBuildInfo();
  const commitUrl = `${PORTFOLIO_REPO_URL}/commit/${commit}`;

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-16 lg:px-8 xl:px-12">
        <div className="flex flex-col gap-12">
          <div
            className="space-y-2"
            aria-labelledby="footer-newsletter-heading"
          >
            <h2
              id="footer-newsletter-heading"
              className="text-base font-semibold text-foreground"
            >
              Newsletter
            </h2>
            <NewsletterSubscribeForm variant="minimal" />
          </div>

          <div className="flex flex-col gap-8  pt-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
            <div className="flex min-w-0 flex-col gap-4 text-base leading-relaxed text-muted-foreground">
              <p>© {year} Nischal Dahal</p>
              <nav
                className="flex flex-wrap gap-x-3 gap-y-2"
                aria-label="Site, feeds, and documents"
              >
                {FOOTER_LINKS.map(({ to, label, external }) => (
                  <Link
                    key={to}
                    to={to}
                    className={linkClass}
                    {...(external
                      ? { target: "_blank" as const, rel: "noreferrer" }
                      : {})}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <p
            className="shrink-0 flex flex-col md:flex-row md:gap-3 font-mono text-xs leading-relaxed tracking-tight text-muted-foreground sm:text-sm"
            aria-label="Build version, last modified date, and commit"
          >
            <span className="tabular-nums text-foreground/90">
              version {version}
            </span>
            <span className="tabular-nums">
              last modified on {formatBuildDate(modified)}
            </span>
            <TextLink
              href={commitUrl}
              className="tabular-nums text-muted-foreground underline decoration-muted-foreground/30 underline-offset-[3px] hover:text-foreground hover:decoration-foreground/40"
            >
              {commit}
            </TextLink>
          </p>
        </div>
      </div>
    </footer>
  );
}
