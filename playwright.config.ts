import { defineConfig, devices } from "@playwright/test";

const usePreviewServer = process.env.PLAYWRIGHT_SERVER === "preview";
const port = usePreviewServer ? 4173 : 3000;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  testDir: "./tests",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: usePreviewServer
      ? `pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`
      : `pnpm exec vite dev --host 127.0.0.1 --port ${port}`,
    reuseExistingServer: !process.env.CI && !usePreviewServer,
    timeout: 120_000,
    url: `http://127.0.0.1:${port}`,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
