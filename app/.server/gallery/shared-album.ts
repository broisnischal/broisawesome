import { withConditionalMemoryCache } from "~/.server/memory-cache";
import { SHARED_ALBUM_URL, type SharedAlbum } from "~/lib/gallery";

const HOUR = 60 * 60 * 1000;

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Reads the public share page of my album and pulls out its photo URLs. No
 * API key: the share page lists every photo as an lh3 `/pw/` URL. Cached for
 * an hour; a failed read is not cached, so the next hover retries.
 */
export function fetchSharedAlbum(): Promise<SharedAlbum> {
  return withConditionalMemoryCache(
    "shared-album",
    HOUR,
    async () => {
      try {
        const res = await fetch(SHARED_ALBUM_URL, {
          headers: { "User-Agent": "Mozilla/5.0 (nischal-dahal.com.np)" },
          redirect: "follow",
        });
        if (!res.ok) return { photos: [] };
        const html = await res.text();
        const title = html.match(
          /<meta property="og:title" content="([^"]+)"/,
        )?.[1];
        const photos = [
          ...new Set(
            html.match(/https:\/\/lh3\.googleusercontent\.com\/pw\/[\w-]+/g) ??
              [],
          ),
        ];
        return { title: title ? decodeEntities(title) : undefined, photos };
      } catch {
        return { photos: [] };
      }
    },
    (album) => album.photos.length > 0,
  );
}
