import { Link, data } from "react-router";
import type { Route } from "./+types/route";
import { createMetaTags, createHeaders } from "~/lib/meta";

export const handle = {
    breadcrumb: () => <Link to="/about">About</Link>,
};

export const meta: Route.MetaFunction = () => {
    return createMetaTags({
        title: "About",
        description: "Learn more about Nischal Dahal - a software developer passionate about technology, serverless architecture, and building great user experiences.",
        path: "/about",
        keywords: ["Nischal Dahal", "about", "software developer", "developer profile", "broisnischal"],
    });
};

export function headers() {
    return createHeaders();
}

export async function loader({ request }: Route.LoaderArgs) {
    return data({});
}

export default function Page({ loaderData }: Route.ComponentProps) {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    About
                </h1>
                <p className="text-muted-foreground">
                    Learn more about me and my journey.
                </p>

                <p>
                    I am writing...
                </p>

            </div>
        </div>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
            <p className="text-destructive">{error.message}</p>
        </div>
    );
}

