import xior from "xior";
import retryPlugin from "xior/plugins/error-retry";
import cachePlugin from "xior/plugins/cache";
import dedupeRequestPlugin from "xior/plugins/dedupe";
// import errorCachePlugin from "xior/plugins/error-cache";

/**
 * Shared HTTP client with caching, retry, and request deduplication
 * Based on: https://github.com/remix-run/react-router/discussions/13280
 *
 * Features:
 * - Automatic retry on failed requests
 * - Request deduplication (prevents duplicate concurrent requests)
 * - Response caching (reduces redundant requests)
 * - Error caching (optional - serves cached data if request fails)
 */
export const http = xior.create({
  // You can set a baseURL here if you have a consistent API endpoint
  // baseURL: process.env.API_URL,
});

// Request deduplication - prevents multiple identical requests from running concurrently
http.plugins.use(dedupeRequestPlugin());

// Retry plugin - automatically retries failed requests
http.plugins.use(
  retryPlugin({
    retryTimes: 3, // Retry up to 3 times
    retryInterval: (count) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, count - 1), 10000);
    },
    onRetry(config, error, count) {
      if (import.meta.env.DEV) {
        console.log(
          `🔄 ${config?.method?.toUpperCase()} ${config?.url} retry ${count}`,
        );
      }
    },
    // Only retry on network errors or 5xx status codes
    enableRetry: (config, error) => {
      if (!error.response) {
        // Network error - always retry
        return true;
      }
      const status = error.response.status;
      // Retry on 5xx server errors, but not on 4xx client errors
      return status >= 500 && status < 600;
    },
  }),
);

http.plugins.use(
  cachePlugin({
    cacheItems: 100, // Maximum number of cached items
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes (adjust based on your needs)
    // Only cache GET requests (default behavior, but explicit for clarity)
    enableCache: (config) => {
      return config?.method?.toUpperCase() === "GET";
    },
  }),
);

export async function fetchWithCache(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await http.request({
    url,
    method: options?.method ?? "GET",
    headers: options?.headers as Record<string, string> | undefined,
    data: options?.body,
    responseType: "arraybuffer",
  });

  // Convert xior response to Fetch Response
  return new Response(response.data as ArrayBuffer, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers as unknown as Record<string, string>),
  });
}
