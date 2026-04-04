import { ImageIcon } from "lucide-react";
import { Link, data } from "react-router";
import type { GalleryPhoto } from "~/.server/gallery/google-photos";
import { loadGooglePhotosGallery } from "~/.server/gallery/google-photos";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { createHeaders, createMetaTags } from "~/lib/meta";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/gallery">Gallery</Link>,
};

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Gallery",
    description:
      "Photo gallery from Google Photos — moments and shots I share on my portfolio.",
    path: "/gallery",
    keywords: [
      "gallery",
      "photography",
      "Google Photos",
      "Nischal Dahal",
      "portfolio",
    ],
  });
};

export function headers() {
  return createHeaders();
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const gallery = await loadGooglePhotosGallery(env);
  return data({ gallery });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { gallery } = loaderData;

  return (
    <div className="w-full font-sans">
      <header className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Gallery
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Loaded with the Photos Library API from{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            GOOGLE_PHOTOS_ALBUM_ID
          </code>
          . Only{" "}
          <a
            className="underline underline-offset-2"
            href="https://developers.google.com/photos/library/reference/rest/v1/mediaItems/search"
            target="_blank"
            rel="noopener noreferrer"
          >
            app-created
          </a>{" "}
          media appears (
          <a
            className="underline underline-offset-2"
            href="https://developers.google.com/photos/support/updates"
            target="_blank"
            rel="noopener noreferrer"
          >
            API policy
          </a>
          )—upload through your Google Cloud project if the album looks full
          in the Photos app but stays empty here.
        </p>
      </header>

      {!gallery.ok ? (
        <Empty className="border border-dashed border-border rounded-lg py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Gallery unavailable</EmptyTitle>
            <EmptyDescription className="max-w-lg text-pretty">
              {gallery.message}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : gallery.photos.length === 0 ? (
        <Empty className="border border-dashed border-border rounded-lg py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No photos from the API</EmptyTitle>
            <EmptyDescription className="max-w-lg text-pretty">
              The search returned no app-created items for this album. Use the
              album id from{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
                albums.create
              </code>{" "}
              if a browser-only album id does not match the API, and ensure
              media was created with the Library API (including upload) for
              this OAuth client.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul
          className={cn(
            "grid gap-2 sm:gap-3",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
          )}
        >
          {gallery.photos.map((photo) => (
            <GalleryTile key={photo.id} photo={photo} />
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryTile({ photo }: { photo: GalleryPhoto }) {
  return (
    <li className="aspect-square min-w-0">
      <a
        href={photo.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group block size-full overflow-hidden rounded-md border border-border bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <img
          src={photo.thumbSrc}
          alt={photo.filename ?? "Gallery photo"}
          width={640}
          height={640}
          loading="lazy"
          decoding="async"
          className={cn(
            "size-full object-cover transition-transform duration-300",
            "group-hover:scale-[1.03]",
          )}
        />
      </a>
    </li>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full font-sans">
      <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
      <p className="text-destructive">{error.message}</p>
    </div>
  );
}
