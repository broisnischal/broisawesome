import { Outlet } from "react-router";

// main layout
export default function Page() {
    return (
        <div className="p-20">
            <Sidebar/>
            <Outlet/>
            <Footer/>
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