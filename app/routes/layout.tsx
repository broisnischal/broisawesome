import { Outlet, useLocation } from "react-router";
// import { BlogSidebar } from "../components/blog-sidebar";
import { Breadcrumbs } from "../components/breadcrumbs";
import { Screensaver } from "../components/screensaver";

export default function Page() {
  const location = useLocation();

  // Check if current route is blog or notes
  const isBlogRoute = location.pathname.startsWith("/blog");
  const isNotesRoute = location.pathname === "/notes";

  // Enable screensaver only if NOT on blog or notes routes
  const screensaverEnabled = !isBlogRoute && !isNotesRoute;

  return (
    <main className={`flex-1`}>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 p-4 md:p-6 lg:p-8 xl:p-12 max-w-5xl w-full mx-auto">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>
      {/* <Footer /> */}
      <Screensaver enabled={screensaverEnabled} />
    </main>
  );
}
