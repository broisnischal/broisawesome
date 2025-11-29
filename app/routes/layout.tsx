import { Outlet, useLocation } from "react-router";
import { Sidebar } from "../components/sidebar";
// import { BlogSidebar } from "../components/blog-sidebar";
import { Breadcrumbs } from "../components/breadcrumbs";
import { Footer } from "../components/footer";

export default function Page() {
    const location = useLocation();
    const isBlogRoute = location.pathname.startsWith("/blogs");

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            {/* {isBlogRoute && <BlogSidebar />} */}
            <main className={`flex-1 transition-all duration-200 ${isBlogRoute
                ? "ml-0 md:ml-64 lg:ml-[calc(16rem+20rem)]"
                : "ml-0 md:ml-64"
                }`}>
                <div className="min-h-screen flex flex-col bg-background">
                    <div className="flex-1 p-4 md:p-6 lg:p-8 xl:p-12 max-w-7xl w-full mx-auto">
                        {!isBlogRoute && <Breadcrumbs />}
                        {/* <Breadcrumbs /> */}
                        <Outlet />
                    </div>
                    {/* <Footer /> */}
                </div>
            </main>
        </div>
    );
}