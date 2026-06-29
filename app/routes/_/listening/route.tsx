import { Link } from "react-router";
import { fetchSpotifyRecentlyPlayed } from "~/.server/spotify-recently-played";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/listening">listening</Link>,
};

const LISTENING_DESCRIPTION =
  "Tracks from my public Spotify playlist — what Nischal Dahal (broisnischal) is listening to.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Listening",
    description: LISTENING_DESCRIPTION,
    path: "/listening",
    keywords: ["spotify", "playlist", "music", "listening", "Nischal Dahal"],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Listening — Nischal Dahal",
      description: LISTENING_DESCRIPTION,
      path: "/listening",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Listening", path: "/listening" },
      ],
      type: "CollectionPage",
    }),
  ];
};

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
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Listening</h1>

      <p className="mt-2 text-muted-foreground">
        source:{" "}
        <a
          href={playlistUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="term-link"
        >
          public Spotify playlist
        </a>
      </p>

      <Squiggle />

      {error ? (
        <p className="text-destructive">{error}</p>
      ) : tracks.length === 0 ? (
        <p className="text-muted-foreground">no playlist tracks found</p>
      ) : (
        <>
          <SectionLabel>Tracks ({tracks.length}):</SectionLabel>
          <MdList>
            {tracks.map((track) => (
              <MdListItem key={track.id}>
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {track.trackUrl ? (
                    <a
                      href={track.trackUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="term-link"
                    >
                      {track.song}
                    </a>
                  ) : (
                    <span className="text-foreground">{track.song}</span>
                  )}
                  <span className="text-muted-foreground/60">—</span>
                  {track.artistUrl ? (
                    <a
                      href={track.artistUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="term-link"
                    >
                      {track.artist}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{track.artist}</span>
                  )}
                  <span className="text-muted-foreground/50 text-xs">
                    <time dateTime={track.addedAtIso}>{track.addedAt}</time>
                  </span>
                </span>
              </MdListItem>
            ))}
          </MdList>
        </>
      )}
    </div>
  );
}
