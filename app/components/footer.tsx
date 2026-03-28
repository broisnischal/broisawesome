import { Link } from "react-router";

import { NewsletterSubscribeForm } from "~/components/newsletter";

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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col gap-6">
          <div
            className="space-y-1.5"
            aria-labelledby="footer-newsletter-heading"
          >
            <h2
              id="footer-newsletter-heading"
              className="text-sm font-medium text-foreground"
            >
              Newsletter
            </h2>
            <NewsletterSubscribeForm variant="minimal" />
          </div>

          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
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
      </div>
    </footer>
  );
}
