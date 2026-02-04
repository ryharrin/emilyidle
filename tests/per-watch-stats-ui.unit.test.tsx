import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatRateFromCentsPerSec } from "../src/game/format";
import type { PerWatchStatsRow } from "../src/game/selectors/perWatchStats";
import { PerWatchStatsTable } from "../src/ui/components/PerWatchStatsTable";

const sampleRows: PerWatchStatsRow[] = [
  {
    modelId: "model-a",
    displayName: "Model Alpha",
    brand: "Rolex",
    model: "GMT",
    tierId: "starter",
    tierLabel: "Starter Quartz",
    movement: "quartz",
    ownedCount: 1,
    enjoymentCentsPerSec: 210,
    enjoymentBaseCentsPerSec: 190,
    totalEnjoymentCentsPerSec: 420,
    reserveMultiplier: 1.1,
    cashCentsPerSec: 120,
    cashSource: "career",
    cashExplanation: "Cash is derived from the therapist career salary.",
    catalogEntryIds: ["entry-a"],
    eventMultiplier: 1.15,
  },
  {
    modelId: "model-b",
    displayName: "Model Beta",
    brand: "Omega",
    model: "Speedmaster",
    tierId: "classic",
    tierLabel: "Classic Automatic",
    movement: "automatic",
    ownedCount: 2,
    enjoymentCentsPerSec: 320,
    enjoymentBaseCentsPerSec: 300,
    totalEnjoymentCentsPerSec: 640,
    reserveMultiplier: 1.2,
    cashCentsPerSec: 120,
    cashSource: "career",
    cashExplanation: "Cash is derived from the therapist career salary.",
    catalogEntryIds: ["entry-b"],
    eventMultiplier: 1,
  },
];

describe("PerWatchStatsTable", () => {
  it("keeps the same row expanded after sorting and formats rates correctly", async () => {
    const user = userEvent.setup();
    render(<PerWatchStatsTable rows={sampleRows} />);

    const targetId = "model-a";
    const row = screen.getByTestId(`per-watch-row-${targetId}`);
    const summary = row.querySelector("summary");
    if (!summary) {
      throw new Error("summary element missing");
    }

    await user.click(summary);
    await waitFor(() => expect(row).toHaveAttribute("open"));

    const rowScope = within(row);
    expect(
      rowScope.getByText(formatRateFromCentsPerSec(sampleRows[0].enjoymentCentsPerSec)),
    ).toBeVisible();
    const cashLabels = screen.getAllByText("Cash / sec (career)");
    expect(cashLabels.length).toBe(sampleRows.length);

    await user.selectOptions(screen.getByTestId("per-watch-sort"), "cash");
    await waitFor(() =>
      expect(screen.getByTestId(`per-watch-row-${targetId}`)).toHaveAttribute("open"),
    );

    expect(
      rowScope.getByText(formatRateFromCentsPerSec(sampleRows[0].cashCentsPerSec)),
    ).toBeVisible();
  });
});
