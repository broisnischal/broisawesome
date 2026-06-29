import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, data } from "react-router";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
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
  { id: "instagram", name: "Instagram", url: "https://instagram.com/broisnees" },
];

const WALLET_ADDRESS = "0x644D721Cbe97BC458d9347A2CCE47c063EEd0Eb0" as const;

export async function loader({}: Route.LoaderArgs) {
  return data({ links: socialLinks });
}

function WalletRow({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context)
    }
  }, [address]);

  const explorerUrl = `https://etherscan.io/address/${address}`;

  return (
    <div className="space-y-2">
      <SectionLabel>Wallet (ETH):</SectionLabel>
      <button
        type="button"
        onClick={copy}
        className="group inline-flex max-w-full items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        title={copied ? "Copied" : "Copy address"}
        aria-label={
          copied ? "Address copied" : `Copy wallet address ${address}`
        }
      >
        <span className="min-w-0 break-all text-left text-term-link underline decoration-term-link/55 underline-offset-[3px]">
          {address}
        </span>
        {copied ? (
          <Check className="size-3.5 shrink-0 text-term-link" strokeWidth={2} />
        ) : (
          <Copy
            className="size-3.5 shrink-0 text-muted-foreground opacity-70 group-hover:opacity-100"
            strokeWidth={1.75}
          />
        )}
      </button>
      <p>
        <MdLink label="View on Etherscan" href={explorerUrl} />
      </p>
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { links } = loaderData;

  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Links</h1>
      <p className="mt-2 text-muted-foreground">
        Elsewhere on the web where I&apos;m active.
      </p>

      <Squiggle />

      <SectionLabel>Profiles:</SectionLabel>
      <MdList>
        {links.map((link) => (
          <MdListItem key={link.id}>
            <MdLink label={link.name} href={link.url} display={link.url} />
          </MdListItem>
        ))}
      </MdList>

      <Squiggle />

      <WalletRow address={WALLET_ADDRESS} />
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
