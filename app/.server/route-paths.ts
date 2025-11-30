// Import from the generated route-files.ts (not .d.ts)
// This avoids circular dependencies because it's a static data file
// Generated at build time by vite-plugin-route-types
import { routeFileList as _routeFileList } from "~/route-files";

/**
 * Gets route files from the generated route-files.ts
 * This is fast - uses pre-generated static list, no file system access
 * The route-files.ts is generated at build time by vite-plugin-route-types
 */
function getRouteFiles(): string[] {
  return [..._routeFileList];
}

/**
 * Converts a route file path to a URL path based on React Router file-based routing conventions
 * This is fast - just string manipulation, no file system access
 */
function routeFileToPath(routeFile: string): string | null {
  // Remove "routes/" prefix and file extension
  let path = routeFile
    .replace(/^routes\//, "")
    .replace(/\.(tsx|ts|jsx|js|mdx)$/, "");

  // Skip utility routes (they're not public pages)
  if (path.startsWith("_utils/") || path.startsWith("auth")) {
    return null;
  }

  // Skip layout files
  if (path.endsWith("/layout") || path === "layout") {
    return null;
  }

  // Skip catch-all routes
  if (path === "$") {
    return null;
  }

  // Handle _index routes (index pages)
  if (path.includes("_index")) {
    const parent = path.replace(/\/_index.*$/, "").replace(/\/route$/, "");
    if (parent === "_/_landing" || parent === "_") {
      return "/";
    }
    // Remove leading underscore segments
    const cleanPath = parent.replace(/^_/, "").replace(/\/_/g, "/");
    return cleanPath ? `/${cleanPath}` : "/";
  }

  // Handle route.tsx files in directories (remove /route suffix)
  if (path.endsWith("/route")) {
    path = path.replace(/\/route$/, "");
  }

  // Skip dynamic routes (they'll be handled separately with actual data)
  if (path.includes("$") || path.includes(":")) {
    return null;
  }

  // Handle special file patterns like [robots.txt].tsx -> robots.txt
  path = path.replace(/\[([^\]]+)\]/g, "$1");

  // Remove leading underscore from path segments (React Router convention)
  // But preserve structure: _/notes -> notes (not /notes/notes)
  path = path.replace(/^_\/?/, "").replace(/\/_/g, "/");

  // Handle special case: blogs.tsx -> /blog (from routes.ts config)
  if (path === "blogs") {
    return "/blog";
  }

  // Convert to URL path
  if (!path || path === "route") {
    return "/";
  }

  // Ensure single leading slash
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Gets all public static routes from route files
 * This is extremely fast because:
 * 1. Uses pre-generated route-files.ts (no file system access)
 * 2. Pure string manipulation (no async operations)
 * 3. Runs at request time but is O(n) where n is small (~20 routes)
 */
export function getPublicRoutes(): string[] {
  const routeFiles = getRouteFiles();

  const routes = routeFiles
    .map(routeFileToPath)
    .filter((path): path is string => path !== null && path !== undefined)
    .filter((path, index, self) => self.indexOf(path) === index) // Remove duplicates
    .sort();

  return routes;
}

