import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    unstable_viteEnvironmentApi: true,
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true,
  },
  // Prerender is currently disabled due to Cloudflare Workers compatibility issue
  // The error "Cannot read properties of undefined (reading 'compatibilityFlags')"
  // occurs when prerendering tries to access Cloudflare config during build.
  // 
  // For Cloudflare Workers, SSR handles rendering at request time which is fine for SEO.
  // If you need static pre-rendering, consider using Cloudflare Pages instead of Workers.
  //
  // Uncomment below to enable prerendering (may cause build errors with Cloudflare Workers):
  // async prerender() {
  //   return [
  //     "/",
  //     "/about",
  //     "/links",
  //     "/projects",
  //     "/notes",
  //     "/setup",
  //     "/blog",
  //   ];
  // },
} satisfies Config;
