import { defineConfig, devices } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { name: "chromium-mobile-pixel5", device: "Pixel 5" as const },
  { name: "webkit-mobile-iphone12", device: "iPhone 12" as const },
];

const mobileProjects = MOBILE_VIEWPORTS.map(({ name, device }) => ({
  name,
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
    // Mobile viewports (Pixel 5 + iPhone 12) cover Chrome and WebKit scroll-snap/sticky behaviors.
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
