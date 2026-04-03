import {
  Check,
  Code,
  Coffee,
  Copy,
  ExternalLink,
  FileText,
  Github,
  Images,
  Instagram,
  Linkedin,
  MessageCircle,
  Package,
  Rss,
  Twitter,
  Youtube,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { useCallback, useState } from "react";
import { Link, data } from "react-router";
import { createHeaders, createMetaTags } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/links">Links</Link>,
};

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Links",
    description:
      "Nischal Dahal's social links - Connect with broisnischal on GitHub, LinkedIn, Twitter, and other platforms. Quick access to all profiles.",
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
};

export function headers() {
  return createHeaders();
}

interface SocialLink {
  id: string;
  name: string;
  url: string;
  iconName: string;
}

const iconMap: Record<string, ComponentType<LucideProps>> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  discord: MessageCircle,
  youtube: Youtube,
  "ko-fi": Coffee,
  resume: FileText,
  dartpub: Package,
  gist: Code,
  chess: Code,
  npmjs: Package,
  rss: Rss,
  image: Images,
  instagram: Instagram,
};

const socialLinks: SocialLink[] = [
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/broisnischal",
    iconName: "github",
  },
  {
    id: "twitter",
    name: "X",
    url: "https://twitter.com/broisnees",
    iconName: "twitter",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/nischalxdahal",
    iconName: "linkedin",
  },
  {
    id: "discord",
    name: "Discord",
    url: "https://discord.com/users/broisnees",
    iconName: "discord",
  },
  {
    id: "youtube",
    name: "Youtube",
    url: "https://youtube.com/@broisnees",
    iconName: "youtube",
  },
  {
    id: "ko-fi",
    name: "Ko-fi",
    url: "https://ko-fi.com/nischal-dahal",
    iconName: "ko-fi",
  },
  {
    id: "resume",
    name: "Resume",
    url: "/resume.pdf",
    iconName: "resume",
  },
  {
    id: "dartpub",
    name: "Dart Pub",
    url: "https://pub.dev/publishers/nischal-dahal.com.np/packages",
    iconName: "dartpub",
  },
  {
    id: "gist",
    name: "Gist",
    url: "https://gist.github.com/broisnischal",
    iconName: "gist",
  },
  {
    id: "npmjs",
    name: "npmjs",
    url: "https://www.npmjs.com/~broisnees",
    iconName: "npmjs",
  },
  {
    id: "rss",
    name: "RSS",
    url: "/blogs.rss",
    iconName: "rss",
  },
  {
    id: "gallery",
    name: "Gallery",
    url: "https://photos.app.goo.gl/2RHWh9PyAGyRCZAP9",
    iconName: "image",
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://instagram.com/broisnees",
    iconName: "instagram",
  },
];

const WALLET_ADDRESS = "0x644D721Cbe97BC458d9347A2CCE47c063EEd0Eb0" as const;

export async function loader({}: Route.LoaderArgs) {
  return data({
    links: socialLinks,
  });
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
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
      <p className="text-muted-foreground text-sm flex flex-wrap items-center gap-x-1 gap-y-1">
        <span>Wallet :</span>
        <button
          type="button"
          onClick={copy}
          className="group inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-background/80 px-2 py-0.5 font-mono text-xs text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-sm"
          title={copied ? "Copied" : "Copy address"}
          aria-label={
            copied
              ? "Address copied to clipboard"
              : `Copy wallet address ${address} to clipboard`
          }
        >
          <span className="truncate">{address}</span>
          {copied ? (
            <Check
              className="size-3.5 shrink-0 text-emerald-600"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <Copy
              className="size-3.5 shrink-0 text-muted-foreground opacity-70 group-hover:opacity-100"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
        </button>
      </p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        View on Etherscan
        <ExternalLink className="size-3.5" strokeWidth={1.75} aria-hidden />
      </a>
    </div>
  );
}

function SocialAnchor({ link }: { link: SocialLink }) {
  const Icon = iconMap[link.iconName] ?? Code;
  const isExternal = link.url.startsWith("http") || link.url.startsWith("//");

  return (
    <a
      href={link.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
    >
      <Icon className="size-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="text-base underline underline-offset-4">{link.name}</span>
    </a>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { links } = loaderData;

  return (
    <div className="h-1/2 max-w-4xl font-sans">
      <section
        className="flex flex-col gap-6"
        aria-labelledby="links-find-heading"
      >
        <h1
          id="links-find-heading"
          className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
        >
          Links
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Elsewhere on the web where I&apos;m active.
        </p>
        <nav
          className="flex flex-col items-start gap-x-6 gap-y-4"
          aria-label="Social and profile links for Nischal Dahal"
        >
          {links.map((link) => (
            <SocialAnchor key={link.id} link={link} />
          ))}
        </nav>

        <WalletRow address={WALLET_ADDRESS} />
      </section>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
      <p className="text-destructive">{error.message}</p>
    </div>
  );
}
