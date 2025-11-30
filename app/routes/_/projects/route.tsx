import { Link, data } from "react-router";
import type { Route } from "./+types/route";
import { Github, ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";
import { createMetaTags, createHeaders } from "~/lib/meta";

export const handle = {
    breadcrumb: () => <Link to="/projects">Projects</Link>,
};

export const meta: Route.MetaFunction = () => {
    return createMetaTags({
        title: "Projects",
        description: "Projects by Nischal Dahal (broisnischal) - Open-source projects, web apps, Chrome extensions, and development tools. View my work on GitHub.",
        path: "/projects",
        keywords: ["Nischal Dahal", "Nischal", "broisnischal", "projects", "portfolio", "open source", "GitHub projects", "web development", "Chrome extensions", "software projects"],
    });
};

export function headers() {
    return createHeaders();
}

// Project status type
type ProjectStatus = "todo" | "doing" | "completed";

// Project interface 
interface Project {
    id: string;
    title: string;
    description: string;
    repoUrl: string;
    status: ProjectStatus;
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
        description: "A fast, cross-platform universal package manager that auto-detects your system.",
        repoUrl: "https://github.com/broisnischal/zap",
        status: "doing",
        technologies: ["Rust"],
        languages: ["Rust"],
    },
    {
        id: "hide-and-seek",
        title: "hide-and-seek",
        description: "A multiplayer game built with modern web technologies. Real-time gameplay experience.",
        repoUrl: "https://github.com/broisnischal/hide-and-seek",
        status: "todo",
        technologies: ["TypeScript", "Multiplayer", "Game Development"],
        languages: ["TypeScript"],
    },
    {
        id: "switch-tab",
        title: "switch-tab",
        description: "A Chrome extension that lets you switch between opened tabs. Simple, cozy, and cool!",
        repoUrl: "https://github.com/broisnischal/switch-tab",
        status: "completed",
        technologies: ["Chrome Extension", "JavaScript", "Browser API"],
        languages: ["JavaScript", "HTML", "CSS"],
    },
    {
        id: "figma-organizer",
        title: "figma-organizer",
        description: "A Figma plugin to help you organize your Figma experience, as a viewer or designer.",
        repoUrl: "https://github.com/broisnischal/figma-organizer",
        status: "doing",
        technologies: ["Figma Plugin", "TypeScript", "Design Tools"],
        languages: ["TypeScript"],
    },
    {
        id: "ezyenv",
        title: "ezyenv",
        description: "A simple CLI tool to automatically generate .env.example files from your .env files.",
        repoUrl: "https://github.com/broisnischal/ezyenv",
        status: "completed",
        technologies: ["CLI Tool", "Node.js", "Environment Variables"],
        languages: ["JavaScript", "TypeScript"],
    },
    {
        id: "where2search",
        title: "where2search",
        description: "A browser extension for enhanced search capabilities. Download and load unpacked in Chrome, Edge, Brave or other browsers!",
        repoUrl: "https://github.com/broisnischal/where2search",
        status: "completed",
        technologies: ["Chrome Extension", "Browser Extension", "Search"],
        languages: ["JavaScript", "HTML", "CSS"],
    },
    {
        id: "smail",
        title: "smail",
        description: "A temporary mail service and mail forwarder, built for Warp and Cursor. Get mail alias for free!",
        repoUrl: "https://github.com/broisnischal/smail",
        status: "completed",
        technologies: ["Email Service", "Mail Forwarding", "Temporary Mail"],
        languages: ["TypeScript", "Node.js"],
    },
    {
        id: "sandesh",
        title: "sandesh",
        description: "A Flutter toast library - a Sonner replacement for Flutter applications.",
        repoUrl: "https://github.com/broisnischal/sandesh",
        status: "completed",
        technologies: ["Flutter", "Dart", "UI Library", "Toast"],
        languages: ["Dart"],
    },
    {
        id: "prisma-type-generator",
        title: "prisma-type-generator",
        description: "Prisma type generator! Automatically generate TypeScript types from your Prisma schema.",
        repoUrl: "https://github.com/broisnischal/prisma-type-generator",
        status: "completed",
        technologies: ["Prisma", "TypeScript", "Type Generation", "Database"],
        languages: ["TypeScript"],
    },
    {
        id: "chrome-extension-template",
        title: "chrome-extension-template",
        description: "A template that provides a solid foundation for developing Chrome extensions.",
        repoUrl: "https://github.com/broisnischal/chrome-extension-template",
        status: "completed",
        technologies: ["Chrome Extension", "Template", "Boilerplate"],
        languages: ["TypeScript", "JavaScript"],
    },
    {
        id: "youtubeai",
        title: "youtubeai",
        description: "YouTube AI Title and description generator using Transformer.js, Hugging Face Whisper model, and AI Workers!",
        repoUrl: "https://github.com/broisnischal/youtubeai",
        status: "doing",
        technologies: ["AI", "Machine Learning", "Transformer.js", "Whisper", "Hugging Face", "YouTube"],
        languages: ["TypeScript", "JavaScript", "Python"],
    },
    {
        id: "reutil",
        title: "reutil",
        description: "A collection of essential React patterns and utility components for modern React development.",
        repoUrl: "https://github.com/broisnischal/reutil",
        status: "completed",
        technologies: ["React", "TypeScript", "Utility Components", "React Patterns"],
        languages: ["TypeScript"],
    },
    {
        id: "prisma-fns",
        title: "prisma-fns",
        description: "A revolutionary utility extension for seamless Prisma integration and enhanced developer experience.",
        repoUrl: "https://github.com/broisnischal/prisma-fns",
        status: "completed",
        technologies: ["Prisma", "TypeScript", "Database", "Developer Tools"],
        languages: ["TypeScript"],
    },
    {
        id: "chorus-extractor",
        title: "Chorus Extractor",
        description: "Building a Chorus extractor - the best song part extractor, using machine learning and audio spectrum data in Python.",
        repoUrl: "https://github.com/broisnischal/chorus-extractor",
        status: "todo",
        technologies: ["Python", "Machine Learning", "Audio Processing", "ML", "Audio Spectrum"],
        languages: ["Python"],
    },
];

export async function loader({ request }: Route.LoaderArgs) {
    return data({
        projects,
    });
}

// Status configuration
const statusConfig: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
    todo: {
        label: "Todo",
        color: "text-yellow-600 dark:text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
    },
    doing: {
        label: "Doing",
        color: "text-blue-600 dark:text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
    },
    completed: {
        label: "Completed",
        color: "text-green-600 dark:text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
    },
};

// Language color mapping
const languageColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-500",
    Rust: "bg-orange-600",
    Python: "bg-blue-400",
    Dart: "bg-cyan-500",
    HTML: "bg-orange-500",
    CSS: "bg-blue-600",
    "C++": "bg-blue-700",
    Java: "bg-red-600",
    Go: "bg-cyan-600",
    Ruby: "bg-red-500",
    PHP: "bg-indigo-500",
    Swift: "bg-orange-500",
    Kotlin: "bg-purple-600",
    Shell: "bg-gray-600",
    Vue: "bg-green-500",
    React: "bg-cyan-400",
    Svelte: "bg-orange-500",
};

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
    const statusInfo = statusConfig[project.status];
    const technologies = project.technologies || project.languages || [];

    return (
        <div className="group bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:border-primary/50">
            <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-foreground text-base flex-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {project.title}
                </h3>
                <span
                    className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0",
                        statusInfo.color,
                        statusInfo.bgColor
                    )}
                >
                    {statusInfo.label}
                </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                {project.description}
            </p>

            {/* Technologies/Languages */}
            {technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {technologies.slice(0, 5).map((tech, idx) => {
                        return (
                            <span
                                key={idx}
                                className={cn(
                                    "px-2 py-0.5 rounded-md text-xs font-medium",
                                    "bg-muted/70 text-foreground/90 border border-border/50",
                                    "hover:bg-muted transition-colors"
                                )}
                                title={tech}
                            >
                                {tech}
                            </span>
                        );
                    })}
                    {technologies.length > 5 && (
                        <span
                            className="px-2 py-0.5 rounded-md text-xs text-muted-foreground bg-muted/40 border border-border/50"
                            title={technologies.slice(5).join(", ")}
                        >
                            +{technologies.length - 5}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project.stars !== undefined && project.stars > 0 && (
                        <span className="flex items-center gap-1.5">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-medium">{project.stars}</span>
                        </span>
                    )}
                </div>
                <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group/link"
                >
                    <Github size={14} className="group-hover/link:scale-110 transition-transform" />
                    <span>View Repo</span>
                    <ExternalLink size={12} className="opacity-70 group-hover/link:opacity-100 transition-opacity" />
                </a>
            </div>
        </div>
    );
}

// Column Component
function ProjectColumn({
    status,
    projects,
}: {
    status: ProjectStatus;
    projects: Project[];
}) {
    const statusInfo = statusConfig[status];
    const columnProjects = projects.filter((p) => p.status === status);

    return (
        <div className="flex flex-col h-full">
            <div className={cn(
                "mb-4 pb-3 border-b border-border/50"
            )}>
                <div className="flex items-center justify-between mb-1">
                    <h2 className={cn(
                        "text-lg font-semibold",
                        statusInfo.color
                    )}>
                        {statusInfo.label}
                    </h2>
                    <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold border",
                        statusInfo.bgColor,
                        statusInfo.color
                    )}>
                        {columnProjects.length}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {columnProjects.length === 1 ? "project" : "projects"}
                </span>
            </div>
            <div className="flex-1 relative min-h-[200px] max-h-[calc(100vh-300px)]">
                <div className="space-y-3 overflow-y-auto h-full pr-1 pb-4">
                    {columnProjects.length > 0 ? (
                        columnProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                            <p>No projects in this column</p>
                        </div>
                    )}
                </div>
                {/* Subtle gradient fade at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-linear-to-t from-background via-background/80 to-transparent" />
            </div>
        </div>
    );
}

export default function Page({ loaderData }: Route.ComponentProps) {
    const { projects } = loaderData;

    return (
        <div className="max-w-7xl w-full">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Projects by Nischal Dahal
                </h1>
                <p className="text-muted-foreground">
                    A collection of projects I've built and worked on. View-only board showcasing my work.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <ProjectColumn status="todo" projects={projects} />
                <ProjectColumn status="doing" projects={projects} />
                <ProjectColumn status="completed" projects={projects} />
            </div>
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

