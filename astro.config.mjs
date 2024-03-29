import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  define: {
    VITE_OPEN_AI_KEY: process.env.VITE_OPEN_AI_KEY,
  },
});
