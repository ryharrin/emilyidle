import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.(ts|tsx)/,
  timeout: 60_000,
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
  use: {
    baseURL: "http://localhost:5177",
    headless: true,
  },
  webServer: {
    command: "pnpm run dev -- --host 127.0.0.1 --port 5177",
    url: "http://localhost:5177",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
