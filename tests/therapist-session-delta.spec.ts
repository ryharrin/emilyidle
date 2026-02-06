import { expect, test } from "@playwright/test";

type SessionSnapshot = {
  version: number;
  currencyCents: number;
  enjoymentCents: number;
  xp: number;
  nextAvailableAtMs: number;
  freeSessionAvailable: boolean;
};

const readSessionSnapshot = async (page: import("@playwright/test").Page) => {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("emily-idle:save");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      version?: number;
      state?: {
        currencyCents?: number;
        enjoymentCents?: number;
        therapistCareer?: {
          xp?: number;
          nextAvailableAtMs?: number;
          freeSessionAvailable?: boolean;
        };
      };
    };

    if (!parsed || typeof parsed !== "object" || !parsed.state || !parsed.state.therapistCareer) {
      return null;
    }

    return {
      version: typeof parsed.version === "number" ? parsed.version : -1,
      currencyCents: parsed.state.currencyCents ?? 0,
      enjoymentCents: parsed.state.enjoymentCents ?? 0,
      xp: parsed.state.therapistCareer.xp ?? 0,
      nextAvailableAtMs: parsed.state.therapistCareer.nextAvailableAtMs ?? 0,
      freeSessionAvailable: parsed.state.therapistCareer.freeSessionAvailable ?? true,
    } satisfies SessionSnapshot;
  });
};

const waitForPersistedSnapshot = async (page: import("@playwright/test").Page) => {
  await page.waitForFunction(
    () => {
      const raw = window.localStorage.getItem("emily-idle:save");
      if (!raw) {
        return false;
      }
      try {
        const parsed = JSON.parse(raw) as {
          state?: {
            therapistCareer?: {
              nextAvailableAtMs?: number;
            };
          };
        };
        return parsed.state?.therapistCareer !== undefined;
      } catch {
        return false;
      }
    },
    null,
    { timeout: 6_000 },
  );
};

test("therapist sessions apply cash/enjoyment deltas and expose cooldown state", async ({
  page,
}) => {
  const seededState = {
    currencyCents: 50_000,
    enjoymentCents: 600_000,
    therapistCareer: {
      careerStartId: "phd-program",
      salaryActiveUntilMs: 0,
      level: 8,
      xp: 0,
      nextAvailableAtMs: 0,
      activeTrackId: "private-practice",
      primaryTrackId: "private-practice",
      modalityId: null,
      operatingStyleId: null,
      expansionFocusId: null,
      pointsAvailable: 0,
      spentNodes: {},
      freeSessionAvailable: false,
      sessionPremiumCount: 0,
      lastSessionAtMs: 0,
    },
  };

  await page.addInitScript((state: typeof seededState) => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 3,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state,
      }),
    );
  }, seededState);

  await page.goto("/");
  await waitForPersistedSnapshot(page);
  await page.getByRole("tab", { name: "Career" }).click();

  await expect(page.getByTestId("career-action")).toBeVisible();
  await expect(page.getByTestId("career-action")).toBeEnabled();

  const beforeSession = await readSessionSnapshot(page);
  expect(beforeSession).toBeTruthy();
  if (!beforeSession) {
    return;
  }

  await page.getByTestId("career-action").click();
  await expect(page.getByTestId("career-session-cooldown-ring")).toBeVisible();
  await expect(page.getByTestId("career-action")).toBeDisabled();
  await page.waitForFunction(
    () => {
      const raw = window.localStorage.getItem("emily-idle:save");
      if (!raw) {
        return false;
      }
      try {
        const parsed = JSON.parse(raw) as {
          state?: {
            therapistCareer?: {
              freeSessionAvailable?: boolean;
              nextAvailableAtMs?: number;
            };
          };
        };
        const career = parsed.state?.therapistCareer;
        return Boolean(
          career && career.freeSessionAvailable === false && (career.nextAvailableAtMs ?? 0) > 0,
        );
      } catch {
        return false;
      }
    },
    null,
    { timeout: 6_000 },
  );

  const afterSession = await readSessionSnapshot(page);
  expect(afterSession).toBeTruthy();
  if (!afterSession) {
    return;
  }

  expect(afterSession.version).toBe(3);
  expect(afterSession.currencyCents).toBeGreaterThan(beforeSession.currencyCents);
  expect(afterSession.enjoymentCents).toBeLessThan(beforeSession.enjoymentCents);
  expect(afterSession.xp).toBeGreaterThan(beforeSession.xp);
  expect(afterSession.nextAvailableAtMs).toBeGreaterThan(0);
});
