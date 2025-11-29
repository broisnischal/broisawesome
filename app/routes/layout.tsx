import { Outlet } from "react-router";
import { ThemeSwitch } from "./resources/theme-switch";

// main layout
export default function Page() {
    return (
        <div className="p-20">
            <Sidebar />
            <ThemeSwitch />
            <Outlet />
            <Footer />
        </div>
    )
}

function Sidebar() {
    return (
        <div>
            <h1>Navbar</h1>
        </div>
    )
}

function Footer() {
    return (
        <div>
            <h1>Footer</h1>
        </div>
    )
}