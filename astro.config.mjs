// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  output: 'server',
  integrations: [react()],
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
