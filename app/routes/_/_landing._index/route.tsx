import {
  BookOpen,
  Briefcase,
  Code,
  Link2,
  Settings,
  Settings2,
  StickyNote,
  User,
} from "lucide-react";
import { Link, NavLink, data } from "react-router";
import {
  createHeaders,
  createMetaTags,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/route";
import { cn } from "~/lib/utils";

export const handle = {
  breadcrumb: () => <Link to="/">Home</Link>,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Nischal Dahal - Software Developer",
    description:
      "Nischal Dahal (broisnischal) - Software developer specializing in serverless architecture, Android development, and modern web technologies. Portfolio, blog, and projects.",
    path: "/",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "software developer",
      "portfolio",
      "web development",
      "React",
      "TypeScript",
      "serverless",
      "Android development",
    ],
  });

  // Add Person schema
  const schema = createPersonSchema();

  return [...metaTags, createSchemaMetaTag(schema)];
};

export function headers() {
  return createHeaders();
}

export async function loader({}: Route.LoaderArgs) {
  const verbs = [
    "eccentric",
    "inquisitive",
    "enthusiastic",
    "explorer",
    "hustler",
    "insurgent",
    "maverick",
    "renegade",
  ];

  const colorCodes = [
    "bg-blue-300",
    "bg-green-300",
    "bg-red-300",
    "bg-yellow-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-orange-300",
  ];

  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const colorCode = colorCodes[Math.floor(Math.random() * colorCodes.length)];

  return data({
    verb,
    colorCode,
  });
}

function Header({ verb, colorCode }: { verb?: string; colorCode?: string }) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="relative w-fit selection:enabled:bg-transparent">
        <img
          src="https://avatars.githubusercontent.com/u/98168009?v=4"
          alt=""
          className="w-36 h-36 object-cover rounded-lg border border-border"
          loading="lazy"
        />
        <div
          className={`text-xs transform rotate-10 absolute top-[-10px] right-[-5px] bg-background/10 backdrop-blur-sm p-1 border-b border-l ${colorCode} px-2 rounded-lg  `}
        >
          {verb || "indefinite person"}
        </div>
      </div>

      <h4 className="text-sm leading-none font-medium text-foreground">
        🚀 a.k.a broisnees
      </h4>
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { verb, colorCode } = loaderData;

  return (
    <div className="max-w-4xl">
      <h1 className="sr-only">
        Nischal Dahal - Software Developer and Creator
      </h1>

      <div className="flex gap-4">
        <Header verb={verb} colorCode={colorCode} />
        <div className="flex-1 text-sm text-justify  flex flex-col gap-2">
          <p className="">
            I am a curious and passionate developer who loves to learn and share
            my knowledge with others. I am a Full Stack Developer and mostly
            work with Typescript, Rust, Bun.
          </p>
          <p>Well i have a very driven knowledge base of variety of things,</p>

          <p>
            I am a system architect, love to scale the system knows devops and
            cloud. Also, love to build things with modern technologies and
            frameworks, creating tool and services is mine go to and most loved
            part.
          </p>
        </div>
      </div>

      <NavigationCards />

      <div className="flex gap-2 mt-8 text-sm text-muted-foreground">
        <Link target="_blank" className="underline" to="/llms.txt">
          LLM
        </Link>
        <Link target="_blank" className="underline" to="/blogs.rss">
          RSS
        </Link>
        <Link target="_blank" className="underline" to="/feed.json">
          Feed
        </Link>
        <Link target="_blank" className="underline" to="/resume.pdf">
          Resume
        </Link>
        <Link target="_blank" className="underline" to="/terms-of-service">
          Terms of Service
        </Link>
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
    {
      to: "/stack",
      title: "Stack",
      description: "My stacks and tools",
      icon: Code,
    },
    {
      to: "/config",
      title: "Config",
      description: "My configurations, keymaps and more",
      icon: Settings2,
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-fit flex-wrap">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={cn(
              "group flex items-center justify-center gap-2 align-middle text-accent-foreground",
              "hover:text-accent-foreground",
              "w-fit",
            )}
          >
            <div className="">
              <div className="flex items-center justify-center gap-1">
                <Icon
                  size={14}
                  className="group-hover:text-accent-foreground"
                />
                <h3 className="text-sm font-semibold group-hover:text-accent-foreground">
                  {item.title.toLowerCase()}
                </h3>
              </div>
              {/* <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.description}
              </p> */}
            </div>
          </NavLink>
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
