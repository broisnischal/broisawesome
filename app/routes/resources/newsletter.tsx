import { data } from "react-router";

import { saveNewsletterEmail } from "~/.server/newsletter-kv";
import { createHeaders, createMetaTags } from "~/lib/meta";
import type { Route } from "./+types/newsletter";

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Newsletter",
    description:
      "Subscribe to Nischal Dahal's newsletter for updates on software development, web technologies, and latest blog posts.",
    path: "/resources/newsletter",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "newsletter",
      "subscribe",
      "updates",
    ],
  });
};

export function headers() {
  return createHeaders();
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return data(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return data(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const kv = context.cloudflare?.env.NEWSLETTER_KV;
  const saved = await saveNewsletterEmail(kv, trimmed);
  if (!saved.ok) {
    return data(
      {
        success: false,
        message: "Something went wrong. Please try again in a moment.",
      },
      { status: 500 },
    );
  }

  return data({
    success: true,
    message: "Thanks — you're on the list.",
  });
}
