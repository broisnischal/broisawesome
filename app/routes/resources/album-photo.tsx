import { fetchSharedAlbum } from "~/.server/gallery/shared-album";
import { sizedPhoto } from "~/lib/gallery";
import type { Route } from "./+types/album-photo";

/**
 * GET /resources/album-photo?i=3 → that photo from my shared album, served
 * from this origin so a canvas (the dither effect) can read its pixels.
 * Only indexes into my own album: not an open proxy.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const i = Number(new URL(request.url).searchParams.get("i"));
  const album = await fetchSharedAlbum();
  if (!Number.isInteger(i) || i < 0 || i >= album.photos.length) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(sizedPhoto(album.photos[i], 640, 480));
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
