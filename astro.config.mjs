// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";

export default defineConfig({
  output: "server",
  integrations: [react()],
  adapter: netlify(),
  markdown: {
    rehypePlugins: [rehypeHeadingIds],
  },
  server: {
    port: 4322,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["node-domexception", "whatwg-url"],
      esbuildOptions: {
        target: "esnext",
      },
    },
    ssr: {
      noExternal: ["node-domexception", "whatwg-url"],
    },
    server: {
      hmr: {
        port: 4322,
        clientPort: 4322,
      },
    },
  },
});
