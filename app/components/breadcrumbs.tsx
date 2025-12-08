import { useMatches, Link, useRouteLoaderData } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { ThemeSwitch } from "~/routes/resources/theme-switch";
import type { loader as rootLoader } from "~/root";

export function Breadcrumbs() {
  const matches = useMatches();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const userPreference = rootData?.requestInfo.userPrefs.theme ?? null;

  // Get breadcrumbs from route matches
  const routeBreadcrumbs = matches
    .filter((match) => match.handle && (match.handle as any).breadcrumb)
    .map((match) => {
      try {
        const breadcrumb = (match.handle as any).breadcrumb(match);
        return {
          breadcrumb,
          pathname: match.pathname,
        };
      } catch (error) {
        console.error("Error rendering breadcrumb for", match.pathname, error);
        return null;
      }
    })
    .filter(
      (crumb): crumb is { breadcrumb: React.ReactNode; pathname: string } =>
        crumb !== null,
    );

  // Check if we're on a blog post page
  const currentMatch = matches[matches.length - 1];
  const isBlogPost =
    currentMatch?.pathname?.startsWith("/blog/") &&
    currentMatch.pathname !== "/blog";

  // Check if "Blogs" breadcrumb is already present
  const hasBlogsBreadcrumb = routeBreadcrumbs.some(
    (crumb) => crumb.pathname === "/blog" || crumb.pathname === "/blogs",
  );

  // Build final breadcrumbs array
  const breadcrumbs = [...routeBreadcrumbs];

  // If we're on a blog post but don't have "Blogs" breadcrumb, insert it before the last breadcrumb
  if (isBlogPost && !hasBlogsBreadcrumb && breadcrumbs.length > 0) {
    breadcrumbs.splice(-1, 0, {
      breadcrumb: <Link to="/blog">Blogs</Link>,
      pathname: "/blog",
    });
  }

  return (
    <nav
      className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home size={16} />
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.pathname} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-muted-foreground" />
          <span
            className={
              index === breadcrumbs.length - 1
                ? "text-foreground font-medium"
                : ""
            }
          >
            {crumb.breadcrumb}
          </span>
        </div>
      ))}
      {/* <div className="ml-auto">
        <ThemeSwitch userPreference={userPreference} />
      </div> */}
    </nav>
  );
}
