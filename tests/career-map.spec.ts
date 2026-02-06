import { expect, test } from "@playwright/test";

type CareerMapViewport = { scale: number };

const parseCareerMapViewport = (raw: string | null): CareerMapViewport | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const candidate = parsed as { scale?: unknown };
      if (typeof candidate.scale === "number") {
        return { scale: candidate.scale };
      }
    }
  } catch {
    return null;
  }

  return null;
};

test.describe("career map canvas", () => {
  test("career map shows stage lane in view on fresh save", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/");

    await expect(page.getByTestId("career-panel")).toBeVisible();
    await expect(page.getByTestId("career-map-viewport")).toBeVisible();

    const viewport = page.getByTestId("career-map-viewport");
    const stageLane = page.getByTestId("career-stages-card");
    await expect(stageLane).toBeVisible();

    const viewportBox = await viewport.boundingBox();
    const nodeBox = await stageLane.boundingBox();
    expect(viewportBox).not.toBeNull();
    expect(nodeBox).not.toBeNull();

    if (!viewportBox || !nodeBox) {
      return;
    }

    const intersects =
      nodeBox.x < viewportBox.x + viewportBox.width &&
      nodeBox.x + nodeBox.width > viewportBox.x &&
      nodeBox.y < viewportBox.y + viewportBox.height &&
      nodeBox.y + nodeBox.height > viewportBox.y;

    expect(intersects).toBeTruthy();
  });

  test("career map stays usable after resizing", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.setViewportSize({ width: 1200, height: 780 });
    await page.goto("/");
    await expect(page.getByTestId("career-panel")).toBeVisible();
    await expect(page.getByTestId("career-map-viewport")).toBeVisible();

    await page.setViewportSize({ width: 420, height: 780 });
    await expect(page.getByTestId("career-map-viewport")).toBeVisible();
    await expect(page.getByTestId("career-stages-card")).toBeVisible();
  });

  test("career map pans and zooms", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/");
    await expect(page.getByTestId("career-map-viewport")).toBeVisible();

    const viewport = page.getByTestId("career-map-viewport");
    const stageLane = page.getByTestId("career-stages-card");
    await expect(stageLane).toBeVisible();

    const viewportBox = await viewport.boundingBox();
    expect(viewportBox).not.toBeNull();
    if (!viewportBox) {
      return;
    }

    await viewport.hover({ force: true });
    const beforeRaw = await page.evaluate(() =>
      window.localStorage.getItem("emily-idle:career-map-viewport:v1"),
    );
    const before = parseCareerMapViewport(beforeRaw);
    expect(before).not.toBeNull();
    if (!before) {
      return;
    }

    await page.getByTestId("career-map-zoom-in").click({ force: true });

    await page.waitForFunction((beforeScale: number) => {
      const raw = window.localStorage.getItem("emily-idle:career-map-viewport:v1");
      if (!raw) {
        return false;
      }
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null) {
          const candidate = parsed as { scale?: unknown };
          return typeof candidate.scale === "number" && candidate.scale !== beforeScale;
        }
        return false;
      } catch {
        return false;
      }
    }, before.scale);

    const afterRaw = await page.evaluate(() =>
      window.localStorage.getItem("emily-idle:career-map-viewport:v1"),
    );
    const after = parseCareerMapViewport(afterRaw);
    expect(after).not.toBeNull();
    if (!after) {
      return;
    }

    expect(after.scale).not.toEqual(before.scale);
  });

  test("career map clamps a bad persisted viewport", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem(
        "emily-idle:career-map-viewport:v1",
        JSON.stringify({ x: 99999, y: 99999, scale: 1 }),
      );
    });

    await page.goto("/");
    await expect(page.getByTestId("career-map-viewport")).toBeVisible();
    await expect(page.getByTestId("career-stages-card")).toBeVisible();
  });

  test("career timeline remains visible on narrow viewports", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
    await page.setViewportSize({ width: 420, height: 780 });
    await page.goto("/");

    const timeline = page.getByTestId("career-timeline");
    await expect(timeline).toBeVisible();
    const nodes = timeline.locator("[data-testid^=career-timeline-node-]");
    await expect(nodes).toHaveCount(6);
  });
});
