/** Augment with secrets / optional vars (use `.dev.vars` or `wrangler secret put`). */
declare namespace Cloudflare {
  interface Env {
    CLASH_ROYALE_API_TOKEN?: string;
    /** Google OAuth client (e.g. Photos `photoslibrary.readonly.appcreateddata`). */
    GOOGLE_OAUTH_CLIENT_ID?: string;
    GOOGLE_OAUTH_CLIENT_SECRET?: string;
    /** From one-time OAuth with offline access (e.g. Photos). */
    YOUTUBE_REFRESH_TOKEN?: string;
    /**
     * Log page: HTTPS JSON with `books`, `movies`, `blogs` arrays (see `public/log-content.json`).
     * e.g. `https://raw.githubusercontent.com/<user>/<repo>/main/public/log-content.json`
     * or a public Gist raw URL.
     */
    LOG_JSON_URL?: string;
    /** Library API album id from `albums.create`, or paste `https://photos.google.com/album/...` (token is extracted). */
    GOOGLE_PHOTOS_ALBUM_ID?: string;
    /** Optional; scope `photoslibrary.readonly.appcreateddata`. Else `YOUTUBE_REFRESH_TOKEN` if same client includes both scopes. */
    GOOGLE_PHOTOS_REFRESH_TOKEN?: string;
  }
}
