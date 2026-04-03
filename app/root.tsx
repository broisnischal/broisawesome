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
import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";
import "./app.css";
import { Footer } from "./components/footer";
import ProgessBar from "./components/global-pending";
import { SiteWritingToggle } from "./components/site-writing-toggle";
import { ScriptDangerously } from "./lib";
import { useTheme } from "./routes/resources/theme-switch";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { getTheme } from "./utils/theme-server";

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
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500&display=swap",
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
    requestInfo: {
      hints: getHints(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
      },
    },
    // publicEnv: getPublicEnv(),
  });
}

function Document({
  children,
  theme,
}: {
  children: React.ReactNode;
  loaderData: Route.ComponentProps["loaderData"];
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <html lang="en" className="font-sans antialiased">
      <head>
        <ClientHintCheck />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="color-scheme"
          content={theme === "light" ? "light" : "dark"}
        />
        <meta name="MobileOptimized" content="320" />
        <meta name="pagename" content="Nischal Dahal" />
        <meta name="mobile-web-app-capable" content="yes" />

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
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
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

export default function App({ loaderData }: Route.ComponentProps) {
  const theme = useTheme();

  return (
    <Document loaderData={loaderData} theme={theme}>
      <div className="relative flex min-h-screen flex-col">
        <ProgessBar />
        <div className="pointer-events-none fixed right-4 top-4 z-50 md:right-6 md:top-6 lg:right-8 lg:top-8 xl:right-12 xl:top-10">
          <SiteWritingToggle className="pointer-events-auto" />
        </div>
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
