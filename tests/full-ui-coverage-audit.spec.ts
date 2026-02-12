import { appendFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

import { CATALOG_ENTRIES } from "../src/game/catalog";
import { createInitialState } from "../src/game/state";
import { clickLocatorSafely } from "./helpers/interactions";

const STARTER_MODEL_ID = "rolex-calibrorolex";
const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";
const CHRONOGRAPH_MODEL_ID = "omega-omega-speedmaster-reduced-351050";
const TOURBILLON_MODEL_ID =
  "audemars-piguet-audemars-piguet-ref-25831-con-datario-riserva-di-carica-e-tourbillon-risalente-al-1997";

const TABS = [
  { id: "career", label: "Career" },
  { id: "catalog", label: "Catalog" },
  { id: "collection", label: "Collection" },
  { id: "upgrades", label: "Upgrades" },
  { id: "workshop", label: "Atelier" },
  { id: "maison", label: "Maison" },
  { id: "nostalgia", label: "Nostalgia" },
  { id: "stats", label: "Stats" },
  { id: "save", label: "Settings" },
] as const;

const MAX_BUTTON_INTERACTIONS_PER_TAB = 90;
const MAX_BUTTON_PASSES_PER_TAB = 6;
const CATALOG_BUTTON_INTERACTIONS_CAP = 40;
const CATALOG_BUTTON_PASSES_CAP = 3;
const CHROMIUM_BUTTON_INTERACTIONS_CAP = 45;
const CHROMIUM_BUTTON_PASSES_CAP = 3;
const CHROMIUM_CAREER_BUTTON_INTERACTIONS_CAP = 28;
const CHROMIUM_CAREER_BUTTON_PASSES_CAP = 2;
const WEBKIT_MOBILE_BUTTON_INTERACTIONS_CAP = 30;
const WEBKIT_MOBILE_BUTTON_PASSES_CAP = 3;
const WEBKIT_MOBILE_CAREER_BUTTON_INTERACTIONS_CAP = 20;
const WEBKIT_MOBILE_CAREER_BUTTON_PASSES_CAP = 2;
const WEBKIT_MOBILE_COLLECTION_BUTTON_INTERACTIONS_CAP = 12;
const WEBKIT_MOBILE_COLLECTION_BUTTON_PASSES_CAP = 2;
const CATALOG_FLOW_SHARDS = [
  {
    id: "slice-1",
    maxInteractions: 10,
    maxPasses: 1,
    skipInteractions: 0,
  },
  {
    id: "slice-2",
    maxInteractions: 10,
    maxPasses: 2,
    skipInteractions: 6,
  },
  {
    id: "slice-3",
    maxInteractions: 10,
    maxPasses: 2,
    skipInteractions: 12,
  },
  {
    id: "slice-4",
    maxInteractions: 10,
    maxPasses: 3,
    skipInteractions: 18,
  },
] as const;
const WEBKIT_MOBILE_CATALOG_SHARD_OVERRIDES: Record<
  (typeof CATALOG_FLOW_SHARDS)[number]["id"],
  {
    maxInteractions: number;
    maxPasses: number;
    skipInteractions: number;
    maxCandidateScans: number;
  }
> = {
  "slice-1": { maxInteractions: 2, maxPasses: 1, skipInteractions: 0, maxCandidateScans: 18 },
  "slice-2": { maxInteractions: 2, maxPasses: 1, skipInteractions: 2, maxCandidateScans: 24 },
  "slice-3": { maxInteractions: 2, maxPasses: 1, skipInteractions: 4, maxCandidateScans: 30 },
  "slice-4": { maxInteractions: 2, maxPasses: 1, skipInteractions: 6, maxCandidateScans: 36 },
};
const STEP_TIMEOUT_MS = 120_000;
const CATALOG_STEP_TIMEOUT_MS = 120_000;
const AUDIT_RUN_ID = `${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${process.pid}`;
const ROOT_SCREENSHOT_DIR = `output/playwright/full-ui-coverage-audit-${AUDIT_RUN_ID}`;

type ScreenshotRecord = {
  file: string;
  label: string;
  fullPage: boolean;
};

type TabCoverage = {
  candidateCount: number;
  interactedCount: number;
};

type CaptureResult = {
  records: ScreenshotRecord[];
  coverageByTab: Record<string, TabCoverage>;
};

type ButtonExerciseOptions = {
  maxPasses?: number;
  maxInteractions?: number;
  skipInteractions?: number;
  maxCandidateScans?: number;
  skipDescriptorSubstrings?: string[];
  minimalOverlayClose?: boolean;
  captureInteractions?: boolean;
  continueOnInteractionError?: boolean;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

type LiveTraceWriter = {
  filePath: string;
  pendingWrite: Promise<void>;
};

const liveTraceWriters = new WeakMap<string[], LiveTraceWriter>();

async function registerLiveTrace(traceLines: string[], filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, "", "utf8");
  liveTraceWriters.set(traceLines, {
    filePath,
    pendingWrite: Promise.resolve(),
  });
}

function appendTrace(traceLines: string[] | undefined, message: string): void {
  if (!traceLines) {
    return;
  }
  const line = `[${new Date().toISOString()}] ${message}`;
  traceLines.push(line);
  const writer = liveTraceWriters.get(traceLines);
  if (!writer) {
    return;
  }
  writer.pendingWrite = writer.pendingWrite
    .then(() => appendFile(writer.filePath, `${line}\n`, "utf8"))
    .catch(() => {});
}

async function flushLiveTrace(traceLines: string[] | undefined): Promise<void> {
  if (!traceLines) {
    return;
  }
  const writer = liveTraceWriters.get(traceLines);
  if (!writer) {
    return;
  }
  await writer.pendingWrite.catch(() => {});
}

function buildLiveTracePath(projectDir: string, traceName: string): string {
  return path.join(projectDir, "traces", `${traceName}.live.log`);
}

async function attachTraceArtifacts(
  testInfo: TestInfo,
  traceName: string,
  traceLines: string[],
  liveTracePath: string,
): Promise<void> {
  await flushLiveTrace(traceLines);
  await testInfo.attach(traceName, {
    body: traceLines.join("\n"),
    contentType: "text/plain",
  });
  await testInfo.attach(`${traceName}-live`, {
    path: liveTracePath,
    contentType: "text/plain",
  });
}

const isWebkitMobileProject = (projectName: string): boolean =>
  projectName.startsWith("webkit-mobile-");

const isChromiumProject = (projectName: string): boolean => projectName === "chromium";

function getCatalogShardConfig(
  shard: (typeof CATALOG_FLOW_SHARDS)[number],
  projectName: string,
): {
  maxInteractions: number;
  maxPasses: number;
  skipInteractions: number;
  maxCandidateScans?: number;
} {
  if (isWebkitMobileProject(projectName)) {
    return WEBKIT_MOBILE_CATALOG_SHARD_OVERRIDES[shard.id];
  }

  return shard;
}

async function withStepTimeout<T>(
  stepLabel: string,
  timeoutMs: number,
  action: () => Promise<T>,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  try {
    return (await Promise.race([
      action(),
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Step "${stepLabel}" timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ])) as T;
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

async function runTabStep<T>(options: {
  tabId: string;
  step: string;
  traceLines?: string[];
  timeoutMs?: number;
  action: () => Promise<T>;
}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? STEP_TIMEOUT_MS;
  appendTrace(options.traceLines, `[${options.tabId}] start ${options.step}`);
  try {
    const result = await withStepTimeout(
      `${options.tabId}:${options.step}`,
      timeoutMs,
      options.action,
    );
    appendTrace(options.traceLines, `[${options.tabId}] ok ${options.step}`);
    return result;
  } catch (error) {
    appendTrace(
      options.traceLines,
      `[${options.tabId}] error ${options.step}: ${getErrorMessage(error)}`,
    );
    throw error;
  }
}

async function closeAuditPageSafely(
  page: Page,
  tabId: string,
  traceLines?: string[],
): Promise<void> {
  if (page.isClosed()) {
    return;
  }
  await runTabStep({
    tabId,
    step: "close-audit-page",
    traceLines,
    timeoutMs: 10_000,
    action: async () => {
      await page.close({ runBeforeUnload: false });
    },
  });
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

const normalizeSpaces = (value: string): string => value.replace(/\s+/g, " ").trim();

function buildSeedState(): Record<string, unknown> {
  const base = createInitialState() as unknown as Record<string, unknown>;
  const baseItems = (base.items ?? {}) as Record<string, number>;
  const baseModels = (base.watchModels ?? {}) as Record<string, number>;
  const baseUpgrades = (base.upgrades ?? {}) as Record<string, number>;
  const baseWorkshopUpgrades = (base.workshopUpgrades ?? {}) as Record<string, boolean>;
  const baseMaisonUpgrades = (base.maisonUpgrades ?? {}) as Record<string, boolean>;
  const baseMaisonLines = (base.maisonLines ?? {}) as Record<string, boolean>;
  const baseCraftedBoosts = (base.craftedBoosts ?? {}) as Record<string, number>;
  const baseMilestones = Array.isArray(base.unlockedMilestones)
    ? (base.unlockedMilestones as string[])
    : [];

  const upgrades = Object.fromEntries(Object.keys(baseUpgrades).map((key) => [key, 4]));
  const workshopUpgrades = Object.fromEntries(
    Object.keys(baseWorkshopUpgrades).map((key) => [key, true]),
  );
  const maisonUpgrades = Object.fromEntries(
    Object.keys(baseMaisonUpgrades).map((key) => [key, true]),
  );
  const maisonLines = Object.fromEntries(Object.keys(baseMaisonLines).map((key) => [key, true]));
  const craftedBoosts = Object.fromEntries(
    Object.keys(baseCraftedBoosts).map((key) => [key, Math.max(1, baseCraftedBoosts[key] ?? 0)]),
  );

  return {
    ...base,
    currencyCents: 25_000_000,
    enjoymentCents: 15_000_000,
    items: {
      ...baseItems,
      quartz: Math.max(baseItems.quartz ?? 0, 150),
      automatic: Math.max(baseItems.automatic ?? 0, 110),
      manual: Math.max(baseItems.manual ?? 0, 80),
      tourbillon: Math.max(baseItems.tourbillon ?? 0, 60),
    },
    watchModels: {
      ...baseModels,
      [STARTER_MODEL_ID]: Math.max(baseModels[STARTER_MODEL_ID] ?? 0, 4),
      [CLASSIC_MODEL_ID]: Math.max(baseModels[CLASSIC_MODEL_ID] ?? 0, 3),
      [CHRONOGRAPH_MODEL_ID]: Math.max(baseModels[CHRONOGRAPH_MODEL_ID] ?? 0, 2),
      [TOURBILLON_MODEL_ID]: Math.max(baseModels[TOURBILLON_MODEL_ID] ?? 0, 2),
    },
    upgrades,
    unlockedMilestones: Array.from(
      new Set([...baseMilestones, "collector-shelf", "showcase", "atelier"]),
    ),
    discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
    workshopBlueprints: 200,
    workshopPrestigeCount: 5,
    workshopUpgrades,
    maisonHeritage: 2_500,
    maisonReputation: 900,
    maisonUpgrades,
    maisonLines,
    nostalgiaPoints: 150,
    nostalgiaResets: 4,
    craftingParts: 120,
    craftedBoosts,
  };
}

async function clickTab(page: Page, tabId: string, tabLabel: string): Promise<void> {
  const tabById = page.locator(`#${tabId}-tab`);
  if (await tabById.isVisible().catch(() => false)) {
    await clickLocatorSafely(tabById);
    return;
  }

  const tabByName = page.getByRole("tab", { name: new RegExp(`^${tabLabel}`, "i") });
  await expect(tabByName).toBeVisible();
  await clickLocatorSafely(tabByName);
}

async function resetToSeed(page: Page, state: Record<string, unknown>): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate((seededState) => {
    const settings = {
      themeMode: "system",
      hideCompletedAchievements: false,
      hiddenTabs: [],
      coachmarksDismissed: {},
      confirmNostalgiaUnlocks: true,
      notificationPreferences: {
        sessionsReady: true,
        prestigeReady: true,
        achievements: true,
        events: true,
      },
    };

    const payload = {
      version: 3,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state: seededState,
    };

    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
    window.localStorage.setItem("emily-idle:settings", JSON.stringify(settings));
    window.localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "career" }));
  }, state);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(180);
}

async function capture(
  page: Page,
  outputDir: string,
  records: ScreenshotRecord[],
  index: { value: number },
  label: string,
  fullPage = false,
  options?: {
    failOnError?: boolean;
    traceLines?: string[];
    traceTabId?: string;
  },
): Promise<void> {
  index.value += 1;
  const filename = `${String(index.value).padStart(4, "0")}-${slugify(label)}.jpg`;
  const absolutePath = path.join(outputDir, filename);
  const failOnError = options?.failOnError ?? true;

  try {
    await page.screenshot({
      path: absolutePath,
      type: "jpeg",
      quality: 68,
      fullPage,
      animations: "disabled",
      timeout: 8_000,
    });
    records.push({ file: absolutePath, label, fullPage });
  } catch (error) {
    appendTrace(
      options?.traceLines,
      `[${options?.traceTabId ?? "capture"}] warn capture "${label}": ${getErrorMessage(error)}`,
    );
    if (failOnError) {
      throw error;
    }

    const markerPath = `${absolutePath}.capture-error.txt`;
    await writeFile(markerPath, `capture failed for ${label}: ${getErrorMessage(error)}\n`, "utf8");
    records.push({ file: markerPath, label: `${label} (capture-failed)`, fullPage });
  }
}

async function expandDetails(
  panel: Locator,
  maxExpansions = Number.POSITIVE_INFINITY,
  traceLines?: string[],
  tabId?: string,
): Promise<void> {
  const traceTabId = tabId ?? "unknown-tab";
  const summaries = panel.locator("summary:visible");
  const count = await summaries.count();
  appendTrace(
    traceLines,
    `[${traceTabId}] expand-details candidates=${count} cap=${maxExpansions}`,
  );
  let expandedCount = 0;
  for (let index = 0; index < count; index += 1) {
    if (expandedCount >= maxExpansions) {
      appendTrace(traceLines, `[${traceTabId}] expand-details reached cap=${maxExpansions}`);
      break;
    }
    const summary = summaries.nth(index);
    const detailsState = await summary.evaluate((element) => {
      const details = element.closest("details");
      const open = details ? (details as HTMLDetailsElement).open : false;
      const label = (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      return { open, label };
    });
    if (!detailsState.open) {
      appendTrace(
        traceLines,
        `[${traceTabId}] expand-details click idx=${index} label=${detailsState.label || "summary"}`,
      );
      try {
        await withStepTimeout(`${traceTabId}:expand-details-click-${index}`, 6_000, async () => {
          await clickLocatorSafely(summary);
          await summary.page().waitForTimeout(120);
        });
        expandedCount += 1;
      } catch (error) {
        appendTrace(
          traceLines,
          `[${traceTabId}] expand-details warn idx=${index}: ${getErrorMessage(error)}`,
        );
      }
    }
  }
  appendTrace(traceLines, `[${traceTabId}] expand-details done expanded=${expandedCount}`);
}

async function closeOpenOverlays(
  page: Page,
  outputDir: string,
  records: ScreenshotRecord[],
  captureIndex: { value: number },
  tabId: string,
): Promise<void> {
  const maybeCaptureAndClose = async (
    overlay: Locator,
    name: string,
    closeCandidates: Array<Locator>,
  ): Promise<void> => {
    if (!(await overlay.isVisible().catch(() => false))) {
      return;
    }
    await capture(page, outputDir, records, captureIndex, `${tabId}-${name}-overlay`, false);

    for (const closeCandidate of closeCandidates) {
      if (await closeCandidate.isVisible().catch(() => false)) {
        await clickLocatorSafely(closeCandidate);
        await page.waitForTimeout(120);
        return;
      }
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
  };

  const helpModal = page.getByTestId("help-modal");
  await maybeCaptureAndClose(helpModal, "help", [page.getByTestId("help-close")]);

  const detailsSheet = page.getByTestId("catalog-details-sheet");
  await maybeCaptureAndClose(detailsSheet, "catalog-details-sheet", [
    page.getByTestId("catalog-details-sheet-close"),
  ]);

  const clearSaveModal = page.locator('[data-testid="settings-clear-save-cancel"]').first();
  if (await clearSaveModal.isVisible().catch(() => false)) {
    await capture(page, outputDir, records, captureIndex, `${tabId}-settings-clear-modal`, false);
    await clearSaveModal.evaluate((element) => (element as HTMLElement).click());
    await page.waitForTimeout(120);
  }

  const prestigeModal = page.getByTestId("prestige-onboarding-modal");
  await maybeCaptureAndClose(prestigeModal, "prestige-onboarding", [
    prestigeModal.getByRole("button", { name: /Got it|close|continue/i }).first(),
  ]);

  const nostalgiaModal = page.getByTestId("nostalgia-modal");
  await maybeCaptureAndClose(nostalgiaModal, "nostalgia", [
    nostalgiaModal.getByRole("button", { name: /Cancel/i }).first(),
  ]);

  const nostalgiaUnlockModal = page.getByTestId("nostalgia-unlock-modal");
  await maybeCaptureAndClose(nostalgiaUnlockModal, "nostalgia-unlock", [
    nostalgiaUnlockModal.getByRole("button", { name: /Cancel/i }).first(),
  ]);

  const wornPicker = page.getByTestId("worn-watch-picker-modal");
  await maybeCaptureAndClose(wornPicker, "worn-picker", [
    page.getByTestId("worn-watch-picker-close"),
    page.getByTestId("worn-watch-option-none"),
  ]);

  const windingModal = page.getByTestId("winding-modal");
  if (await windingModal.isVisible().catch(() => false)) {
    await capture(page, outputDir, records, captureIndex, `${tabId}-winding-modal`, false);
    const surface = page.getByTestId("winding-surface");
    if (await surface.isVisible().catch(() => false)) {
      await surface.focus();
      await page.keyboard.press("Space");
      await page.waitForTimeout(160);
    }
    const done = page.getByTestId("winding-done");
    if (await done.isVisible().catch(() => false)) {
      await done.evaluate((element) => (element as HTMLElement).click());
    } else {
      await page
        .getByTestId("winding-close")
        .evaluate((element) => (element as HTMLElement).click());
    }
    await page.waitForTimeout(120);
  }

  const automaticModal = page.getByTestId("automatic-modal");
  if (await automaticModal.isVisible().catch(() => false)) {
    await capture(page, outputDir, records, captureIndex, `${tabId}-automatic-modal`, false);
    const rightButton = page.getByTestId("automatic-right");
    if (await rightButton.isVisible().catch(() => false)) {
      await rightButton.evaluate((element) => (element as HTMLElement).click());
    }
    await page.waitForTimeout(120);
    const done = page.getByTestId("automatic-done");
    if (await done.isVisible().catch(() => false)) {
      await done.evaluate((element) => (element as HTMLElement).click());
    } else {
      await page
        .getByTestId("automatic-close")
        .evaluate((element) => (element as HTMLElement).click());
    }
    await page.waitForTimeout(120);
  }

  const quartzModal = page.getByTestId("quartz-modal");
  if (await quartzModal.isVisible().catch(() => false)) {
    await capture(page, outputDir, records, captureIndex, `${tabId}-quartz-modal`, false);
    const action = page.getByTestId("quartz-action");
    if (await action.isVisible().catch(() => false)) {
      await action.evaluate((element) => (element as HTMLElement).click());
    }
    await page.waitForTimeout(120);
    const done = page.getByTestId("quartz-done");
    if (await done.isVisible().catch(() => false)) {
      await done.evaluate((element) => (element as HTMLElement).click());
    } else {
      await page
        .getByTestId("quartz-close")
        .evaluate((element) => (element as HTMLElement).click());
    }
    await page.waitForTimeout(120);
  }
}

async function exerciseVisibleButtons(
  page: Page,
  panel: Locator,
  outputDir: string,
  records: ScreenshotRecord[],
  captureIndex: { value: number },
  tabId: string,
  options?: {
    maxPasses?: number;
    maxInteractions?: number;
    skipInteractions?: number;
    maxCandidateScans?: number;
    skipDescriptorSubstrings?: string[];
    minimalOverlayClose?: boolean;
    captureInteractions?: boolean;
    continueOnInteractionError?: boolean;
    traceLines?: string[];
  },
): Promise<TabCoverage> {
  const maxPasses = options?.maxPasses ?? MAX_BUTTON_PASSES_PER_TAB;
  const maxInteractions = options?.maxInteractions ?? MAX_BUTTON_INTERACTIONS_PER_TAB;
  const skipInteractions = options?.skipInteractions ?? 0;
  const maxCandidateScans = options?.maxCandidateScans ?? Number.POSITIVE_INFINITY;
  const skipDescriptorSubstrings = options?.skipDescriptorSubstrings ?? [];
  const minimalOverlayClose = options?.minimalOverlayClose ?? false;
  const captureInteractions = options?.captureInteractions ?? true;
  const continueOnInteractionError = options?.continueOnInteractionError ?? false;
  const traceLines = options?.traceLines;
  const handledKeys = new Set<string>();
  let candidateCount = 0;
  let actions = 0;
  let skippedActions = 0;

  for (let pass = 0; pass < maxPasses; pass += 1) {
    let progressed = false;
    const candidates = panel.locator("button:visible, summary:visible");
    const count = await candidates.count();
    const scanLimit = Math.min(count, maxCandidateScans);

    for (let index = 0; index < scanLimit; index += 1) {
      if (actions >= maxInteractions) {
        appendTrace(
          traceLines,
          `[${tabId}] reached interaction cap (${maxInteractions}) on pass ${pass + 1}`,
        );
        return {
          candidateCount,
          interactedCount: actions,
        };
      }

      const candidate = candidates.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const descriptor = await candidate.evaluate((element) => {
        const host = element.closest("[data-item-id], [data-testid], [id]");
        const role = element.tagName.toLowerCase();
        const dataTestId = element.getAttribute("data-testid") ?? "";
        const id = element.getAttribute("id") ?? "";
        const hostMarker =
          host?.getAttribute("data-item-id") ??
          host?.getAttribute("data-testid") ??
          host?.getAttribute("id") ??
          "";
        const ariaLabel = element.getAttribute("aria-label") ?? "";
        const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
        const disabled = element instanceof HTMLButtonElement ? element.disabled : false;
        return {
          key: [role, dataTestId, id, hostMarker, ariaLabel, text].filter(Boolean).join("::"),
          text,
          disabled,
        };
      });

      if (!descriptor.key || handledKeys.has(descriptor.key)) {
        continue;
      }
      handledKeys.add(descriptor.key);

      if (
        skipDescriptorSubstrings.some((fragment) =>
          descriptor.key.toLowerCase().includes(fragment.toLowerCase()),
        )
      ) {
        continue;
      }

      if (descriptor.disabled || descriptor.key.includes("settings-clear-save-confirm")) {
        continue;
      }
      if (skippedActions < skipInteractions) {
        skippedActions += 1;
        continue;
      }

      candidateCount += 1;
      await candidate.scrollIntoViewIfNeeded({ timeout: 1_000 }).catch(() => {});
      try {
        await withStepTimeout(`${tabId}:click-${actions + 1}`, 12_000, async () => {
          await clickLocatorSafely(candidate);
          await page.waitForTimeout(120);
        });
      } catch (error) {
        appendTrace(
          traceLines,
          `[${tabId}] warn click-${actions + 1}: ${getErrorMessage(error)}`,
        );
        if (!continueOnInteractionError) {
          throw error;
        }
        continue;
      }
      actions += 1;
      progressed = true;

      if (captureInteractions) {
        const labelBase = normalizeSpaces(descriptor.text || descriptor.key || `button-${actions}`);
        try {
          await withStepTimeout(`${tabId}:capture-${actions}`, 18_000, async () => {
            await capture(
              page,
              outputDir,
              records,
              captureIndex,
              `${tabId}-button-${actions}-${labelBase}`,
              false,
            );
          });
        } catch (error) {
          appendTrace(
            traceLines,
            `[${tabId}] warn capture-${actions}: ${getErrorMessage(error)}`,
          );
          if (!continueOnInteractionError) {
            throw error;
          }
        }
      }
      try {
        await withStepTimeout(`${tabId}:close-overlays-${actions}`, 18_000, async () => {
          if (minimalOverlayClose) {
            await page.keyboard.press("Escape").catch(() => {});
            await page.waitForTimeout(90);
            return;
          }
          await closeOpenOverlays(page, outputDir, records, captureIndex, tabId);
        });
      } catch (error) {
        appendTrace(
          traceLines,
          `[${tabId}] warn close-overlays-${actions}: ${getErrorMessage(error)}`,
        );
        if (!continueOnInteractionError) {
          throw error;
        }
      }
    }

    if (!progressed) {
      break;
    }
  }

  return {
    candidateCount,
    interactedCount: actions,
  };
}

async function captureAllTabScreens(
  page: Page,
  testInfo: TestInfo,
  seedState: Record<string, unknown>,
  options?: {
    tabs?: ReadonlyArray<(typeof TABS)[number]>;
    includeHome?: boolean;
    traceLines?: string[];
    buttonExerciseOptions?: ButtonExerciseOptions;
  },
): Promise<CaptureResult> {
  const tabs = options?.tabs ?? TABS;
  const includeHome = options?.includeHome ?? true;
  const traceLines = options?.traceLines;
  const outputDir = path.join(ROOT_SCREENSHOT_DIR, testInfo.project.name);
  await mkdir(outputDir, { recursive: true });

  const captureIndex = { value: 0 };
  const records: ScreenshotRecord[] = [];
  const coverageByTab: Record<string, TabCoverage> = {};

  for (const tab of tabs) {
    const auditPage = await page.context().newPage();
    try {
      const tabStepTimeout = tab.id === "catalog" ? CATALOG_STEP_TIMEOUT_MS : STEP_TIMEOUT_MS;
      const isWebkitMobile = isWebkitMobileProject(testInfo.project.name);
      const isChromium = isChromiumProject(testInfo.project.name);
      const useFullPageCaptures = !isWebkitMobile;
      const defaultInteractions =
        tab.id === "catalog"
          ? CATALOG_BUTTON_INTERACTIONS_CAP
          : isWebkitMobile
            ? tab.id === "career"
              ? WEBKIT_MOBILE_CAREER_BUTTON_INTERACTIONS_CAP
              : tab.id === "collection"
                ? WEBKIT_MOBILE_COLLECTION_BUTTON_INTERACTIONS_CAP
              : WEBKIT_MOBILE_BUTTON_INTERACTIONS_CAP
            : isChromium
              ? tab.id === "career"
                ? CHROMIUM_CAREER_BUTTON_INTERACTIONS_CAP
                : CHROMIUM_BUTTON_INTERACTIONS_CAP
              : MAX_BUTTON_INTERACTIONS_PER_TAB;
      const defaultPasses =
        tab.id === "catalog"
          ? CATALOG_BUTTON_PASSES_CAP
          : isWebkitMobile
            ? tab.id === "career"
              ? WEBKIT_MOBILE_CAREER_BUTTON_PASSES_CAP
              : tab.id === "collection"
                ? WEBKIT_MOBILE_COLLECTION_BUTTON_PASSES_CAP
              : WEBKIT_MOBILE_BUTTON_PASSES_CAP
            : isChromium
              ? tab.id === "career"
                ? CHROMIUM_CAREER_BUTTON_PASSES_CAP
                : CHROMIUM_BUTTON_PASSES_CAP
              : MAX_BUTTON_PASSES_PER_TAB;
      const maxInteractions =
        options?.buttonExerciseOptions?.maxInteractions ?? defaultInteractions;
      const maxPasses =
        options?.buttonExerciseOptions?.maxPasses ?? defaultPasses;
      const skipInteractions = options?.buttonExerciseOptions?.skipInteractions ?? 0;
      const defaultMaxCandidateScans = isWebkitMobile
        ? tab.id === "catalog"
          ? 180
          : tab.id === "collection"
            ? 120
            : 100
        : undefined;
      const maxCandidateScans =
        options?.buttonExerciseOptions?.maxCandidateScans ?? defaultMaxCandidateScans;
      const defaultSkipDescriptorSubstrings =
        isWebkitMobile && tab.id === "catalog" ? ["help-open", "explain"] : [];
      const skipDescriptorSubstrings =
        options?.buttonExerciseOptions?.skipDescriptorSubstrings ?? defaultSkipDescriptorSubstrings;
      const defaultMinimalOverlayClose = isWebkitMobile && tab.id === "catalog";
      const minimalOverlayClose =
        options?.buttonExerciseOptions?.minimalOverlayClose ?? defaultMinimalOverlayClose;
      const defaultCaptureInteractions = !(isWebkitMobile && tab.id === "catalog");
      const captureInteractions =
        options?.buttonExerciseOptions?.captureInteractions ?? defaultCaptureInteractions;
      const defaultContinueOnInteractionError = isWebkitMobile && tab.id === "catalog";
      const continueOnInteractionError =
        options?.buttonExerciseOptions?.continueOnInteractionError ??
        defaultContinueOnInteractionError;
      // Catalog can expose hundreds of "Details" controls; capping Chromium keeps
      // this audit within step timeouts under full-suite worker contention.
      const maxDetailExpansions =
        tab.id === "catalog"
          ? isWebkitMobile
            ? 0
            : 80
          : isWebkitMobile
            ? 16
            : Number.POSITIVE_INFINITY;
      const nonFatalCaptures = isWebkitMobile && tab.id === "catalog";

      await runTabStep({
        tabId: tab.id,
        step: "reset-to-seed",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () => {
          await resetToSeed(auditPage, seedState);
          await auditPage.evaluate(() => window.scrollTo(0, 0));
          await auditPage.waitForTimeout(100);
        },
      });
      await runTabStep({
        tabId: tab.id,
        step: "open-tab",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () => {
          await clickTab(auditPage, tab.id, tab.label);
        },
      });
      const panel = auditPage.getByRole("tabpanel", { name: new RegExp(tab.label, "i") });
      await runTabStep({
        tabId: tab.id,
        step: "panel-visible",
        traceLines,
        timeoutMs: 15_000,
        action: async () => {
          await expect(panel).toBeVisible();
        },
      });
      await runTabStep({
        tabId: tab.id,
        step: "capture-entry",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () => {
          await capture(
            auditPage,
            outputDir,
            records,
            captureIndex,
            `${tab.id}-entry-full`,
            useFullPageCaptures,
            {
              failOnError: !nonFatalCaptures,
              traceLines,
              traceTabId: tab.id,
            },
          );
        },
      });

      await runTabStep({
        tabId: tab.id,
        step: "expand-details",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () => {
          await expandDetails(panel, maxDetailExpansions, traceLines, tab.id);
          await auditPage.waitForTimeout(120);
        },
      });
      await runTabStep({
        tabId: tab.id,
        step: "capture-expanded",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () => {
          await capture(
            auditPage,
            outputDir,
            records,
            captureIndex,
            `${tab.id}-expanded-full`,
            useFullPageCaptures,
            {
              failOnError: !nonFatalCaptures,
              traceLines,
              traceTabId: tab.id,
            },
          );
        },
      });

      coverageByTab[tab.id] = await runTabStep({
        tabId: tab.id,
        step: "exercise-buttons",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () =>
          await exerciseVisibleButtons(auditPage, panel, outputDir, records, captureIndex, tab.id, {
            maxPasses,
            maxInteractions,
            skipInteractions,
            maxCandidateScans,
            skipDescriptorSubstrings,
            minimalOverlayClose,
            captureInteractions,
            continueOnInteractionError,
            traceLines,
          }),
      });
      await runTabStep({
        tabId: tab.id,
        step: "capture-final",
        traceLines,
        timeoutMs: tabStepTimeout,
        action: async () => {
          await capture(
            auditPage,
            outputDir,
            records,
            captureIndex,
            `${tab.id}-final-full`,
            useFullPageCaptures,
            {
              failOnError: !nonFatalCaptures,
              traceLines,
              traceTabId: tab.id,
            },
          );
        },
      });
    } finally {
      await closeAuditPageSafely(auditPage, tab.id, traceLines).catch((error) => {
        appendTrace(traceLines, `[${tab.id}] warn close-audit-page: ${getErrorMessage(error)}`);
      });
    }
  }

  if (includeHome) {
    await resetToSeed(page, seedState);
    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, outputDir, records, captureIndex, "home-shell-full", true);
    coverageByTab.home = {
      candidateCount: 0,
      interactedCount: 0,
    };
  }

  return { records, coverageByTab };
}

const preparedProjects = new Set<string>();

async function ensureProjectOutput(projectName: string): Promise<string> {
  const projectDir = path.join(ROOT_SCREENSHOT_DIR, projectName);
  if (!preparedProjects.has(projectName)) {
    await mkdir(path.join(projectDir, "tabs"), { recursive: true });
    preparedProjects.add(projectName);
  }
  return projectDir;
}

async function writeTabManifest(
  projectDir: string,
  projectName: string,
  tabId: string,
  records: ScreenshotRecord[],
  coverage: TabCoverage,
): Promise<void> {
  const tabPath = path.join(projectDir, "tabs", `${tabId}.manifest.json`);
  await writeFile(
    tabPath,
    JSON.stringify(
      {
        project: projectName,
        tabId,
        capturedAt: new Date().toISOString(),
        coverage,
        records,
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function rebuildProjectManifest(projectDir: string): Promise<void> {
  const tabsDir = path.join(projectDir, "tabs");
  const entries = await readdir(tabsDir, { withFileTypes: true });
  const tabFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".manifest.json"))
    .map((entry) => entry.name)
    .sort();

  const combined: ScreenshotRecord[] = [];
  const coverageByTab: Record<string, TabCoverage> = {};
  for (const file of tabFiles) {
    const payloadRaw = await readFile(path.join(tabsDir, file), "utf8");
    const payload = JSON.parse(payloadRaw) as {
      tabId?: string;
      coverage?: TabCoverage;
      records?: ScreenshotRecord[];
    };
    const tabId = payload.tabId ?? file.replace(/\.manifest\.json$/, "");
    coverageByTab[tabId] = payload.coverage ?? {
      candidateCount: 0,
      interactedCount: 0,
    };
    if (Array.isArray(payload.records)) {
      combined.push(...payload.records);
    }
  }

  await writeFile(
    path.join(projectDir, "manifest.json"),
    JSON.stringify(
      combined.sort((left, right) => left.file.localeCompare(right.file)),
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    path.join(projectDir, "coverage.json"),
    JSON.stringify(coverageByTab, null, 2),
    "utf8",
  );
}

test.describe("full UI coverage audit", () => {
  test.setTimeout(1_500_000);
  test.beforeEach((fixtures, testInfo) => {
    void fixtures;
    test.skip(
      isWebkitMobileProject(testInfo.project.name),
      "Full UI coverage audit runs in Chromium only to avoid long-tail mobile stalls.",
    );
  });

  for (const tab of TABS) {
    if (tab.id === "catalog") {
      for (const shard of CATALOG_FLOW_SHARDS) {
        test(`captures ${tab.label} tab flows (${shard.id}) with per-tab manifest coverage`, async ({
          page,
        }, testInfo) => {
          const projectDir = await ensureProjectOutput(testInfo.project.name);
          const seedState = buildSeedState();
          const traceLines: string[] = [];
          const scopedTabId = `${tab.id}-${shard.id}`;
          const traceName = `audit-trace-${scopedTabId}`;
          const liveTracePath = buildLiveTracePath(projectDir, traceName);
          await registerLiveTrace(traceLines, liveTracePath);
          const shardConfig = getCatalogShardConfig(shard, testInfo.project.name);
          appendTrace(traceLines, `[meta] project=${testInfo.project.name}`);
          appendTrace(traceLines, `[meta] route=tab-${scopedTabId}`);
          appendTrace(traceLines, `[meta] live-trace=${liveTracePath}`);
          appendTrace(traceLines, `[meta] begin route=tab-${scopedTabId}`);
          try {
            const result = await captureAllTabScreens(page, testInfo, seedState, {
              tabs: [tab],
              includeHome: false,
              traceLines,
              buttonExerciseOptions: {
                maxPasses: shardConfig.maxPasses,
                maxInteractions: shardConfig.maxInteractions,
                skipInteractions: shardConfig.skipInteractions,
                maxCandidateScans: shardConfig.maxCandidateScans,
              },
            });
            const coverage = result.coverageByTab[tab.id] ?? {
              candidateCount: 0,
              interactedCount: 0,
            };

            await writeTabManifest(
              projectDir,
              testInfo.project.name,
              scopedTabId,
              result.records,
              coverage,
            );
            await rebuildProjectManifest(projectDir);
            appendTrace(traceLines, `[meta] complete route=tab-${scopedTabId}`);

            expect(result.records.length).toBeGreaterThan(2);
            expect(coverage.interactedCount).toBeLessThanOrEqual(shardConfig.maxInteractions);
          } finally {
            await attachTraceArtifacts(testInfo, traceName, traceLines, liveTracePath);
          }
        });
      }
      continue;
    }

    test(`captures ${tab.label} tab flows with per-tab manifest coverage`, async ({
      page,
    }, testInfo) => {
      const projectDir = await ensureProjectOutput(testInfo.project.name);
      const seedState = buildSeedState();
      const traceLines: string[] = [];
      const traceName = `audit-trace-${tab.id}`;
      const liveTracePath = buildLiveTracePath(projectDir, traceName);
      await registerLiveTrace(traceLines, liveTracePath);
      appendTrace(traceLines, `[meta] project=${testInfo.project.name}`);
      appendTrace(traceLines, `[meta] route=tab-${tab.id}`);
      appendTrace(traceLines, `[meta] live-trace=${liveTracePath}`);
      appendTrace(traceLines, `[meta] begin route=tab-${tab.id}`);
      try {
        const result = await captureAllTabScreens(page, testInfo, seedState, {
          tabs: [tab],
          includeHome: false,
          traceLines,
        });
        const coverage = result.coverageByTab[tab.id] ?? {
          candidateCount: 0,
          interactedCount: 0,
        };

        await writeTabManifest(projectDir, testInfo.project.name, tab.id, result.records, coverage);
        await rebuildProjectManifest(projectDir);
        appendTrace(traceLines, `[meta] complete route=tab-${tab.id}`);

        expect(result.records.length).toBeGreaterThan(2);
        expect(coverage.interactedCount).toBeGreaterThan(0);
      } finally {
        await attachTraceArtifacts(testInfo, traceName, traceLines, liveTracePath);
      }
    });
  }

  test("captures home shell baseline and publishes combined project manifest", async ({
    page,
  }, testInfo) => {
    const projectDir = await ensureProjectOutput(testInfo.project.name);
    const seedState = buildSeedState();
    const traceLines: string[] = [];
    const traceName = "audit-trace-home";
    const liveTracePath = buildLiveTracePath(projectDir, traceName);
    await registerLiveTrace(traceLines, liveTracePath);
    appendTrace(traceLines, `[meta] project=${testInfo.project.name}`);
    appendTrace(traceLines, "[meta] route=home");
    appendTrace(traceLines, `[meta] live-trace=${liveTracePath}`);
    appendTrace(traceLines, "[meta] begin route=home");
    try {
      const result = await captureAllTabScreens(page, testInfo, seedState, {
        tabs: [],
        includeHome: true,
        traceLines,
      });
      const homeCoverage = result.coverageByTab.home ?? {
        candidateCount: 0,
        interactedCount: 0,
      };

      await writeTabManifest(projectDir, testInfo.project.name, "home", result.records, homeCoverage);
      await rebuildProjectManifest(projectDir);
      appendTrace(traceLines, "[meta] complete route=home");

      expect(result.records.length).toBeGreaterThan(0);
    } finally {
      await attachTraceArtifacts(testInfo, traceName, traceLines, liveTracePath);
    }
  });
});
