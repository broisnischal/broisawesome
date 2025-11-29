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
        .map((match) => ({
            breadcrumb: (match.handle as any).breadcrumb(match),
            pathname: match.pathname,
        }));

    // Check if we're on a blog post page
    const currentPath = matches[matches.length - 1]?.pathname || '';
    const isBlogPost = currentPath.startsWith('/blog/') && currentPath !== '/blog';

    // Check if "Blogs" breadcrumb already exists
    const hasBlogsBreadcrumb = routeBreadcrumbs.some(
        crumb => crumb.pathname === '/blog' || crumb.pathname.startsWith('/blog/')
    );

    // Build final breadcrumbs array
    const breadcrumbs = [...routeBreadcrumbs];

    // If we're on a blog post but don't have "Blogs" breadcrumb, add it
    if (isBlogPost && !hasBlogsBreadcrumb) {
        // Insert "Blogs" breadcrumb before the blog post breadcrumb
        breadcrumbs.splice(-1, 0, {
            breadcrumb: <Link to="/blog">Blogs</Link>,
            pathname: '/blog',
        });
    }

    return (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link
                to="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
                <Home size={16} />
            </Link>
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.pathname} className="flex items-center gap-2">
                    <ChevronRight size={16} className="text-muted-foreground" />
                    <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                        {crumb.breadcrumb}
                    </span>
                </div>
            ))}
            <div className="ml-auto">
                <ThemeSwitch
                    userPreference={userPreference}
                />
            </div>
        </nav>
    );
}

