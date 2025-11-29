import { Link, useLocation } from "react-router";
import { Home, BookOpen, User, Briefcase } from "lucide-react";
import { ThemeSwitch } from "../routes/resources/theme-switch";
import type { loader as rootLoader } from "../root";
import { useRouteLoaderData } from "react-router";

const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/blogs", label: "Blogs", icon: BookOpen },
    // Add more navigation items as needed
    // { to: "/about", label: "About", icon: User },
    // { to: "/projects", label: "Projects", icon: Briefcase },
];
export function Sidebar() {
    const location = useLocation();
    const rootData = useRouteLoaderData<typeof rootLoader>("root");
    const userPreference = rootData?.requestInfo.userPrefs.theme ?? null;
    const isBlogRoute = location.pathname.startsWith("/blogs");

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/95 backdrop-blur-sm text-card-foreground hidden md:flex flex-col z-40 shadow-lg">
            <div className="p-6 border-b border-border bg-linear-to-b from-card to-card/50">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
                    <span>Portfolio</span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to ||
                            (item.to === "/blogs" && isBlogRoute);

                        return (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent hover:text-accent-foreground text-foreground"
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeSwitch userPreference={userPreference} />
                </div>
            </div>
        </aside>
    );
}

