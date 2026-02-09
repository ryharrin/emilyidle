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
});
