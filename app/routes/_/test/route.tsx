import type { Route } from "./+types/route";
import { createMetaTags, createHeaders } from "~/lib/meta";

export const meta: Route.MetaFunction = () => {
    return createMetaTags({
        title: "Test",
        description: "Test page for Nischal Dahal's portfolio.",
        path: "/test",
        keywords: ["test", "Nischal Dahal"],
    });
};

export function headers() {
    return createHeaders();
}

export default function Page() {
    return (
        <div>
            <h2>COol Testing</h2>
        </div>
    )
}