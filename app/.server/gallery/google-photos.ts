/**
 * Google Photos Library API (post–March 2025): listing is limited to albums and
 * media created by this OAuth client. Use an app-created album and add your picks
 * in the Google Photos app, then set GOOGLE_PHOTOS_ALBUM_ID.
 * @see https://developers.google.com/photos/support/updates
 */

const PHOTOS_API = "https://photoslibrary.googleapis.com/v1";

export type GalleryPhoto = {
  id: string;
  thumbSrc: string;
  mimeType: string;
  productUrl: string;
  filename: string | null;
  creationTime: string | null;
};

export type GalleryData =
  | { ok: true; photos: GalleryPhoto[] }
  | { ok: false; message: string };

type PhotosEnv = {
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  /** Scope `photoslibrary.readonly.appcreateddata`. Falls back to YOUTUBE_REFRESH_TOKEN if unset (same client + combined consent). */
  GOOGLE_PHOTOS_REFRESH_TOKEN?: string;
  YOUTUBE_REFRESH_TOKEN?: string;
  /** Media from this album only (must be created by this Google Cloud OAuth client). */
  GOOGLE_PHOTOS_ALBUM_ID?: string;
};

type MediaItemRaw = {
  id?: string;
  baseUrl?: string;
  mimeType?: string;
  filename?: string;
  productUrl?: string;
  mediaMetadata?: {
    creationTime?: string;
    width?: string;
    height?: string;
    photo?: Record<string, unknown>;
    video?: { status?: string };
  };
};

async function refreshAccessToken(env: PhotosEnv): Promise<string | null> {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken =
    env.GOOGLE_PHOTOS_REFRESH_TOKEN?.trim() ??
    env.YOUTUBE_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

function mediaItemToPhoto(item: MediaItemRaw): GalleryPhoto | null {
  const id = item.id;
  const base = item.baseUrl;
  if (!id || !base) return null;
  const mime = item.mimeType ?? "image/jpeg";
  const isVideo = mime.startsWith("video/");
  if (isVideo) {
    const st = item.mediaMetadata?.video?.status;
    if (st && st !== "READY") return null;
  }
  /** Same-origin proxy adds Authorization; raw lh3 URLs often 403 in the browser. */
  const thumbSrc = `/resources/gallery-image?id=${encodeURIComponent(id)}`;
  return {
    id,
    thumbSrc,
    mimeType: mime,
    productUrl: item.productUrl ?? "https://photos.google.com/",
    filename: item.filename ?? null,
    creationTime: item.mediaMetadata?.creationTime ?? null,
  };
}

/**
 * Streams a resized preview for a media item (Library API: baseUrl + GET often needs Authorization).
 */
export async function galleryImageProxyResponse(
  env: PhotosEnv | undefined,
  mediaItemId: string,
): Promise<Response> {
  if (!env) {
    return new Response("Server configuration error", { status: 500 });
  }

  const accessToken = await refreshAccessToken(env);
  if (!accessToken) {
    return new Response("Could not authorize Google Photos", { status: 502 });
  }

  const metaRes = await fetch(
    `${PHOTOS_API}/mediaItems/${encodeURIComponent(mediaItemId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!metaRes.ok) {
    return new Response("Media item not available", {
      status: metaRes.status === 404 ? 404 : 502,
    });
  }

  const item = (await metaRes.json()) as MediaItemRaw;
  const base = item.baseUrl;
  if (!base) {
    return new Response("No image data yet", { status: 404 });
  }

  const mime = item.mimeType ?? "image/jpeg";
  const isVideo = mime.startsWith("video/");
  const thumbSuffix = isVideo ? "=w640-h480-c-no" : "=w800-h800-c";
  const imageUrl = `${base}${thumbSuffix}`;

  const withAuth = await fetch(imageUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(25_000),
  });

  const src = withAuth.ok
    ? withAuth
    : await fetch(imageUrl, { signal: AbortSignal.timeout(25_000) });

  if (!src.ok) {
    return new Response("Could not load image bytes", { status: 502 });
  }

  const ct = src.headers.get("Content-Type") ?? "image/jpeg";
  return new Response(src.body, {
    status: 200,
    headers: {
      "Content-Type": ct,
      "Cache-Control": "private, max-age=600",
    },
  });
}

const MAX_ITEMS = 120;

/** Raw Library API id, or a full `photos.google.com/album/...` / `.../lr/album/...` URL. */
export function normalizeGooglePhotosAlbumId(raw: string): string {
  const s = raw.trim();
  const fromUrl = s.match(
    /photos\.google\.com\/(?:lr\/)?album\/([^/?#]+)/i,
  )?.[1];
  if (fromUrl) return fromUrl;
  return s;
}

export async function loadGooglePhotosGallery(
  env: PhotosEnv | undefined,
): Promise<GalleryData> {
  if (!env) {
    return { ok: false, message: "Missing Cloudflare env." };
  }

  const rawAlbum = env.GOOGLE_PHOTOS_ALBUM_ID?.trim();
  const albumId = rawAlbum ? normalizeGooglePhotosAlbumId(rawAlbum) : "";
  if (!albumId) {
    return {
      ok: false,
      message:
        "Set GOOGLE_PHOTOS_ALBUM_ID to an album created by this Google Cloud project (Library API). After March 2025, only app-created albums can be listed; add photos to that album in Google Photos.",
    };
  }

  const accessToken = await refreshAccessToken(env);
  if (!accessToken) {
    return {
      ok: false,
      message:
        "Could not refresh Google access token. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and a refresh token with scope https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata (GOOGLE_PHOTOS_REFRESH_TOKEN or YOUTUBE_REFRESH_TOKEN if the same OAuth client was authorized with both scopes).",
    };
  }

  const photos: GalleryPhoto[] = [];
  let pageToken: string | undefined;

  while (photos.length < MAX_ITEMS) {
    const pageSize = Math.min(100, MAX_ITEMS - photos.length);
    const res = await fetch(`${PHOTOS_API}/mediaItems:search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        albumId,
        pageSize,
        ...(pageToken ? { pageToken } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (res.status === 403) {
      return {
        ok: false,
        message:
          "Google Photos returned 403. Use scope photoslibrary.readonly.appcreateddata and an album created by this OAuth client. You cannot list your whole library via the Library API anymore; see https://developers.google.com/photos/support/updates",
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        ok: false,
        message: `Google Photos API error (${res.status}). ${errText.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      mediaItems?: MediaItemRaw[];
      nextPageToken?: string;
    };

    for (const item of data.mediaItems ?? []) {
      const p = mediaItemToPhoto(item);
      if (p) photos.push(p);
    }

    pageToken = data.nextPageToken;
    if (!pageToken || !data.mediaItems?.length) break;
  }

  photos.sort((a, b) => {
    const ta = a.creationTime ?? "";
    const tb = b.creationTime ?? "";
    return tb.localeCompare(ta);
  });

  return { ok: true, photos };
}
