import type { Route } from "./+types/l.$code";
import { redirect } from "react-router";

// can be extended for database later
const LINKS: Record<string, string> = {
    github: "https://github.com/broisnischal",
    linkedin: "https://linkedin.com/in/broisnischal",
    twitter: "https://twitter.com/broisnees",
    discord: "https://discord.com/users/broisnees",
    youtube: "https://youtube.com/@broisnees",
};

export async function loader({ params, request }: Route.LoaderArgs) {
    const { code } = params;

    if (!code) {
        throw new Response("Link code is required", { status: 400 });
    }

    const url = LINKS[code.toLowerCase()];

    if (!url) {
        throw new Response("Link not found", { status: 404 });
    }

    // Add UTM parameters for analytics tracking
    const targetUrl = new URL(url);
    targetUrl.searchParams.set("utm_source", "portfolio");
    targetUrl.searchParams.set("utm_medium", "referral");
    targetUrl.searchParams.set("utm_campaign", `link_${code.toLowerCase()}`);

    // Optional: Add referrer information
    const referrer = request.headers.get("referer") || request.url;
    if (referrer) {
        try {
            const referrerUrl = new URL(referrer);
            targetUrl.searchParams.set("ref", referrerUrl.hostname);
        } catch {
            // Ignore invalid referrer URLs
        }
    }

    return redirect(targetUrl.toString(), { status: 301 });
}

