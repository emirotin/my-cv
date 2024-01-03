import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
