import { data } from "react-router";
import { fetchSharedAlbum } from "~/.server/gallery/shared-album";

/** GET → `{ title, count }` of my shared album; photos load via album-photo. */
export async function loader() {
  const album = await fetchSharedAlbum();
  return data(
    { title: album.title, count: album.photos.length },
    {
      headers: {
        "Cache-Control": album.photos.length
          ? "public, max-age=3600, s-maxage=3600"
          : "no-store",
      },
    },
  );
}
