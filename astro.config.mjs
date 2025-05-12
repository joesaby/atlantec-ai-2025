// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: 'server',
  integrations: [react()],
  adapter: netlify(),
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
  },
});