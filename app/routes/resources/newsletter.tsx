import { data } from "react-router";
import type { Route } from "./+types/newsletter";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const email = formData.get("email");

    if (!email || typeof email !== "string" || !email.includes("@")) {
        return data(
            { success: false, message: "Please enter a valid email address." },
            { status: 400 }
        );
    }

    // TODO: Integrate with your newsletter service (e.g., Mailchimp, ConvertKit, etc.)
    // For now, just return success
    console.log("Newsletter subscription:", email);

    return data({
        success: true,
        message: "Thank you for subscribing! Check your email to confirm.",
    });
}

