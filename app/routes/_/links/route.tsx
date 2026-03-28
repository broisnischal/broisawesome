import {
  Code,
  Coffee,
  FileText,
  Github,
  Linkedin,
  MessageCircle,
  Package,
  Rss,
  Twitter,
  Youtube,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
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
    url: "https://ko-fi.com/broisnees",
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
    url: "https://pub.dev/publishers/broisnees.dev/packages",
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
];

export async function loader({}: Route.LoaderArgs) {
  return data({
    links: socialLinks,
  });
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
      <span className="text-sm underline underline-offset-4">{link.name}</span>
    </a>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { links } = loaderData;

  return (
    <div className="max-w-4xl h-1/2 ">
      <section
        className="flex flex-col gap-4"
        aria-labelledby="links-find-heading"
      >
        <h1
          id="links-find-heading"
          className="font-mono text-xs font-normal uppercase tracking-widest text-muted-foreground"
        >
          Elsewhere
        </h1>
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
          aria-label="Social and profile links"
        >
          {links.map((link) => (
            <SocialAnchor key={link.id} link={link} />
          ))}
        </nav>
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
