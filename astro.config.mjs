// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  output: "hybrid", // Static generation with dynamic endpoints
  integrations: [
    tailwind(),
    react(), // For interactive components
    db(), // For Astro DB integration
  ],
  vite: {
    ssr: {
      noExternal: ["chart.js", "@radix-ui/*"],
    },
  },
});
