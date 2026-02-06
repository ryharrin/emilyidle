import { expect, test, type Page } from "@playwright/test";

type SeededState = {
  currencyCents: number;
  workshopPrestigeCount: number;
  therapistCareer?: {
    careerStartId?: string | null;
  };
};

async function seedSave(page: Page, args: { state: SeededState; lastTabId: string }) {
  await page.addInitScript(({ state, lastTabId }: { state: SeededState; lastTabId: string }) => {
    if (window.sessionStorage.getItem("settings-clear-save-seeded") === "1") {
      return;
    }

    window.sessionStorage.setItem("settings-clear-save-seeded", "1");
    window.localStorage.clear();
    window.localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state,
      }),
    );
    window.localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId }));
  }, args);
}

test.describe("settings clear save", () => {
  test("cancel keeps the existing save", async ({ page }) => {
    await seedSave(page, {
      lastTabId: "save",
      state: {
        currencyCents: 999_999,
        workshopPrestigeCount: 7,
        therapistCareer: { careerStartId: "phd-program" },
      },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByTestId("settings-clear-save")).toBeVisible();

    await page.getByTestId("settings-clear-save").click();
    await expect(page.getByTestId("settings-clear-save-confirm")).toBeVisible();
    await expect(page.getByTestId("settings-clear-save-cancel")).toBeVisible();

    await page
      .getByTestId("settings-clear-save-cancel")
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByTestId("settings-clear-save-confirm")).toBeHidden();

    const stored = await page.evaluate(() => {
      const raw = window.localStorage.getItem("emily-idle:save");
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.state.currencyCents).toBe(999_999);
    expect(stored.state.workshopPrestigeCount).toBe(7);
  });

  test("confirm clears save and produces a fresh run", async ({ page }) => {
    await seedSave(page, {
      lastTabId: "save",
      state: {
        currencyCents: 999_999,
        workshopPrestigeCount: 7,
        therapistCareer: { careerStartId: "phd-program" },
      },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("tab", { name: "Settings" }).click();
    await page.getByTestId("settings-clear-save").click();

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
