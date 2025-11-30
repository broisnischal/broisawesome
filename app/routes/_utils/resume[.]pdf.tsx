import type { Route } from "./+types/resume[.]pdf";
import resumeUrl from "~/assets/pdf/resume.pdf";
import { http } from "~/lib/http-client";

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const url = new URL(request.url);

        // In Vite, asset imports return a URL path (e.g., "/assets/resume-abc123.pdf")
        // We need to construct the full URL to fetch it
        let assetUrl: string;

        if (typeof resumeUrl === 'string') {
            if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
                assetUrl = resumeUrl;
            } else if (resumeUrl.startsWith('/')) {
                assetUrl = `${url.origin}${resumeUrl}`;
            } else {
                assetUrl = `${url.origin}/${resumeUrl}`;
            }
        } else {
            throw new Error("Resume URL is not a string");
        }

        // Fetch the asset using cached HTTP client (with retry and deduplication)
        const response = await http.get(assetUrl, {
            responseType: 'arraybuffer',
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Response(
                `Failed to load resume: ${response.status} ${response.statusText}`,
                { status: response.status || 500 }
            );
        }

        const pdfBuffer = response.data as ArrayBuffer;

        // Verify we got actual PDF content
        if (pdfBuffer.byteLength === 0) {
            throw new Response("Resume file is empty", { status: 500 });
        }

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'inline; filename="resume.pdf"',
            },
        });
    } catch (error) {
        // If it's already a Response, re-throw it
        if (error instanceof Response) {
            throw error;
        }

        console.error("Error loading resume PDF:", error);
        throw new Response(
            `Failed to load resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { status: 500 }
        );
    }
}

export async function headers() {
    return {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    } as HeadersInit;
} 