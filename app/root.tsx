import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { GlobalSpinner } from "./components/global-pending";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { getTheme } from "./utils/theme-server";
import { useTheme } from "./routes/resources/theme-switch";
import clsx from "clsx";

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
  loaderData,
}: {
  children: React.ReactNode;
  loaderData: Route.ComponentProps['loaderData'];
  theme: ReturnType<typeof useTheme>;
}) {
  // Get theme from cookie to apply immediately (prevents flash)
  const cookieTheme = loaderData?.requestInfo?.userPrefs?.theme
  const resolvedTheme = cookieTheme === 'system' || !cookieTheme
    ? (loaderData?.requestInfo?.hints?.theme || 'light')
    : cookieTheme

  return (
    <html lang="en" className={clsx({ dark: theme === 'dark' }, theme)} data-theme={theme}>
      <head>
        <ClientHintCheck nonce={new Date().toString()} />
        {/* Apply theme immediately to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = ${JSON.stringify(resolvedTheme)};
                const root = document.documentElement;
                const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                root.classList.remove('light', 'dark');
                root.classList.add(isDark ? 'dark' : 'light');
                root.setAttribute('data-theme', isDark ? 'dark' : 'light');
                const meta = document.querySelector('meta[name="color-scheme"]') || document.createElement('meta');
                if (!meta.hasAttribute('name')) {
                  meta.setAttribute('name', 'color-scheme');
                  document.head.appendChild(meta);
                }
                meta.setAttribute('content', isDark ? 'dark' : 'light');
              })();
            `,
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="color-scheme"
          content={theme === 'light' ? 'light' : 'dark'}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  const theme = useTheme();

  return (
    <Document loaderData={loaderData} theme={theme}>
      {isNavigating && <GlobalSpinner />}
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
