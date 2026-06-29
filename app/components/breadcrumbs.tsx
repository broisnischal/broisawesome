import { Link, useMatches } from "react-router";

/**
 * Clean path breadcrumb: `home / blog / post`. No shell chrome — reads like the
 * top line of a rendered markdown document.
 */
export function Breadcrumbs() {
  const matches = useMatches();

  const routeBreadcrumbs = matches
    .filter((match) => match.handle && (match.handle as any).breadcrumb)
    .map((match) => {
      try {
        const breadcrumb = (match.handle as any).breadcrumb(match);
        return { breadcrumb, pathname: match.pathname };
      } catch (error) {
        console.error("Error rendering breadcrumb for", match.pathname, error);
        return null;
      }
    })
    .filter(
      (crumb): crumb is { breadcrumb: React.ReactNode; pathname: string } =>
        crumb !== null,
    );

  const currentMatch = matches[matches.length - 1];
  const isBlogPost =
    currentMatch?.pathname?.startsWith("/blog/") &&
    currentMatch.pathname !== "/blog";

  const hasBlogsBreadcrumb = routeBreadcrumbs.some(
    (crumb) => crumb.pathname === "/blog" || crumb.pathname === "/blogs",
  );

  const breadcrumbs = [...routeBreadcrumbs];

  if (isBlogPost && !hasBlogsBreadcrumb && breadcrumbs.length > 0) {
    breadcrumbs.splice(-1, 0, {
      breadcrumb: <Link to="/blog">blog</Link>,
      pathname: "/blog",
    });
  }

  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="transition-colors hover:text-foreground">
        home
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.pathname} className="flex items-center gap-2">
          <span className="select-none text-muted-foreground/40">/</span>
          <span
            className={
              index === breadcrumbs.length - 1
                ? "text-foreground"
                : "transition-colors hover:text-foreground"
            }
          >
            {crumb.breadcrumb}
          </span>
        </span>
      ))}
    </nav>
  );
}
