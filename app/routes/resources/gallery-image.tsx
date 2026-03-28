import { galleryImageProxyResponse } from "~/.server/gallery/google-photos";
import type { Route } from "./+types/gallery-image";

/**
 * Streams a Google Photos thumbnail with OAuth (see `mediaItemToPhoto` thumbSrc).
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }
  return galleryImageProxyResponse(context.cloudflare?.env, id);
}

export default function GalleryImageResource() {
  return null;
}
