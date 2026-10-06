import { Link, data } from "react-router";
import { CopyCommand } from "~/components/copy-command";
import { BLEED, GridCells, ROW_LINK, RowNumber } from "~/components/grid";
import { ScrambleText, useScramble } from "~/components/scramble";
import { SectionLabel } from "~/components/terminal";
import { cn } from "~/lib/utils";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  grid: true,
  breadcrumb: () => <Link to="/links">links</Link>,
};

const LINKS_DESCRIPTION =
  "Nischal Dahal's social links - Connect with broisnischal on GitHub, LinkedIn, Twitter, and other platforms. Quick access to all profiles.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Links",
    description: LINKS_DESCRIPTION,
    path: "/links",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "links",
      "social media",
      "GitHub",
      "LinkedIn",
      "Twitter",
      "contact",
    ],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Links — Nischal Dahal",
      description: LINKS_DESCRIPTION,
      path: "/links",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Links", path: "/links" },
      ],
    }),
  ];
};

export function headers() {
  return createHeaders();
}

interface SocialLink {
  id: string;
  name: string;
  url: string;
}

const socialLinks: SocialLink[] = [
  { id: "github", name: "GitHub", url: "https://github.com/broisnischal" },
  { id: "twitter", name: "X", url: "https://twitter.com/broisnees" },
  { id: "resume", name: "Resume", url: "/resume.pdf" },
  {
    id: "dartpub",
    name: "Dart Pub",
    url: "https://pub.dev/publishers/nischal-dahal.com.np/packages",
  },
  { id: "gist", name: "Gist", url: "https://gist.github.com/broisnischal" },
  { id: "npmjs", name: "npmjs", url: "https://www.npmjs.com/~broisnees" },
  { id: "rss", name: "RSS", url: "/blogs.rss" },
  {
    id: "gallery",
    name: "Gallery",
    url: "https://photos.app.goo.gl/2RHWh9PyAGyRCZAP9",
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://instagram.com/broisnees",
  },
];

const WALLET_ADDRESS = "0x644D721Cbe97BC458d9347A2CCE47c063EEd0Eb0" as const;

export async function loader({}: Route.LoaderArgs) {
  return data({ links: socialLinks });
}

const CELL =
  "flex flex-col justify-between gap-3 bg-background px-5 py-5 md:px-8 md:py-6";

/** Host + path, minus protocol and `www.`, for the cell's address line. */
function shortUrl(url: string) {
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}

function LinkCell({ link, index }: { link: SocialLink; index: number }) {
  const { shown, run } = useScramble(link.name);
  const external = /^https?:/.test(link.url);
  return (
    <div
      onPointerEnter={run}
      onFocus={run}
      className={cn(CELL, "cell-corners relative isolate h-(--row) w-full")}
    >
      <RowNumber n={index + 1} />
      <a
        href={link.url}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        className={`flex-1 text-base font-medium text-bright ${ROW_LINK}`}
      >
        <ScrambleText text={link.name} shown={shown} />
      </a>
      <span className="truncate text-xs text-term-link">
        {shortUrl(link.url)}
      </span>
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { links } = loaderData;

  return (
    // Flush with header and footer: the page is one stack of boxes.
    <div className="-mt-10 -mb-16 w-full text-sm leading-7 md:-mt-12 md:-mb-20 md:text-[0.9375rem]">
      <section
        aria-labelledby="links-title"
        className={cn(
          "grid-cross relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3",
          BLEED,
        )}
      >
        <div
          data-tile
          className={cn(
            CELL,
            "min-h-32 sm:col-span-2 lg:col-span-1 lg:h-(--row)",
          )}
        >
          <span className="text-xs text-muted-foreground">elsewhere</span>
          <h1
            id="links-title"
            className="font-display text-[2rem] leading-none font-normal tracking-[-0.02em] text-bright italic md:text-[2.375rem]"
          >
            Links
          </h1>
        </div>
        <div
          data-tile
          className={cn(CELL, "min-h-32 sm:col-span-2 lg:h-(--row)")}
        >
          <span className="text-xs tabular-nums text-muted-foreground">
            {links.length} profiles
          </span>
          <p className="text-muted-foreground">
            Elsewhere on the web where I&apos;m active.
          </p>
        </div>
      </section>

      <section
        aria-label="Profiles"
        className={cn("grid-cross relative border-t border-border", BLEED)}
      >
        <GridCells
          label="Profiles"
          items={links}
          cellKey={(l) => l.id}
          renderCell={(l, i) => <LinkCell link={l} index={i} />}
        />
      </section>

      <section
        aria-labelledby="wallet-title"
        className={cn("grid-cross relative border-t border-border", BLEED)}
      >
        <div data-tile className={cn(CELL, "min-h-(--row) bg-background")}>
          <h2
            id="wallet-title"
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            Wallet (ETH)
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
            <CopyCommand command={WALLET_ADDRESS} prompt={null} />
            <a
              href={`https://etherscan.io/address/${WALLET_ADDRESS}`}
              target="_blank"
              rel="noreferrer noopener"
              className="term-link"
            >
              view on etherscan
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full text-sm">
      <SectionLabel>Error:</SectionLabel>
      <p className="mt-2 text-destructive">{error.message}</p>
    </div>
  );
}
