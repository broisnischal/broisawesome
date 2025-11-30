import { Link, data } from "react-router";
import type { Route } from "./+types/route";
import React from "react";
import {
    Github,
    Twitter,
    Linkedin,
    Youtube,
    MessageCircle,
    Coffee,
    FileText,
    Code,
    Package,
    Rss,
    ExternalLink,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { createMetaTags, createHeaders } from "~/lib/meta";

export const handle = {
    breadcrumb: () => <Link to="/links">Links</Link>,
};

export const meta: Route.MetaFunction = () => {
    return createMetaTags({
        title: "Links",
        description: "Nischal Dahal's social links - Connect with broisnischal on GitHub, LinkedIn, Twitter, and other platforms. Quick access to all profiles.",
        path: "/links",
        keywords: ["Nischal Dahal", "Nischal", "broisnischal", "links", "social media", "GitHub", "LinkedIn", "Twitter", "contact"],
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
    color?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
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
        name: "Github",
        url: "https://github.com/broisnischal",
        iconName: "github",
    },
    {
        id: "twitter",
        name: "Twitter",
        url: "https://twitter.com/broisnees",
        iconName: "twitter",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        url: "https://linkedin.com/in/broisnischal",
        iconName: "linkedin",
    },
    // {
    //     id: "discord",
    //     name: "Discord",
    //     url: "https://discord.com/users/broisnees",
    //     iconName: "discord",
    // },
    // {
    //     id: "youtube",
    //     name: "Youtube",
    //     url: "https://youtube.com/@broisnees",
    //     iconName: "youtube",
    // },
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

export async function loader({ request }: Route.LoaderArgs) {
    return data({
        links: socialLinks,
    });
}

function LinkCard({ link }: { link: SocialLink }) {
    const Icon = iconMap[link.iconName] || Code;
    const isExternal = link.url.startsWith("http") || link.url.startsWith("//");

    return (
        <a
            href={link.url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={cn(
                "group flex items-center gap-3 p-4 border border-border rounded-lg",
                "bg-card hover:bg-accent/50 hover:border-primary/50",
                "transition-all duration-200",
                "hover:shadow-md hover:shadow-primary/5"
            )}
        >
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.name}
                </h3>
            </div>
            {isExternal && (
                <ExternalLink
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
            )}
        </a>
    );
}

export default function Page({ loaderData }: Route.ComponentProps) {
    const { links } = loaderData;

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Links - Nischal Dahal
                </h1>
                <p className="text-muted-foreground">
                    Quicklinks to my social platforms and contacts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {links.map((link) => (
                    <LinkCard key={link.id} link={link} />
                ))}
            </div>
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

