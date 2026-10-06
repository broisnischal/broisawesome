import { Link, useLocation, useMatches } from "react-router";
import { ContributionGraph } from "~/components/contribution-graph";
import { cn } from "~/lib/utils";

const NAV = [
  { to: "/blog", label: "blog", match: ["/blog", "/writing"] },
  { to: "/activity", label: "activity", match: ["/activity"] },
  // { to: "/use", label: "uses", match: ["/use"] }, // uses page is off for now
  { to: "/chess", label: "chess", match: ["/chess"] },
  { to: "/links", label: "links", match: ["/links"] },
] as const;

type Crumb = { node: React.ReactNode; pathname: string };

/** Route breadcrumbs (`handle.breadcrumb`), plus `blog` above a single post. */
function useTrail(): Crumb[] {
  const matches = useMatches();
  if (
    matches.some(
      (m) => (m.handle as { hideBreadcrumbs?: boolean })?.hideBreadcrumbs,
    )
  )
    return [];
  const crumbs: Crumb[] = matches
    .filter(
      (m) => (m.handle as { breadcrumb?: unknown } | undefined)?.breadcrumb,
    )
    .map((m) => ({
      node: (
        m.handle as { breadcrumb: (m: unknown) => React.ReactNode }
      ).breadcrumb(m),
      pathname: m.pathname,
    }));
  const last = matches[matches.length - 1]?.pathname ?? "";
  if (
    last.startsWith("/blog/") &&
    !crumbs.some((c) => c.pathname === "/blog")
  ) {
    crumbs.splice(-1, 0, {
      node: <Link to="/blog">blog</Link>,
      pathname: "/blog",
    });
  }
  return crumbs;
}

/**
 * The top band: the path you're on (`~/nischal / blog / post`) on the leading
 * edge, primary pages as grid cells on the trailing edge. Stacks into two
 * rows on phones, with the nav as four equal cells.
 */
export function SiteHeader() {
  const { pathname } = useLocation();
  const trail = useTrail();

  const navItems = NAV.map((item, i) => ({
    ...item,
    n: String(i + 1).padStart(2, "0"),
    current: item.match.some(
      (m) => pathname === m || pathname.startsWith(`${m}/`),
    ),
  }));

  const breadcrumb = (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-wrap items-center gap-x-2"
    >
      <Link
        to="/"
        aria-current={pathname === "/" ? "page" : undefined}
        className="font-medium text-bright transition-colors hover:text-term-link"
      >
        <span className="select-none text-faint" aria-hidden>
          ~/
        </span>
        nischal
      </Link>
      {trail.map((c, i) => (
        <span
          key={c.pathname}
          className={cn(
            "flex items-center gap-x-2",
            i === trail.length - 1
              ? "text-foreground"
              : "text-muted-foreground transition-colors hover:text-foreground",
          )}
        >
          <span className="select-none text-faint" aria-hidden>
            /
          </span>
          {c.node}
        </span>
      ))}
    </nav>
  );

  return (
    // Desktop: the first cell holds the path and the four pages as a small
    // 2x2 grid; columns two and three hold my contribution graph. Below lg it
    // folds to the path row plus four equal nav cells.
    <header className="grid grid-cols-1 gap-px border-b border-border bg-border text-sm lg:grid-cols-3">
      <div
        data-tile
        className="flex min-h-14 flex-col justify-center gap-4 bg-background px-5 md:px-8 lg:h-(--row) lg:justify-between lg:py-6"
      >
        {breadcrumb}
        {/* Same treatment as the footer's Explore list. */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={item.current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-6 items-center transition-colors",
                    item.current
                      ? "text-bright"
                      : "text-muted-foreground hover:text-bright",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        data-tile
        className="hidden bg-background lg:col-span-2 lg:block lg:h-(--row)"
      >
        <ContributionGraph />
      </div>

      <nav aria-label="Primary" className="lg:hidden">
        <ul className="grid grid-cols-4 gap-px">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                data-tile
                to={item.to}
                aria-current={item.current ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-14 items-center justify-center px-3 transition-colors",
                  item.current
                    ? "bg-muted text-bright"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-bright",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
