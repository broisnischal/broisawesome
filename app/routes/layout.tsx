import { Outlet } from "react-router";
// import { BlogSidebar } from "../components/blog-sidebar";
import { Breadcrumbs } from "../components/breadcrumbs";

export default function Page() {
  return (
    <main className={`flex-1`}>
      <div className="min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 xl:p-12 max-w-3xl mx-auto">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>
    </main>
  );
}
