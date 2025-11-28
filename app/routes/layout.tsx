import { Outlet } from "react-router";


// main layout
export default function Page() {
    return (
        <div className="p-20">
            <h1>Testing</h1>
            <Outlet/>
        </div>
    ) 
}