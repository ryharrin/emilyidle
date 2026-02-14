import { expect, test } from "@playwright/test";
import { gotoAppWithNavigationReady } from "./helpers/navigation";
import { seedStorage } from "./helpers/storageSeed";

type SeededState = {
  currencyCents: number;
  workshopPrestigeCount: number;
  therapistCareer?: {
    careerStartId?: string | null;
  };
};

test.describe("settings clear save", () => {
  test("cancel keeps the existing save", async ({ page }) => {
    await seedStorage(page, {
      oncePerSessionKey: "settings-clear-save-seeded",
      clearLocalStorage: true,
      save: {
        state: {
          currencyCents: 999_999,
          workshopPrestigeCount: 7,
          therapistCareer: { careerStartId: "phd-program" },
        } satisfies SeededState,
      },
      navigation: {
        lastTabId: "save",
      },
    });

    await gotoAppWithNavigationReady(page);

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByTestId("settings-save-safety")).toBeVisible();
    await expect(page.getByTestId("settings-danger-zone")).toBeVisible();
    await expect(page.getByTestId("settings-danger-zone")).toContainText(
      /Clear save removes local progress/i,
    );
    await expect(page.getByTestId("settings-clear-save")).toBeVisible();

    await page
      .getByTestId("settings-clear-save")
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId("settings-clear-save-confirm")).toBeVisible();
    await expect(page.getByTestId("settings-clear-save-cancel")).toBeVisible();
    await expect(page.locator(".confirm-modal")).toHaveAttribute("data-overlay-kind", "blocking");
    await expect(page.getByTestId("settings-clear-save-cancel")).toHaveClass(
      /action-priority-secondary/,
    );

    await page
      .getByTestId("settings-clear-save-cancel")
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId("settings-clear-save-confirm")).toBeHidden();

    const stored = await page.evaluate(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.state.currencyCents).toBeGreaterThan(900_000);
    expect(stored.state.workshopPrestigeCount).toBe(7);
  });

  test("confirm clears save and produces a fresh run", async ({ page }) => {
    await seedStorage(page, {
      oncePerSessionKey: "settings-clear-save-seeded",
      clearLocalStorage: true,
      save: {
        state: {
          currencyCents: 999_999,
          workshopPrestigeCount: 7,
          therapistCareer: { careerStartId: "phd-program" },
        } satisfies SeededState,
      },
      navigation: {
        lastTabId: "save",
      },
    });

    await gotoAppWithNavigationReady(page);

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByTestId("settings-save-safety")).toBeVisible();
    await expect(page.getByTestId("settings-danger-zone")).toBeVisible();
    await page
      .getByTestId("settings-clear-save")
      .evaluate((button: HTMLButtonElement) => button.click());

    await page
      .getByTestId("settings-clear-save-confirm")
      .evaluate((button: HTMLButtonElement) => button.click());

    await expect(page.getByTestId("career-next-action")).toBeVisible();
    await expect(page.getByTestId("career-next-action-start")).toBeVisible();

    await page.waitForFunction(
      () => window.localStorage.getItem("emily-idle:save") !== null,
      null,
      { timeout: 5000 },
    );

    const stored = await page.evaluate(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.state.currencyCents).not.toBe(999_999);
    expect(stored.state.workshopPrestigeCount).toBe(0);
    expect(stored.state.therapistCareer?.careerStartId ?? null).toBe(null);
  });

  test("stale tab cannot resurrect cleared save on unload", async ({ page }) => {
    await seedStorage(page, {
      oncePerSessionKey: "settings-clear-save-seeded",
      clearLocalStorage: true,
      save: {
        state: {
          currencyCents: 999_999,
          workshopPrestigeCount: 7,
          therapistCareer: { careerStartId: "phd-program" },
        } satisfies SeededState,
      },
      navigation: {
        lastTabId: "save",
      },
    });

    await gotoAppWithNavigationReady(page);

    const staleTab = await page.context().newPage();
    await gotoAppWithNavigationReady(staleTab);

    await page.getByRole("tab", { name: "Settings" }).click();
    await page
      .getByTestId("settings-clear-save")
      .evaluate((button: HTMLButtonElement) => button.click());
    await page
      .getByTestId("settings-clear-save-confirm")
      .evaluate((button: HTMLButtonElement) => button.click());

    await expect(page.getByTestId("career-next-action")).toBeVisible();
    await page.waitForFunction(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      if (!raw) {
        return false;
      }

      try {
        const parsed = JSON.parse(raw);
        return parsed?.state?.workshopPrestigeCount === 0;
      } catch {
        return false;
      }
    });

    await page.close();

    const reopenedTab = await staleTab.context().newPage();
    await gotoAppWithNavigationReady(reopenedTab);
    await expect(reopenedTab.getByTestId("career-next-action")).toBeVisible();
    await expect(reopenedTab.getByTestId("career-next-action-start")).toBeVisible();

    const reopenedStored = await reopenedTab.evaluate(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      return raw ? JSON.parse(raw) : null;
    });

    expect(reopenedStored).not.toBeNull();
    expect(reopenedStored.state.workshopPrestigeCount).toBe(0);
    expect(reopenedStored.state.therapistCareer?.careerStartId ?? null).toBe(null);
    expect(reopenedStored.state.currencyCents).not.toBe(999_999);

    await staleTab.waitForTimeout(250);
    await staleTab.evaluate(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    const stored = await reopenedTab.evaluate(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.state.workshopPrestigeCount).toBe(0);
    expect(stored.state.therapistCareer?.careerStartId ?? null).toBe(null);
    expect(stored.state.currencyCents).not.toBe(999_999);

    const savedAtBeforeFreshPersist = Date.parse(stored.savedAt);

    await reopenedTab.getByTestId("career-next-action-start").click();
    await reopenedTab.evaluate(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    await reopenedTab.waitForFunction((minSavedAtMs) => {
      const raw = window.localStorage.getItem("emily-idle:save");
      if (!raw) {
        return false;
      }

      try {
        const parsed = JSON.parse(raw);
        const savedAtMs = Date.parse(parsed?.savedAt ?? "");
        return (
          Number.isFinite(savedAtMs) &&
          savedAtMs >= minSavedAtMs &&
          parsed?.state?.workshopPrestigeCount === 0 &&
          typeof parsed?.state?.therapistCareer?.careerStartId === "string"
        );
      } catch {
        return false;
      }
    }, savedAtBeforeFreshPersist);

    const afterFreshPersist = await reopenedTab.evaluate(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      return raw ? JSON.parse(raw) : null;
    });

    expect(afterFreshPersist).not.toBeNull();
    expect(afterFreshPersist.state.workshopPrestigeCount).toBe(0);
    expect(afterFreshPersist.state.currencyCents).not.toBe(999_999);
    expect(afterFreshPersist.state.therapistCareer?.careerStartId ?? null).not.toBe(null);
    expect(Date.parse(afterFreshPersist.savedAt)).toBeGreaterThanOrEqual(savedAtBeforeFreshPersist);

    await staleTab.close();
    await reopenedTab.close();
  });
});
