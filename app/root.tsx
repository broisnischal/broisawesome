import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import ProgessBar from "./components/global-pending";
import { ScriptDangerously } from "./lib";
import { useTheme } from "./routes/resources/theme-switch";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { getTheme } from "./utils/theme-server";

export const meta: Route.MetaFunction = ({}) => {
  return [
    { title: "Nischal Dahal - aka broisnischal" },
    {
      name: "description",
      content:
        "self-started software developer focusing on serverless architecture, android development, user experience, and product development. I am not Stack biased and always open to learning new technologies, list of articles wrote by @broisnees.",
    },
    {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Nischal Dahal",
        sameAs: [
          "https://github.com/broisnischal",
          "https://twitter.com/broisnees",
          "https://www.linkedin.com/in/nischalxdahal/",
          "https://t.me/broisnees",
          "https://instagram.com/broisnischal",
        ],
      }),
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
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
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
    <html
      lang="en"
      // className={clsx({ dark: theme === "dark" }, theme)}
      // data-theme={theme}
    >
      <head>
        <ClientHintCheck nonce={new Date().toString()} />
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
      <body>
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

  console.log(theme);

  return (
    <Document loaderData={loaderData} theme={theme}>
      <ProgessBar />
      <Outlet />
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
