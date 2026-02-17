import { expect, type Locator, type Page } from "@playwright/test";
import { clickLocatorSafely, findFirstVisible } from "./interactions";

function getCatalogPanel(page: Page) {
  return page.getByRole("tabpanel", { name: /Catalog/i });
}

const CATALOG_DETAILS_BUTTON_SELECTOR = '[data-testid^="catalog-details-button-"]';
const CATALOG_DETAILS_SHEET_SELECTOR = ".catalog-card-details-sheet";
const CATALOG_DENSITY_TOGGLE_SELECTOR =
  '[data-testid="catalog-density-toggle"], [data-testid="catalog-quick-density"]';

async function ensureCatalogCompactDetailsFlow(page: Page, panel: Locator): Promise<void> {
  const detailsButtons = panel.locator(CATALOG_DETAILS_BUTTON_SELECTOR);
  if ((await findFirstVisible(detailsButtons)) !== null) {
    return;
  }

  const densityToggle = await findFirstVisible(panel.locator(CATALOG_DENSITY_TOGGLE_SELECTOR));
  if (densityToggle === null) {
    return;
  }

  const compactAlreadyEnabled = (await densityToggle.getAttribute("aria-pressed")) === "true";
  if (!compactAlreadyEnabled) {
    await clickLocatorSafely(densityToggle);
    await page.waitForTimeout(120);
  }
}

export async function openCatalogFilters(page: Page, catalogPanel?: Locator) {
  const panel = catalogPanel ?? getCatalogPanel(page);
  const toggle = panel.getByTestId("catalog-filter-toggle");
  if (!(await toggle.isVisible().catch(() => false))) {
    return;
  }

  const expanded = (await toggle.getAttribute("aria-expanded")) === "true";
  if (expanded) {
    return;
  }

  await clickLocatorSafely(toggle);
  await panel.getByTestId("catalog-filter-panel").waitFor({ state: "visible" });
}

export async function openCatalogTab(page: Page): Promise<Locator> {
  const catalogTab = page.getByRole("tab", { name: /^Catalog/ });
  await clickLocatorSafely(catalogTab);

  const catalogPanel = getCatalogPanel(page);
  await expect(catalogPanel).toBeVisible();
  await expect(catalogPanel.getByTestId("catalog-grid")).toBeVisible();
  return catalogPanel;
}

export async function switchCatalogToOwned(page: Page, catalogPanel?: Locator): Promise<Locator> {
  const panel = catalogPanel ?? getCatalogPanel(page);
  const ownedTab = panel.locator("#catalog-owned-tab").first();

  if (!(await ownedTab.isVisible().catch(() => false))) {
    const quickFilters = panel.getByTestId("catalog-quick-filters");
    if (await quickFilters.isVisible().catch(() => false)) {
      await clickLocatorSafely(quickFilters);
    } else {
      await openCatalogFilters(page, panel);
    }
  }

  await expect(ownedTab).toBeVisible();
  await clickLocatorSafely(ownedTab);
  await expect(ownedTab).toHaveAttribute("aria-selected", "true");
  return panel;
}

export async function openCatalogDetailsSheet(
  page: Page,
  catalogPanel?: Locator,
): Promise<boolean> {
  const panel = catalogPanel ?? getCatalogPanel(page);
  const sheet = page.getByTestId("catalog-details-sheet");
  if (await sheet.isVisible().catch(() => false)) {
    return true;
  }

  const detailsButtons = panel.locator('[data-testid^="catalog-details-button-"]');
  const detailsCount = await detailsButtons.count();
  for (let index = 0; index < detailsCount; index += 1) {
    const candidate = detailsButtons.nth(index);
    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }

    await clickLocatorSafely(candidate);
    if (await sheet.isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

export async function openCatalogDetailsForEntry(
  page: Page,
  entryId: string,
  catalogPanel?: Locator,
): Promise<Locator> {
  const panel = catalogPanel ?? getCatalogPanel(page);
  const detailsButton = panel.getByTestId(`catalog-details-button-${entryId}`);
  await expect(detailsButton).toBeVisible();
  await detailsButton.scrollIntoViewIfNeeded().catch(() => {});
  await clickLocatorSafely(detailsButton);

  const sheet = page.getByTestId("catalog-details-sheet");
  await sheet.waitFor({ state: "visible" });
  return page.locator(".catalog-card-details-sheet");
}

async function closeCatalogDetailsSheet(page: Page) {
  const sheet = page.getByTestId("catalog-details-sheet");
  if (!(await sheet.isVisible().catch(() => false))) {
    return;
  }

  await page.keyboard.press("Escape").catch(() => {});
  if (await sheet.isVisible().catch(() => false)) {
    const closeButton = page.getByTestId("catalog-details-sheet-close");
    if (await closeButton.isVisible().catch(() => false)) {
      await clickLocatorSafely(closeButton).catch(() => {});
    }
  }
  if (await sheet.isVisible().catch(() => false)) {
    await clickLocatorSafely(sheet).catch(() => {});
  }
  await sheet.waitFor({ state: "hidden", timeout: 1_500 }).catch(() => {});
}

export async function resolveCatalogInteractCandidates(
  page: Page,
  selector: string,
  catalogPanel?: Locator,
): Promise<Locator> {
  const panel = catalogPanel ?? getCatalogPanel(page);
  const panelCandidates = panel.locator(selector);
  if ((await findFirstVisible(panelCandidates)) !== null) {
    return panelCandidates;
  }

  const sheet = page.getByTestId("catalog-details-sheet");
  const sheetCandidates = page.locator(CATALOG_DETAILS_SHEET_SELECTOR).locator(selector);
  if (await sheet.isVisible().catch(() => false)) {
    if ((await findFirstVisible(sheetCandidates)) !== null) {
      return sheetCandidates;
    }

    await closeCatalogDetailsSheet(page);
  }

  await ensureCatalogCompactDetailsFlow(page, panel);

  const detailsButtons = panel.locator(CATALOG_DETAILS_BUTTON_SELECTOR);
  const detailsCount = await detailsButtons.count();
  for (let index = 0; index < detailsCount; index += 1) {
    const button = detailsButtons.nth(index);
    if (!(await button.isVisible().catch(() => false))) {
      continue;
    }

    let openedSheet = false;
    for (let openAttempt = 0; openAttempt < 2 && !openedSheet; openAttempt += 1) {
      await clickLocatorSafely(button).catch(() => {});
      await sheet.waitFor({ state: "visible", timeout: 1_500 }).catch(() => {});
      openedSheet = await sheet.isVisible().catch(() => false);
      if (!openedSheet) {
        await page.waitForTimeout(100);
      }
    }
    if (!openedSheet) {
      continue;
    }

    if ((await findFirstVisible(sheetCandidates)) !== null) {
      return sheetCandidates;
    }

    await closeCatalogDetailsSheet(page);
  }

  return panelCandidates;
}

export async function openCatalogInteractionModal(
  page: Page,
  selector: string,
  modalTestId: string,
  catalogPanel?: Locator,
): Promise<boolean> {
  const panel = catalogPanel ?? getCatalogPanel(page);
  const modal = page.getByTestId(modalTestId);
  if (await modal.isVisible().catch(() => false)) {
    return true;
  }

  const waitForModalVisible = async () =>
    modal
      .waitFor({
        state: "visible",
        timeout: 1_200,
      })
      .then(() => true)
      .catch(() => false);
  const activateCandidate = async (candidate: Locator) => {
    await clickLocatorSafely(candidate).catch(() => {});
    if (await waitForModalVisible()) {
      return true;
    }

    await candidate
      .evaluate((element) => {
        (element as HTMLButtonElement).click();
      })
      .catch(() => {});
    if (await waitForModalVisible()) {
      return true;
    }

    await candidate.focus().catch(() => {});
    await page.keyboard.press("Enter").catch(() => {});
    return waitForModalVisible();
  };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidates = await resolveCatalogInteractCandidates(page, selector, panel);
    const count = await candidates.count();
    let clickedCandidate = false;
    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      clickedCandidate = true;
      if (await activateCandidate(candidate)) {
        return true;
      }
    }

    await closeCatalogDetailsSheet(page);
    if (!clickedCandidate) {
      await page.waitForTimeout(160 + attempt * 40);
    }
    if (await waitForModalVisible()) {
      return true;
    }
  }

  return false;
}
