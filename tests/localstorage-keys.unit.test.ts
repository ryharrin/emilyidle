import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const cwd = (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.();
const fallbackBase = cwd
  ? new URL(`file://${cwd.replace(/\/$/, "")}/tests/localstorage-keys.unit.test.ts`)
  : null;

const resolveSourceUrl = (relativePath: string) => {
  const candidate = new URL(relativePath, import.meta.url);
  if (candidate.protocol === "file:") {
    return candidate;
  }
  if (fallbackBase) {
    return new URL(relativePath, fallbackBase);
  }
  return candidate;
};

const PERSISTENCE_FILE = resolveSourceUrl("../src/game/persistence.ts");
const APP_FILE = resolveSourceUrl("../src/App.tsx");
const HELP_FILE = resolveSourceUrl("../src/ui/help/HelpModal.tsx");
const CAREER_MAP_FILE = resolveSourceUrl("../src/ui/components/careerMap/CareerMapCanvas.tsx");
const CAREER_UPGRADES_FILE = resolveSourceUrl("../src/ui/tabs/career/CareerUpgradesCanvas.tsx");

const readSource = async (url: URL) => readFile(url, "utf8");

describe("localStorage key string contracts", () => {
  it("keeps storage keys stable across core surfaces", async () => {
    const [persistenceText, appText, helpText, careerMapText, careerUpgradesText] =
      await Promise.all([
        readSource(PERSISTENCE_FILE),
        readSource(APP_FILE),
        readSource(HELP_FILE),
        readSource(CAREER_MAP_FILE),
        readSource(CAREER_UPGRADES_FILE),
      ]);

    expect(persistenceText).toContain("emily-idle:save");
    expect(persistenceText).toContain("watch-idle:save");
    expect(persistenceText).toContain("emily-idle:save-clear-epoch");
    expect(appText).toContain("emily-idle:settings");
    expect(appText).toContain("emily-idle:audio");
    expect(appText).toContain("emily-idle:navigation");
    expect(helpText).toContain("emily-idle:help");
    expect(careerMapText).toContain("emily-idle:career-map-viewport:v1");
    expect(careerUpgradesText).toContain("emily-idle:career-upgrades-viewport:v1");
  });
});
