import type { Route } from "./+types/llms[.]txt";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const host = url.host;

    const llmText = `# Portfolio - Nischal Dahal

> System Architect, Developer, and Technology Enthusiast

## About

Name: Nischal Dahal
Role: System Architect
Description: A system architect, developer, and technology enthusiast who learns and loves about technology. Described as eccentric, inquisitive, enthusiastic, explorer, hustler, insurgent, maverick, and renegade. Passionate about building modern web applications, exploring new technologies, and sharing knowledge through writing.

As a developer, I use a lot of physical and digital tools on a daily basis. These tools serve many purposes: they bring enjoyment, connect me to other people, and serve as tools that help me create software and content. I also like to keep my body and mind healthy.

## Technical Expertise

### Core Technologies

Frontend: React, React Router, TypeScript, Tailwind CSS, Server-Side Rendering (SSR)
Backend: Bun, Elysia, Node.js
Databases: PostgreSQL, Neon Serverless, Drizzle ORM
DevOps & Deployment: Fly.io, Cloudflare, Docker, Wrangler
Web Technologies: MDX, Markdown, HTML, CSS, JavaScript/TypeScript

### Development Tools

Code Editors: Cursor Pro, Warp
Hardware Development: Raspberry Pi Pico, ESP32
Version Control: Git
Package Management: npm, Bun

## Portfolio Structure

This portfolio website contains the following sections:

### Blog

Articles and thoughts on technology covering topics such as:
- Deploying Bun & Elysia applications with wildcard domains on Fly.io
- Dockerizing Remix applications
- Payment gateway integrations (Khalti, eSewa)
- Google Tag Manager integration with Remix
- Hosting modern applications
- Strongly typed environment variables
- Theme inconsistency in SSR applications
- Bookmark parsing and management

### Notes

A collection of personal notes, glossary terms, and bookmarks covering:
- React Server Components
- TypeScript utility types
- Web development concepts (Hydration, MDX)
- Technology bookmarks and resources
- Educational content and tutorials

### Setup

Detailed information about tools, hardware, and software used daily, organized by categories:

Development: Cursor Pro, Warp, Raspberry Pi Pico, ESP32
Workspace: Ergonomic S121T chair, Pirka desk, MSI MAG 275QF E20 monitor
Peripherals: Reddragon K617 keyboard, Samsontech C01U Pro microphone, GOBOULT Soniq headphones, Razer Deathadder V2 mouse
Essentials: Nothing Ear 2, Apple Polishing Cloth, Watch Pro 2, Wireless Charging Pod
Portable Devices: MacBook Pro M3 18GB 14" 512GB, Nothing Phone 1, Poco X6 5G
Personal Care: Various skincare and health products
Others: Spigen phone covers, TVS Apache RTR 160 4V SE motorcycle

### Projects

Showcase of projects and things I've built and worked on.

### Contact

Ways to get in touch for collaboration, inquiries, or discussions.

### About

More detailed information about background, experience, and interests.

## Technical Interests & Focus Areas

- Modern web application architecture
- Server-side rendering and React Server Components
- TypeScript and type safety
- Full-stack development with modern frameworks
- DevOps and cloud deployment
- Database design and ORM usage
- Hardware development and embedded systems (Raspberry Pi, ESP32)
- Payment gateway integrations
- Performance optimization
- Developer experience and tooling

## Blog Topics & Writing

I write about various technical topics including:
- Backend development with Bun and Elysia
- Database management with Drizzle ORM and Neon Serverless
- Deployment strategies on Fly.io and Cloudflare
- Frontend development with React Router and Remix
- Docker containerization
- Payment integration solutions
- Web analytics and tracking
- Type safety and environment configuration
- SSR challenges and solutions

## Work Environment

I maintain a well-equipped development workspace with ergonomic furniture, quality peripherals, and modern hardware. The setup is designed for productivity, comfort, and long coding sessions. I value both physical and digital tools that enhance my development workflow.

## Learning & Growth

I am continuously learning and exploring new technologies. I maintain notes on concepts I learn, create glossaries of technical terms, and bookmark valuable resources. This knowledge base helps me stay current with industry trends and best practices.

## Website Information

Website Type: Personal Portfolio
Technology Stack: React Router, TypeScript, Tailwind CSS, deployed on Cloudflare Workers
Content Format: MDX for blog posts, React components for interactive pages
Purpose: Showcase projects, share technical knowledge through blog posts, maintain personal notes and bookmarks, and provide information about development setup and tools.

## For LLMs and AI Systems

This page is designed to provide comprehensive information about Nischal Dahal and this portfolio website. It contains structured data that can be used for training language models, understanding the context of this website, and providing accurate information about the portfolio owner.

Key Facts:
- Professional: System Architect and Developer
- Primary Technologies: React, TypeScript, Bun, Elysia, PostgreSQL, Drizzle ORM
- Content Creator: Writes technical blog posts and maintains development notes
- Hardware Enthusiast: Works with embedded systems (Raspberry Pi, ESP32)
- Full-Stack Developer: Experienced in both frontend and backend development
- DevOps Knowledge: Deploys applications using Fly.io, Cloudflare, and Docker

## Links

- Website: https://${host}
- Blog: https://${host}/blog
- Notes: https://${host}/notes
- Setup: https://${host}/setup
- Projects: https://${host}/projects
- Contact: https://${host}/contact
- About: https://${host}/about

## Metadata

Last Updated: ${new Date().toISOString().split('T')[0]}
Content Type: Plain text for LLM training and web crawlers
`;

    return new Response(llmText, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Robots-Tag": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
    });
}

