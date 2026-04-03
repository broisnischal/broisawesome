import { Link } from "react-router";
import { fetchSpotifyRecentlyPlayed } from "~/.server/spotify-recently-played";
import { createHeaders, createMetaTags } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/listening">Listening</Link>,
};

export const meta: Route.MetaFunction = () =>
  createMetaTags({
    title: "Listening",
    description: "Tracks from my public Spotify playlist.",
    path: "/listening",
    keywords: ["spotify", "playlist", "music", "listening"],
  });

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  return fetchSpotifyRecentlyPlayed(env, { limit: 50 });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { tracks, error, playlistUrl } = loaderData;

  return (
    <div className="-mx-4 font-sans md:-mx-6 lg:-mx-8 xl:-mx-12">
      <header className="mb-6 px-4 md:px-6 lg:px-8 xl:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Spotify
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          Listening
        </h1>
      </header>

      <p className="mb-4 px-4 text-base text-muted-foreground md:px-6 lg:px-8 xl:px-12">
        Source:{" "}
        <a
          href={playlistUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-4 hover:text-foreground"
        >
          public Spotify playlist
        </a>
      </p>

      {error ? (
        <p className="px-4 text-base text-destructive md:px-6 lg:px-8 xl:px-12">
          {error}
        </p>
      ) : null}

      {tracks.length === 0 && !error ? (
        <p className="px-4 text-base text-muted-foreground md:px-6 lg:px-8 xl:px-12">
          No playlist tracks found.
        </p>
      ) : (
        <div className="overflow-x-auto border-y border-border/60">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium md:px-6 lg:px-8 xl:px-12">
                  Song
                </th>
                <th className="py-2 pr-4 text-left font-medium md:pr-6 lg:pr-8">
                  Artist
                </th>
                <th className="hidden py-2 pr-4 text-left font-medium md:table-cell md:pr-6 lg:pr-8">
                  Album
                </th>
                <th className="py-2 pr-4 text-right font-medium md:pr-6 lg:pr-8">
                  Added
                </th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr
                  key={track.id}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <td className="min-w-[280px] px-4 py-2.5 pr-4 md:px-6 lg:px-8 xl:px-12">
                    <div className="flex min-w-0 items-center gap-3">
                      {track.albumImageUrl ? (
                        <img
                          src={track.albumImageUrl}
                          alt=""
                          width={36}
                          height={36}
                          loading="lazy"
                          decoding="async"
                          className="size-9 shrink-0 rounded-sm border border-border/40 object-cover"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-muted text-xs text-muted-foreground">
                          {track.song.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        {track.trackUrl ? (
                          <a
                            href={track.trackUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="block truncate text-foreground hover:underline underline-offset-4"
                          >
                            {track.song}
                          </a>
                        ) : (
                          <span className="block truncate text-foreground">
                            {track.song}
                          </span>
                        )}

                        <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">
                          {track.album}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[180px] py-2.5 pr-4 text-muted-foreground md:pr-6 lg:pr-8">
                    {track.artistUrl ? (
                      <a
                        href={track.artistUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block truncate hover:text-foreground hover:underline underline-offset-4"
                      >
                        {track.artist}
                      </a>
                    ) : (
                      <span className="block truncate">{track.artist}</span>
                    )}
                  </td>

                  <td className="hidden min-w-[220px] py-2.5 pr-4 text-muted-foreground md:table-cell md:pr-6 lg:pr-8">
                    {track.albumUrl ? (
                      <a
                        href={track.albumUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block truncate hover:text-foreground hover:underline underline-offset-4"
                      >
                        {track.album}
                      </a>
                    ) : (
                      <span className="block truncate">{track.album}</span>
                    )}
                  </td>

                  <td className="min-w-[130px] whitespace-nowrap py-2.5 pr-4 text-right text-muted-foreground md:pr-6 lg:pr-8">
                    <time dateTime={track.addedAtIso}>{track.addedAt}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
