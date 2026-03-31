import { Outlet, useMatches } from "react-router";
// import { BlogSidebar } from "../components/blog-sidebar";
import { Breadcrumbs } from "../components/breadcrumbs";
import { SiteWritingToggle } from "../components/site-writing-toggle";

export default function Page() {
  const matches = useMatches();
  const hideBreadcrumbs = matches.some(
    (m) => (m.handle as { hideBreadcrumbs?: boolean } | undefined)?.hideBreadcrumbs,
  );

  return (
    <main className="min-h-0 flex-1">
      <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-8 xl:p-12">
        {/* Grid + min-height keeps the top bar stable when breadcrumbs mount/unmount (Writing). */}
        <div className="mb-6 grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
          <div className="min-w-0">
            {!hideBreadcrumbs && <Breadcrumbs />}
          </div>
          <SiteWritingToggle />
        </div>
        <Outlet />
      </div>
    </main>
  );
}
