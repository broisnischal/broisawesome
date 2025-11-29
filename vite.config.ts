import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import routeTypesPlugin from './vite-plugin-route-types'
import { rehypePrettyCode } from 'rehype-pretty-code'

export default defineConfig({
  plugins: [
    routeTypesPlugin(),

    cloudflare({
      viteEnvironment: { name: "ssr" },
      remoteBindings: true,
      experimental: {
      },

    }),
    tailwindcss(),
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        () => rehypePrettyCode({
          theme: 'light-plus',
        }),
      ],
    }),
    reactRouter(),
    tsconfigPaths(),
    {
      name: 'cloudflare-vite-plugin-fix',
      configEnvironment(name, config) {
        const isDev = process.env.npm_lifecycle_script?.endsWith("react-router dev");
        if (name === 'ssr' && !isDev) {
          delete config.dev;
        }
      },
    },
  ],
  optimizeDeps: {
    exclude: ['rehype-pretty-code', 'shiki', '@shikijs/transformers'],
  },
  build: {
    commonjsOptions: {
      exclude: ['rehype-pretty-code', 'shiki', '@shikijs/transformers'],
    },
  },


});
