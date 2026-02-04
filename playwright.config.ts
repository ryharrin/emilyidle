import { defineConfig, devices } from "@playwright/test";

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
    // Mobile viewports (Pixel 5 + iPhone 12) cover Chrome and WebKit scroll-snap/sticky behaviors.
    {
      name: "chromium-mobile-pixel5",
      use: {
        ...devices["Pixel 5"],
        hasTouch: true,
      },
    },
    {
      name: "webkit-mobile-iphone12",
      use: {
        ...devices["iPhone 12"],
        hasTouch: true,
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
