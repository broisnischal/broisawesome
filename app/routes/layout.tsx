import { Outlet, useMatches } from "react-router";
import { SiteHeader } from "../components/site-header";

export default function Page() {
  // Grid pages (handle.grid) run edge to edge; reading pages keep a
  // comfortable centred column inside the full-width frame.
  const grid = useMatches().some(
    (m) => (m.handle as { grid?: boolean } | undefined)?.grid,
  );

  return (
    <>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        // Reading pages are one tile for the theme wave; grid pages are made
        // of tiles already (a tile around them would hold them all back).
        data-tile={grid ? undefined : ""}
        className="min-h-0 flex-1 px-5 pt-10 pb-16 font-mono outline-none md:px-8 md:pt-12 md:pb-20"
      >
        {grid ? (
          <Outlet />
        ) : (
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        )}
      </main>
    </>
  );
}
