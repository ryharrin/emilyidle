import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { createInitialState } from "../src/game/state";
import { HelpProvider } from "../src/ui/help/helpContext";
import { StatsTab } from "../src/ui/tabs/StatsTab";

describe("stats cash breakdown", () => {
  it("renders salary and session cadence as separate cash lines", () => {
    const base = createInitialState();
    const nowMs = 1_700_000_000_000;
    const state = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        activeTrackId: "private-practice" as const,
        primaryTrackId: "private-practice" as const,
        salaryActiveUntilMs: nowMs + 300_000,
        freeSessionAvailable: false,
      },
    };

    render(
      <HelpProvider value={{ openHelpTo: () => {} }}>
        <StatsTab
          isActive
          state={state}
          stats={{
            cash: state.currencyCents,
            cashRate: 0,
            enjoyment: state.enjoymentCents,
            enjoymentRate: 0,
            sentimentalValue: 0,
            softcap: "100%",
          }}
          currentEventMultiplier={1}
          nowMs={nowMs}
          onNavigate={() => {}}
        />
      </HelpProvider>,
    );

    const breakdown = screen.getByTestId("cash-rate-breakdown");
    expect(within(breakdown).getByText(/Career salary \(passive\)/i)).toBeVisible();
    const sessionRow = within(breakdown).getByTestId("cash-session-cadence-row");
    expect(sessionRow.textContent ?? "").toMatch(/Session cadence/i);
    expect(sessionRow.textContent ?? "").toMatch(/cooldown/i);
  });
});
