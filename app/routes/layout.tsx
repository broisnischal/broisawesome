import { Outlet } from "react-router";
// import { BlogSidebar } from "../components/blog-sidebar";
import { Breadcrumbs } from "../components/breadcrumbs";

export default function Page() {
  return (
    <main className="min-h-0 flex-1">
      <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-8 xl:p-12">
        <Breadcrumbs />
        <Outlet />
      </div>
    </main>
  );
}
