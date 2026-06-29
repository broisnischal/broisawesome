import { Outlet, useMatches } from "react-router";
import { Breadcrumbs } from "../components/breadcrumbs";

export default function Page() {
  const matches = useMatches();
  const hideBreadcrumbs = matches.some(
    (m) =>
      (m.handle as { hideBreadcrumbs?: boolean } | undefined)?.hideBreadcrumbs,
  );

  return (
    <main className="min-h-0 flex-1 font-mono">
      <div className="max-w-none px-5 py-14 md:px-10 md:py-16">
        <div className="mb-8 min-h-6 min-w-0">
          {!hideBreadcrumbs && <Breadcrumbs />}
        </div>
        <Outlet />
      </div>
    </main>
  );
}
