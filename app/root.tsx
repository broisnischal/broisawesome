import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { CANONICAL_SITE_URL } from "~/lib/meta";
import type { Route } from "./+types/root";
// Self-host the variable mono font that the whole terminal UI is built on.
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/geist";
import "./app.css";
import { Footer } from "./components/footer";
import ProgessBar from "./components/global-pending";
import { ScriptDangerously } from "./lib";

export const meta: Route.MetaFunction = ({}) => {
  return [
    { title: "Nischal Dahal — broisnischal" },
    {
      name: "description",
      content:
        "Nischal Dahal (broisnischal, @broisnees) — software developer on serverless, Android, UX, and web. Portfolio, blog, GitHub activity, and projects.",
    },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "alternate",
    type: "application/rss+xml",
    title: "Blog by Nischal Dahal (RSS)",
    href: `${CANONICAL_SITE_URL}/blogs.rss`,
  },
  {
    rel: "alternate",
    type: "application/feed+json",
    title: "Blog by Nischal Dahal (JSON Feed)",
    href: `${CANONICAL_SITE_URL}/feed.json`,
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  return data({
    path: new URL(request.url).pathname,
  });
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark font-mono antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0a0a0b" />
        <meta name="MobileOptimized" content="320" />
        <meta name="pagename" content="Nischal Dahal" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Favicons, PWA manifest (assets live in /public). */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta
          name="google-site-verification"
          content="edGz_5Jr5VsLbGpxvQ3AZBAKtuEyNBgc_qtdthOPJKU"
        />

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6430477215422762"
          crossOrigin="anonymous"
        />

        <ScriptDangerously
          html={`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L2HXER3J9C');`}
        />

        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh bg-background font-mono text-foreground antialiased">
        {children}
        <Scripts />
        <ScrollRestoration
          getKey={(location) => {
            return location.pathname;
          }}
        />
      </body>
    </html>
  );
}

export default function App({}: Route.ComponentProps) {
  return (
    <Document>
      <div className="relative flex min-h-screen flex-col">
        <ProgessBar />
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
          <Footer />
        </div>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
