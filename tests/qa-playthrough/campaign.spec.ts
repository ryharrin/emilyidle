import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page, type TestInfo } from "@playwright/test";

import { clickLocatorSafely } from "../helpers/interactions";
import { gotoAppWithNavigationReady } from "../helpers/navigation";

type Snapshot = {
  tab?: string;
  currencies?: {
    cashCents?: number;
    enjoymentCents?: number;
    memoriesCents?: number;
  };
  readiness?: Record<string, { label: string } | null>;
};

type FindingSeverity = "S0" | "S1" | "S2" | "S3";

type Finding = {
  severity: FindingSeverity;
  category: string;
  title: string;
  detail: string;
};

type PassResult = {
  name: string;
  findings: Finding[];
  rubric: Record<string, number>;
};

const nowStamp = () => new Date().toISOString().replace(/[:.]/g, "-");

async function clearStorage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
}

async function getSnapshot(page: Page): Promise<Snapshot | null> {
  return page.evaluate(() => {
    const runtimeWindow = window as Window & { render_game_to_text?: () => string };
    if (typeof runtimeWindow.render_game_to_text !== "function") {
      return null;
    }
    try {
      const raw = runtimeWindow.render_game_to_text();
      return JSON.parse(raw) as Snapshot;
    } catch {
      return null;
    }
  });
}

async function advanceTime(page: Page, ms: number) {
  await page.evaluate((deltaMs) => {
    const runtimeWindow = window as Window & { advanceTime?: (n: number) => void };
    runtimeWindow.advanceTime?.(deltaMs);
  }, ms);
}

async function clickIfVisible(page: Page, roleName: RegExp): Promise<boolean> {
  const locator = page.getByRole("button", { name: roleName }).first();
  if ((await locator.count()) === 0) {
    return false;
  }
  if (!(await locator.isVisible().catch(() => false))) {
    return false;
  }
  await clickLocatorSafely(locator);
  return true;
}

async function runProgressionLoop(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i += 1) {
    await clickIfVisible(page, /start|session|run|collect|claim|buy|upgrade/i);
    await advanceTime(page, 45_000);
    await page.waitForTimeout(30);
  }
}

async function closeTransientOverlays(page: Page) {
  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(40);
  }

  const closeSelectors = [
    '[data-testid="help-close"]',
    '[data-testid="shortcut-dialog-close"]',
    'button:has-text("Close")',
    'button:has-text("Cancel")',
    'button:has-text("Dismiss")',
  ];

  for (const selector of closeSelectors) {
    const closeBtn = page.locator(selector).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await clickLocatorSafely(closeBtn);
      await page.waitForTimeout(40);
    }
  }
}

async function visitVisibleTabs(page: Page): Promise<string[]> {
  const visited: string[] = [];
  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  if (!(await tabList.isVisible().catch(() => false))) {
    return visited;
  }

  const tabs = tabList.getByRole("tab");
  const tabCount = await tabs.count();
  for (let index = 0; index < tabCount; index += 1) {
    const tab = tabs.nth(index);
    if (!(await tab.isVisible().catch(() => false))) {
      continue;
    }
    const label = (await tab.textContent())?.trim() || `tab-${index}`;
    await clickLocatorSafely(tab);
    await expect(tab).toHaveAttribute("aria-selected", "true", { timeout: 5_000 });
    visited.push(label);
    await page.waitForTimeout(60);
  }
  return visited;
}

async function exerciseHelpModal(page: Page, findings: Finding[]) {
  const helpOpen = page.getByTestId("help-open");
  if ((await helpOpen.count()) === 0 || !(await helpOpen.isVisible().catch(() => false))) {
    findings.push({
      severity: "S2",
      category: "UI",
      title: "Help entry point missing",
      detail: "`data-testid=help-open` was not visible.",
    });
    return;
  }
  await clickLocatorSafely(helpOpen);
  const helpModal = page.getByTestId("help-modal");
  await expect(helpModal).toBeVisible({ timeout: 8_000 });
  const helpSearch = page.getByTestId("help-search");
  if (await helpSearch.isVisible().catch(() => false)) {
    await helpSearch.fill("prestige");
  }
  const helpClose = page.getByTestId("help-close");
  await clickLocatorSafely(helpClose);
  await expect(helpModal).toBeHidden({ timeout: 8_000 });
}

async function exerciseSaveImportError(page: Page, findings: Finding[]) {
  const settingsTab = page.getByRole("tab", { name: "Settings" }).first();
  if ((await settingsTab.count()) === 0) {
    findings.push({
      severity: "S2",
      category: "Navigation",
      title: "Settings tab missing",
      detail: "Settings tab was not available when testing import/export safety.",
    });
    return;
  }

  await clickLocatorSafely(settingsTab);
  const importText = page.locator("#import-save-text");
  if ((await importText.count()) === 0) {
    findings.push({
      severity: "S2",
      category: "Persistence",
      title: "Import textarea missing",
      detail: "Could not find `#import-save-text`.",
    });
    return;
  }

  await importText.fill("BAD_DATA");
  const importBtn = page.getByTestId("import-save-trigger");
  await clickLocatorSafely(importBtn);
  await page.waitForTimeout(200);

  const statusText = await page.locator("#save-status").textContent().catch(() => "");
  if (!statusText || !/error|invalid|failed/i.test(statusText)) {
    findings.push({
      severity: "S2",
      category: "Persistence",
      title: "Invalid import feedback unclear",
      detail: "Importing invalid data did not produce clearly detectable error status text.",
    });
  }
}

function computeRubric(snapshot: Snapshot | null, visitedTabs: string[]): Record<string, number> {
  const readinessCount = Object.values(snapshot?.readiness ?? {}).filter(Boolean).length;
  const cash = snapshot?.currencies?.cashCents ?? 0;

  const pacing = Math.min(5, 1 + Math.floor(readinessCount / 2));
  const clarity = visitedTabs.length >= 6 ? 4 : 2;
  const rewardLoop = cash > 0 ? 3 : 1;
  const friction = visitedTabs.length >= 6 ? 3 : 2;
  const strategicDepth = readinessCount >= 3 ? 3 : 2;
  const idleFeel = cash > 0 ? 3 : 1;
  const prestigeSatisfaction = readinessCount >= 4 ? 3 : 2;

  return {
    pacing,
    clarity,
    rewardLoop,
    friction,
    strategicDepth,
    idleFeel,
    prestigeSatisfaction,
  };
}

async function writePassReport(testInfo: TestInfo, result: PassResult) {
  const outDir = path.join(process.cwd(), "test-results", "qa-playthrough", nowStamp());
  await mkdir(outDir, { recursive: true });
  const findingsBody =
    result.findings.length === 0
      ? "- None"
      : result.findings
          .map(
            (f, idx) =>
              `${idx + 1}. [${f.severity}] ${f.category} - ${f.title}\n   - ${f.detail}`,
          )
          .join("\n");

  const rubricBody = Object.entries(result.rubric)
    .map(([k, v]) => `- ${k}: ${v}/5`)
    .join("\n");

  const report = `# ${result.name}\n\n## Findings\n${findingsBody}\n\n## Rubric\n${rubricBody}\n`;
  const filePath = path.join(outDir, `${result.name.toLowerCase().replace(/\s+/g, "-")}.md`);
  await writeFile(filePath, report, "utf8");
  await testInfo.attach(`${result.name}-report`, { path: filePath, contentType: "text/markdown" });
}

async function runPass(page: Page, testInfo: TestInfo, passName: string, mobile = false) {
  const findings: Finding[] = [];
  if (mobile) {
    await page.setViewportSize({ width: 390, height: 844 });
  }

  await clearStorage(page);
  await gotoAppWithNavigationReady(page, { path: "/" });

  const errors: string[] = [];
  const warns: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
    if (msg.type() === "warning") {
      warns.push(msg.text());
    }
  });

  await page.screenshot({ path: testInfo.outputPath(`${passName}-start.png`) });
  await runProgressionLoop(page, mobile ? 18 : 28);
  await closeTransientOverlays(page);
  const visitedTabs = await visitVisibleTabs(page);
  await exerciseHelpModal(page, findings);
  await exerciseSaveImportError(page, findings);

  if (mobile) {
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    if (hasOverflow) {
      findings.push({
        severity: "S2",
        category: "Responsive",
        title: "Horizontal overflow on mobile viewport",
        detail: "Document scroll width exceeds client width at 390x844.",
      });
    }
  }

  if (visitedTabs.length < 4) {
    findings.push({
      severity: "S1",
      category: "Coverage",
      title: "Insufficient tab reach in pass",
      detail: `Only visited ${visitedTabs.length} tabs: ${visitedTabs.join(", ") || "none"}.`,
    });
  }

  if (errors.length > 0) {
    findings.push({
      severity: "S1",
      category: "Stability",
      title: "Console/page errors observed",
      detail: errors.slice(0, 5).join(" | "),
    });
  }

  const snapshot = await getSnapshot(page);
  const rubric = computeRubric(snapshot, visitedTabs);

  await page.screenshot({ path: testInfo.outputPath(`${passName}-end.png`) });
  await writePassReport(testInfo, { name: passName, findings, rubric });
}

test.describe("QA playthrough campaign", () => {
  test("pass 1 - ftue and core loop", async ({ page }, testInfo) => {
    await runPass(page, testInfo, "Pass 1 FTUE Core Loop");
  });

  test("pass 2 - economy and progression", async ({ page }, testInfo) => {
    await runPass(page, testInfo, "Pass 2 Economy Progression");
  });

  test("pass 3 - persistence and recovery", async ({ page }, testInfo) => {
    await runPass(page, testInfo, "Pass 3 Persistence Recovery");
    await page.reload({ waitUntil: "domcontentloaded" });
    const afterReload = await getSnapshot(page);
    expect(afterReload).not.toBeNull();
  });

  test("pass 4 - stress and flake", async ({ page }, testInfo) => {
    await runPass(page, testInfo, "Pass 4 Stress Flake");
    for (let i = 0; i < 6; i += 1) {
      await visitVisibleTabs(page);
    }
  });

  test("pass 5 - mobile and fun factor", async ({ page }, testInfo) => {
    await runPass(page, testInfo, "Pass 5 Mobile Fun", true);
  });
});
