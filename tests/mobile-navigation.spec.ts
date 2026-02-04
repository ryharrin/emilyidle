import { expect, test } from "@playwright/test";

test("mobile navigation keeps tab strip sticky with swipe, clicks, and help modal", async ({
  page,
}) => {
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 844 });

  const navTabs = page.locator(".page-nav-tabs");
  await expect(navTabs).toBeVisible();

  const scrollSnap = await navTabs.evaluate((el) => getComputedStyle(el).scrollSnapType);
  expect(scrollSnap).toContain("x");

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const catalogTab = tabList.getByRole("tab", { name: "Catalog" });
  await expect(catalogTab).toBeVisible();

  await catalogTab.click();
  await expect(catalogTab).toHaveAttribute("aria-selected", "true");
  await expect(tabList.getByRole("tab", { name: "Collection" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(page.getByTestId("catalog-grid")).toBeVisible();

  const initialScroll = await navTabs.evaluate((el) => el.scrollLeft);
  await navTabs.evaluate((el) => el.scrollBy({ left: 200, behavior: "auto" }));
  const afterScroll = await navTabs.evaluate((el) => el.scrollLeft);
  const scrollable = await navTabs.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
  if (scrollable) {
    expect(afterScroll).toBeGreaterThan(initialScroll);
  }

  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(150);
  const stickyAfter = await navTabs.evaluate((el) => el.getBoundingClientRect().top);
  expect(stickyAfter).toBeLessThanOrEqual(24);

  await page.getByTestId("help-open").click();
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("help-modal")).toHaveCount(0);
});
