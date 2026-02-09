import { expect, type Locator, type Page } from "@playwright/test";
import { clickLocatorSafely, findFirstVisible } from "./interactions";

function getCatalogPanel(page: Page) {
  return page.getByRole("tabpanel", { name: /Catalog/i });
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
  await sheet.waitFor({ state: "hidden" }).catch(() => {});
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

  const detailsButtons = panel.locator('[data-testid^="catalog-details-button-"]');
  const detailsCount = await detailsButtons.count();
  const sheet = page.getByTestId("catalog-details-sheet");
  for (let index = 0; index < detailsCount; index += 1) {
    const button = detailsButtons.nth(index);
    if (!(await button.isVisible().catch(() => false))) {
      continue;
    }

    await clickLocatorSafely(button);
    await sheet.waitFor({ state: "visible", timeout: 1_500 }).catch(() => {});
    const sheetCandidates = page.locator(".catalog-card-details-sheet").locator(selector);
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

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidates = await resolveCatalogInteractCandidates(page, selector, panel);
    const count = await candidates.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      await clickLocatorSafely(candidate);
      if (await modal.isVisible().catch(() => false)) {
        return true;
      }

      await page.waitForTimeout(75);
      if (await modal.isVisible().catch(() => false)) {
        return true;
      }
    }

    await closeCatalogDetailsSheet(page);
  }

  return false;
}
