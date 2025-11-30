import { Link, data } from "react-router";
import type { Route } from "./+types/route";
import { createMetaTags, createHeaders, createPersonSchema, createSchemaMetaTag } from "~/lib/meta";

export const handle = {
    breadcrumb: () => <Link to="/about">About</Link>,
};

export const meta: Route.MetaFunction = () => {
    const metaTags = createMetaTags({
        title: "About",
        description: "About Nischal Dahal - Software developer passionate about technology, serverless architecture, and building great user experiences. Learn more about my journey.",
        path: "/about",
        keywords: ["Nischal Dahal", "Nischal", "broisnischal", "about", "software developer", "developer profile"],
    });

    // Add Person schema
    const schema = createPersonSchema({
        description: "Software developer passionate about technology, serverless architecture, and building great user experiences.",
    });

    return [...metaTags, createSchemaMetaTag(schema)];
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
                    About Nischal Dahal
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

