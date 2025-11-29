import { Link } from "react-router";

export const handle = {
    breadcrumb: () => <Link to="/">Home</Link>,
};

export default function Page() {
    return (
        <div className="my-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Welcome
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
                This is the landing page of the portfolio.
            </p>
            <div className="grid gap-6 md:grid-cols-2 mt-12">
                <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
                    <h2 className="text-2xl font-semibold mb-3">About</h2>
                    <p className="text-muted-foreground">
                        Learn more about this portfolio and its features.
                    </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
                    <h2 className="text-2xl font-semibold mb-3">Projects</h2>
                    <p className="text-muted-foreground">
                        Explore the projects and work showcased here.
                    </p>
                </div>
                <Link to="/blog" className="text-primary ">
                    View Blogs</Link>


            </div>
        </div >
    )
}