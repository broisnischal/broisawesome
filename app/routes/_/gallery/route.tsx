import { Link, data } from "react-router";
import type { GalleryPhoto } from "~/.server/gallery/google-photos";
import { loadGooglePhotosGallery } from "~/.server/gallery/google-photos";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import { cn } from "~/lib/utils";
import { MdLink, SectionLabel, Squiggle } from "~/components/terminal";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/gallery">gallery</Link>,
};

const GALLERY_DESCRIPTION =
  "Photo gallery from Google Photos — moments and shots I share on my portfolio.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Gallery",
    description: GALLERY_DESCRIPTION,
    path: "/gallery",
    keywords: [
      "gallery",
      "photography",
      "Google Photos",
      "Nischal Dahal",
      "portfolio",
    ],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Gallery — Nischal Dahal",
      description: GALLERY_DESCRIPTION,
      path: "/gallery",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Gallery", path: "/gallery" },
      ],
      type: "CollectionPage",
    }),
  ];
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
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Gallery</h1>

      <p className="mt-2 text-muted-foreground">
        Loaded via{" "}
        <a
          className="term-link"
          href="https://developers.google.com/photos/library/reference/rest/v1/mediaItems/search"
          target="_blank"
          rel="noopener noreferrer"
        >
          Photos Library API
        </a>{" "}
        — only app-created media appears (
        <a
          className="term-link"
          href="https://developers.google.com/photos/support/updates"
          target="_blank"
          rel="noopener noreferrer"
        >
          API policy
        </a>
        )
      </p>

      <Squiggle />

      {!gallery.ok ? (
        <div>
          <SectionLabel>Status:</SectionLabel>
          <p className="mt-2 text-muted-foreground">{gallery.message}</p>
        </div>
      ) : gallery.photos.length === 0 ? (
        <div>
          <SectionLabel>Status:</SectionLabel>
          <p className="mt-2 text-muted-foreground">
            No app-created items found for this album — upload via{" "}
            <code className="font-mono text-foreground">albums.create</code> and
            ensure media was created with the Library API
          </p>
        </div>
      ) : (
        <>
          <SectionLabel>Photos ({gallery.photos.length}):</SectionLabel>
          <ul
            className={cn(
              "mt-3 grid gap-px border border-border",
              "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
            )}
          >
            {gallery.photos.map((photo) => (
              <GalleryTile key={photo.id} photo={photo} />
            ))}
          </ul>
        </>
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
          "group block size-full overflow-hidden border border-border bg-muted",
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
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <SectionLabel>Error:</SectionLabel>
      <p className="mt-2 text-destructive">{error.message}</p>
      <p className="mt-3">
        <MdLink label="Back home" to="/" />
      </p>
    </div>
  );
}
