import { Link, data } from "react-router";
import type { Route } from "./+types/route";
import { Kbd } from "~/components/kbd";
import { StickyNote, Settings, BookOpen, Briefcase, Link2, User } from "lucide-react";
import { createMetaTags, createHeaders } from "~/lib/meta";

export const handle = {
    breadcrumb: () => <Link to="/">Home</Link>,
};

export const meta: Route.MetaFunction = () => {
    return createMetaTags({
        title: "Home",
        description: "Nischal Dahal - Self-started software developer focusing on serverless architecture, Android development, user experience, and product development. Portfolio, blog, projects, and more.",
        path: "/",
        keywords: ["Nischal Dahal", "broisnischal", "software developer", "portfolio", "web development", "React", "TypeScript", "serverless", "Android development"],
    });
};

export function headers() {
    return createHeaders();
}

export async function loader({ request }: Route.LoaderArgs) {
    const verbs = ['eccentric', 'inquisitive', 'enthusiastic', 'explorer', 'hustler', 'insurgent', 'maverick', 'renegade'];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];

    return data({
        url: new URL(request.url),
        verb,
    });
}

function Header({ verb }: { verb?: string }) {
    return (
        <div className="flex flex-col gap-2 mb-12">
            <h4 className="text-sm leading-none font-medium text-foreground">
                a.k.a System architect <Kbd className="text-xs text-muted-foreground">🚀</Kbd>
            </h4>
            <p className="text-muted-foreground text-sm">
                I learn and love about technology, and also a <Kbd className="text-xs">{verb || 'indefinite person'}</Kbd>.
            </p>
        </div>
    );
}

export default function Page({ loaderData }: Route.ComponentProps) {
    const { verb } = loaderData;


    return (
        <div className="max-w-4xl">
            <Header verb={verb} />

            <NavigationCards />

            <div className="flex gap-2 mt-8 text-sm text-muted-foreground">
                <Link target="_blank" className="underline" to="/llms.txt">LLM</Link>
                <Link target="_blank" className="underline" to="/blogs.rss">RSS</Link>
                <Link target="_blank" className="underline" to="/feed.json">Feed</Link>
                <Link target="_blank" className="underline" to="/resume.pdf">Resume</Link>
            </div>
        </div>
    );
}

function NavigationCards() {
    const navItems = [
        {
            to: "/blog",
            title: "Blog",
            description: "Articles and thoughts on technology",
            icon: BookOpen,
        },
        {
            to: "/notes",
            title: "Notes",
            description: "Personal notes, glossary terms, and bookmarks",
            icon: StickyNote,
        },
        {
            to: "/setup",
            title: "Setup",
            description: "Tools, hardware, and software I use daily",
            icon: Settings,
        },

        {
            to: "/projects",
            title: "Projects",
            description: "Things I've built and worked on",
            icon: Briefcase,
        },
        {
            to: "/links",
            title: "Links",
            description: "Quicklinks to my social platforms and contacts",
            icon: Link2,
        },
        {
            to: "/about",
            title: "About",
            description: "Learn more about me",
            icon: User,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="group flex items-center gap-3 p-4 border border-border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                            <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {item.description}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <div>
            <h1>Error</h1>
            <p>{error.message}</p>
        </div>
    );
}