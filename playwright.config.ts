import { defineConfig, devices } from "@playwright/test";

const MOBILE_VIEWPORTS = [{ name: "webkit-mobile-iphone15", device: "iPhone 15" as const }];
const webServerPort = Number.parseInt(process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? "5177", 10);
const reuseExistingServer = (process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER ?? "true") === "true";
const includeManualSuites = process.env.PLAYWRIGHT_INCLUDE_MANUAL === "true";
const baseUrl = `http://127.0.0.1:${webServerPort}`;

const mobileProjects = MOBILE_VIEWPORTS.map(({ name, device }) => ({
  name,
  ...(name === "webkit-mobile-iphone15" ? { timeout: 180_000, retries: 1 } : {}),
  use: {
    ...devices[device],
    hasTouch: true,
  },
}));

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.(ts|tsx)/,
  timeout: 60_000,
  grepInvert: includeManualSuites ? undefined : /@manual/,
  workers: 5,
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
    baseURL: baseUrl,
    headless: true,
  },
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${webServerPort} --strictPort`,
    url: baseUrl,
    reuseExistingServer,
    timeout: 120_000,
  },
});
