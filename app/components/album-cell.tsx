import { useEffect, useState, type ReactNode } from "react";
import { useFetcher } from "react-router";
import { DitherShader } from "~/components/ui/dither-shader";
import type { SharedAlbumSummary } from "~/lib/gallery";
import { cn } from "~/lib/utils";
import { useTheme } from "~/routes/resources/theme-switch";

/** Duotone ink per theme: [dark pixels, light pixels]. */
const INK = {
  dark: ["#050506", "#b8b8c0"],
  light: ["#b9b4ab", "#fbfaf7"],
} as const;

/**
 * A grid cell whose background is a random photo from my album, dithered.
 * The photo is picked in the browser on every load (the page HTML itself is
 * cached), and the bottom fades to the canvas so the text on top reads.
 */
export function AlbumCell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const fetcher = useFetcher<SharedAlbumSummary>();
  const [index, setIndex] = useState<number | null>(null);
  const theme = useTheme();
  const [dark, light] = INK[theme === "dark" ? "dark" : "light"];
  const load = fetcher.load;

  useEffect(() => {
    load("/resources/album-preview");
  }, [load]);

  const count = fetcher.data?.count ?? 0;
  useEffect(() => {
    if (count > 0) setIndex(Math.floor(Math.random() * count));
  }, [count]);

  return (
    <div
      data-tile
      className={cn("relative isolate overflow-hidden", className)}
    >
      {index !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 animate-in fade-in duration-700 motion-reduce:animate-none"
        >
          <DitherShader
            key={`${index}-${theme}`}
            src={`/resources/album-photo?i=${index}`}
            gridSize={3}
            ditherMode="bayer"
            colorMode="duotone"
            primaryColor={dark}
            secondaryColor={light}
            objectFit="cover"
            contrast={1.15}
            className="size-full"
          />
          {/* Backdrop: the photo fades into the canvas toward the bottom. */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
      )}
      {children}
    </div>
  );
}
