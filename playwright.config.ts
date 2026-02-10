import { defineConfig, devices } from "@playwright/test";

const MOBILE_VIEWPORTS = [{ name: "webkit-mobile-iphone15", device: "iPhone 15" as const }];

const mobileProjects = MOBILE_VIEWPORTS.map(({ name, device }) => ({
  name,
  ...(name === "webkit-mobile-iphone15" ? { timeout: 180_000, retries: 1, workers: 1 } : {}),
  use: {
    ...devices[device],
    hasTouch: true,
  },
}));

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
    // iPhone project covers mobile WebKit behavior.
    ...mobileProjects,
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
