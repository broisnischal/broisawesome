import { Outlet, useMatches } from "react-router";
// import { BlogSidebar } from "../components/blog-sidebar";
import { Breadcrumbs } from "../components/breadcrumbs";

export default function Page() {
  const matches = useMatches();
  const hideBreadcrumbs = matches.some(
    (m) => (m.handle as { hideBreadcrumbs?: boolean } | undefined)?.hideBreadcrumbs,
  );

  return (
    <main className="min-h-0 flex-1 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12">
        <div className="mb-6 min-h-10 min-w-0">
          {!hideBreadcrumbs && <Breadcrumbs />}
        </div>
        <Outlet />
      </div>
    </main>
  );
}
