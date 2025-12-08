import {
  ArrowUpRightIcon,
  Building2Icon,
  ExternalLink,
  GithubIcon,
} from "lucide-react";
import { Link, data } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { createHeaders, createMetaTags } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/projects">Projects</Link>,
};

export const meta: Route.MetaFunction = () => {
  return createMetaTags({
    title: "Projects",
    description:
      "Projects by Nischal Dahal (broisnischal) - Open-source projects, web apps, Chrome extensions, and development tools. View my work on GitHub.",
    path: "/projects",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "projects",
      "portfolio",
      "open source",
      "GitHub projects",
      "web development",
      "Chrome extensions",
      "software projects",
    ],
  });
};

export function headers() {
  return createHeaders();
}

// Project interface
interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  languages?: string[];
  technologies?: string[];
  stars?: number;
  updatedAt?: string;
}

// Static projects data
const projects: Project[] = [
  {
    id: "zap",
    title: "zap",
    description:
      "A fast, cross-platform universal package manager that auto-detects your system.",
    repoUrl: "https://github.com/broisnischal/zap",
    technologies: ["Rust"],
    languages: ["Rust"],
  },
  {
    id: "hide-and-seek",
    title: "hide-and-seek",
    description:
      "A multiplayer game built with modern web technologies. Real-time gameplay experience.",
    repoUrl: "https://github.com/broisnischal/hide-and-seek",
    technologies: ["TypeScript", "Multiplayer", "Game Development"],
    languages: ["TypeScript"],
  },
  {
    id: "switch-tab",
    title: "switch-tab",
    description:
      "A Chrome extension that lets you switch between opened tabs. Simple, cozy, and cool!",
    repoUrl: "https://github.com/broisnischal/switch-tab",
    technologies: ["Chrome Extension", "JavaScript", "Browser API"],
    languages: ["JavaScript", "HTML", "CSS"],
  },
  {
    id: "figma-organizer",
    title: "figma-organizer",
    description:
      "A Figma plugin to help you organize your Figma experience, as a viewer or designer.",
    repoUrl: "https://github.com/broisnischal/figma-organizer",
    technologies: ["Figma Plugin", "TypeScript", "Design Tools"],
    languages: ["TypeScript"],
  },
  {
    id: "ezyenv",
    title: "ezyenv",
    description:
      "A simple CLI tool to automatically generate .env.example files from your .env files.",
    repoUrl: "https://github.com/broisnischal/ezyenv",
    technologies: ["CLI Tool", "Node.js", "Environment Variables"],
    languages: ["JavaScript", "TypeScript"],
  },
  {
    id: "where2search",
    title: "where2search",
    description:
      "A browser extension for enhanced search capabilities. Download and load unpacked in Chrome, Edge, Brave or other browsers!",
    repoUrl: "https://github.com/broisnischal/where2search",
    technologies: ["Chrome Extension", "Browser Extension", "Search"],
    languages: ["JavaScript", "HTML", "CSS"],
  },
  {
    id: "smail",
    title: "smail",
    description:
      "A temporary mail service and mail forwarder, built for Warp and Cursor. Get mail alias for free!",
    repoUrl: "https://github.com/broisnischal/smail",
    technologies: ["Email Service", "Mail Forwarding", "Temporary Mail"],
    languages: ["TypeScript", "Node.js"],
  },
  {
    id: "sandesh",
    title: "sandesh",
    description:
      "A Flutter toast library - a Sonner replacement for Flutter applications.",
    repoUrl: "https://github.com/broisnischal/sandesh",
    technologies: ["Flutter", "Dart", "UI Library", "Toast"],
    languages: ["Dart"],
  },
  {
    id: "prisma-type-generator",
    title: "prisma-type-generator",
    description:
      "Prisma type generator! Automatically generate TypeScript types from your Prisma schema.",
    repoUrl: "https://github.com/broisnischal/prisma-type-generator",
    technologies: ["Prisma", "TypeScript", "Type Generation", "Database"],
    languages: ["TypeScript"],
  },
  {
    id: "chrome-extension-template",
    title: "chrome-extension-template",
    description:
      "A template that provides a solid foundation for developing Chrome extensions.",
    repoUrl: "https://github.com/broisnischal/chrome-extension-template",
    technologies: ["Chrome Extension", "Template", "Boilerplate"],
    languages: ["TypeScript", "JavaScript"],
  },
  {
    id: "youtubeai",
    title: "youtubeai",
    description:
      "YouTube AI Title and description generator using Transformer.js, Hugging Face Whisper model, and AI Workers!",
    repoUrl: "https://github.com/broisnischal/youtubeai",
    technologies: [
      "AI",
      "Machine Learning",
      "Transformer.js",
      "Whisper",
      "Hugging Face",
      "YouTube",
    ],
    languages: ["TypeScript", "JavaScript", "Python"],
  },
  {
    id: "reutil",
    title: "reutil",
    description:
      "A collection of essential React patterns and utility components for modern React development.",
    repoUrl: "https://github.com/broisnischal/reutil",
    technologies: [
      "React",
      "TypeScript",
      "Utility Components",
      "React Patterns",
    ],
    languages: ["TypeScript"],
  },
  {
    id: "prisma-fns",
    title: "prisma-fns",
    description:
      "A revolutionary utility extension for seamless Prisma integration and enhanced developer experience.",
    repoUrl: "https://github.com/broisnischal/prisma-fns",
    technologies: ["Prisma", "TypeScript", "Database", "Developer Tools"],
    languages: ["TypeScript"],
  },
  {
    id: "chorus-extractor",
    title: "Chorus Extractor",
    description:
      "Building a Chorus extractor - the best song part extractor, using machine learning and audio spectrum data in Python.",
    repoUrl: "https://github.com/broisnischal/chorus-extractor",
    technologies: [
      "Python",
      "Machine Learning",
      "Audio Processing",
      "ML",
      "Audio Spectrum",
    ],
    languages: ["Python"],
  },
];

export async function loader({}: Route.LoaderArgs) {
  return data({
    projects,
  });
}

function ProjectCard({ project }: { project: Project }) {
  const technologies = project.technologies || project.languages || [];

  return (
    <a
      href={project.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col h-full bg-card border border-border rounded-lg p-6 "
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <GithubIcon
          size={20}
          className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
        {project.description}
      </p>

      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, 4).map((tech, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border/50"
              title={tech}
            >
              {tech}
            </span>
          ))}
          {technologies.length > 4 && (
            <span
              className="px-2.5 py-1 rounded-md text-xs text-muted-foreground bg-muted/50 border border-border/50"
              title={technologies.slice(4).join(", ")}
            >
              +{technologies.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          View on GitHub
        </span>
        <ExternalLink
          size={14}
          className="text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
        />
      </div>
    </a>
  );
}

export default function Page({}: Route.ComponentProps) {
  return (
    <div className="max-w-7xl w-full">
      <h1 className="opacity-0">Project by nischal dahal (broisnischal)</h1>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2Icon />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-bold">
            Under Maintenance
          </EmptyTitle>
          <EmptyDescription className="text-lg text-muted-foreground">
            collection of open-source projects, tools, and applications
            I&apos;ve built. Each project represents a solution to a real-world
            problem or an exploration of new technologies.
          </EmptyDescription>
          <EmptyDescription>
            Site is under construction, check back later for updates.
          </EmptyDescription>
        </EmptyHeader>
        {/* <EmptyContent>
          <div className="flex gap-2">
            <Button>Create Project</Button>
            <Button variant="outline">Import Project</Button>
          </div>
        </EmptyContent> */}
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a
            href="https://github.com/broisnischal"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div> */}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="max-w-7xl w-full">
      <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
      <p className="text-destructive">{error.message}</p>
    </div>
  );
}
