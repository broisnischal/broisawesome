/** My public Google Photos album (shared link). */
export const SHARED_ALBUM_URL = "https://photos.app.goo.gl/2RHWh9PyAGyRCZAP9";

export type SharedAlbum = { title?: string; photos: string[] };

/** What the client gets: photos are fetched one at a time by index. */
export type SharedAlbumSummary = { title?: string; count: number };

/** Google Photos image URLs take a size suffix; `-c` crops to fill. */
export function sizedPhoto(url: string, w: number, h: number) {
  return `${url}=w${w}-h${h}-c`;
}
