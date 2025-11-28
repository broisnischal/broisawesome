import  { Outlet } from "react-router";

export default function BlogLayout() {
    return (
        <div>
            <h1>Blogs</h1>
            <Outlet/>
        </div>
    )
} 