const SPOTIFY_ACCOUNTS_API = "https://accounts.spotify.com/api/token";
const SPOTIFY_PLAYLIST_TRACKS_API = "https://api.spotify.com/v1/playlists";
const DEFAULT_SPOTIFY_PUBLIC_PLAYLIST_ID = "5yqw2hfJNIaaf0p6ocqBN7";

const ADDED_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type CachedSpotifyToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedSpotifyToken | null = null;

export type SpotifyRecentlyPlayedTrack = {
  id: string;
  song: string;
  artist: string;
  artistUrl?: string;
  album: string;
  albumUrl?: string;
  albumImageUrl?: string;
  trackUrl?: string;
  addedAtIso: string;
  addedAt: string;
};

export type SpotifyRecentlyPlayedResult = {
  tracks: SpotifyRecentlyPlayedTrack[];
  fromApi: boolean;
  playlistId: string;
  playlistUrl: string;
  error?: string;
};

type SpotifyTokenApiResponse = {
  access_token?: string;
  expires_in?: number;
};

type SpotifyPlaylistTracksApiResponse = {
  items?: Array<{
    added_at?: string;
    track?: {
      id?: string;
      name?: string;
      external_urls?: { spotify?: string };
      artists?: Array<{
        name?: string;
        external_urls?: { spotify?: string };
      }>;
      album?: {
        name?: string;
        external_urls?: { spotify?: string };
        images?: Array<{ url?: string; width?: number; height?: number }>;
      };
    };
  }>;
};

function readEnvValue(env: Cloudflare.Env | undefined, key: string) {
  const fromCloudflareRaw = (env as Record<string, unknown> | undefined)?.[key];
  const fromCloudflare =
    typeof fromCloudflareRaw === "string" ? fromCloudflareRaw.trim() : "";
  if (fromCloudflare) return fromCloudflare;

  const processEnv = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env;
  const fromProcess = processEnv?.[key]?.trim();
  if (fromProcess) return fromProcess;

  return "";
}

function parseApiErrorMessage(status: number, payload: string) {
  let message = `Spotify API ${status}`;
  try {
    const parsed = JSON.parse(payload) as {
      error?: string | { message?: string };
      error_description?: string;
    };
    if (typeof parsed.error === "string") {
      message = parsed.error_description
        ? `${parsed.error}: ${parsed.error_description}`
        : parsed.error;
    } else if (parsed.error?.message) {
      message = parsed.error.message;
    } else if (parsed.error_description) {
      message = parsed.error_description;
    }
  } catch {
    if (payload && payload.length < 200) message = payload;
  }
  return message;
}

function formatAddedDate(addedAtIso: string) {
  const date = new Date(addedAtIso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return ADDED_DATE_FORMAT.format(date);
}

function parsePlaylistId(raw: string): string | null {
  if (!raw) return null;

  if (/^[A-Za-z0-9]+$/.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const playlistIndex = parts.findIndex((part) => part === "playlist");
    if (playlistIndex >= 0) {
      const value = parts[playlistIndex + 1] ?? "";
      if (value && /^[A-Za-z0-9]+$/.test(value)) return value;
    }
  } catch {
    return null;
  }

  return null;
}

function resolvePlaylistId(env: Cloudflare.Env | undefined): string {
  const rawId = readEnvValue(env, "SPOTIFY_PUBLIC_PLAYLIST_ID");
  const rawUrl = readEnvValue(env, "SPOTIFY_PUBLIC_PLAYLIST_URL");
  return (
    parsePlaylistId(rawId) ??
    parsePlaylistId(rawUrl) ??
    DEFAULT_SPOTIFY_PUBLIC_PLAYLIST_ID
  );
}

async function getClientCredentialsAccessToken(
  env: Cloudflare.Env | undefined,
): Promise<{ accessToken?: string; error?: string }> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 30_000 > now) {
    return { accessToken: cachedToken.accessToken };
  }

  const clientId = readEnvValue(env, "SPOTIFY_CLIENT_ID");
  const clientSecret = readEnvValue(env, "SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return {
      error:
        "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET for Spotify public playlist fetch.",
    };
  }

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(SPOTIFY_ACCOUNTS_API, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    return { error: parseApiErrorMessage(response.status, raw) };
  }

  const parsed = JSON.parse(raw) as SpotifyTokenApiResponse;
  const accessToken =
    typeof parsed.access_token === "string" ? parsed.access_token : "";
  const expiresIn = typeof parsed.expires_in === "number" ? parsed.expires_in : 3600;

  if (!accessToken) {
    return { error: "Spotify token response is missing access_token." };
  }

  cachedToken = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };

  return { accessToken };
}

export async function fetchSpotifyRecentlyPlayed(
  env: Cloudflare.Env | undefined,
  options?: { limit?: number },
): Promise<SpotifyRecentlyPlayedResult> {
  const limit = Math.min(Math.max(options?.limit ?? 40, 1), 100);
  const playlistId = resolvePlaylistId(env);
  const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;

  try {
    const token = await getClientCredentialsAccessToken(env);
    if (!token.accessToken) {
      return {
        tracks: [],
        fromApi: false,
        playlistId,
        playlistUrl,
        error: token.error,
      };
    }

    const url = `${SPOTIFY_PLAYLIST_TRACKS_API}/${playlistId}/tracks?limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    const raw = await res.text();
    if (!res.ok) {
      return {
        tracks: [],
        fromApi: true,
        playlistId,
        playlistUrl,
        error: parseApiErrorMessage(res.status, raw),
      };
    }

    const parsed = JSON.parse(raw) as SpotifyPlaylistTracksApiResponse;
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const tracks: SpotifyRecentlyPlayedTrack[] = items.flatMap((item, index) => {
      const track = item.track;
      const addedAtIso = item.added_at;
      if (!track?.name || !addedAtIso) return [];

      const artists = Array.isArray(track.artists) ? track.artists : [];
      const artistNames = artists
        .map((artist) => artist.name?.trim() ?? "")
        .filter(Boolean);

      const primaryArtist = artists.find(
        (artist) =>
          typeof artist.name === "string" &&
          artist.name.trim().length > 0 &&
          typeof artist.external_urls?.spotify === "string",
      );

      const albumName = track.album?.name?.trim() || "Unknown album";
      const images = Array.isArray(track.album?.images) ? track.album.images : [];
      const albumImageUrl = images.find((img) => typeof img.url === "string")?.url;

      return [
        {
          id: `${track.id ?? track.name}-${addedAtIso}-${index}`,
          song: track.name,
          artist: artistNames.join(", ") || "Unknown artist",
          artistUrl: primaryArtist?.external_urls?.spotify,
          album: albumName,
          albumUrl: track.album?.external_urls?.spotify,
          albumImageUrl,
          trackUrl: track.external_urls?.spotify,
          addedAtIso,
          addedAt: formatAddedDate(addedAtIso),
        },
      ];
    });

    return {
      tracks,
      fromApi: true,
      playlistId,
      playlistUrl,
    };
  } catch (error) {
    return {
      tracks: [],
      fromApi: false,
      playlistId,
      playlistUrl,
      error: error instanceof Error ? error.message : "Spotify request failed",
    };
  }
}
