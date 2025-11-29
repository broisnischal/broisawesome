import { Link } from "react-router";

export default function Page() {
    return (
        <div className="flex flex-col space-y-4 ">
            <h1 className="text-4xl font-bold text-destructive">404</h1>
            < p className="text-lg text-muted-foreground" > Page not found</p >
            <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
            <Link to="/" className="text-primary hover:text-primary/80 transition-colors">Go back to the home page</Link>
        </div >
    );
}