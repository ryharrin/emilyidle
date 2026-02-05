import React from "react";

import { AnchoredTooltip, type AnchoredTooltipContent } from "./AnchoredTooltip";
import { formatMoneyFromCents } from "../../game/format";
import type { BlueprintCostDetail as BlueprintCostDetailData } from "../../game/state";

type BlueprintCostDetailProps = {
  detail: BlueprintCostDetailData;
  tooltipContent: AnchoredTooltipContent;
  testId?: string;
};

export function BlueprintCostDetail({ detail, tooltipContent, testId }: BlueprintCostDetailProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  const showTooltip = React.useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsTooltipOpen(true);
  }, []);

  const hideTooltip = React.useCallback(() => setIsTooltipOpen(false), []);

  const renderRow = (label: string, value: string) => (
    <div className="blueprint-cost-row">
      <span className="blueprint-cost-label">{label}</span>
      <span className="blueprint-cost-value">{value}</span>
    </div>
  );

  const currentValue = formatMoneyFromCents(detail.currentCostCents);
  const nextValue = detail.hasNext ? formatMoneyFromCents(detail.nextCostCents) : "—";

  return (
    <fieldset
      className="blueprint-cost-detail"
      data-testid={testId}
      aria-label="Blueprint cost detail"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <legend className="visually-hidden">Blueprint cost detail</legend>
      {renderRow("Current", `${currentValue} enjoyment`)}
      {renderRow("Next", `${nextValue} enjoyment`)}
      {detail.hasNext &&
        detail.deltaCents > 0 &&
        renderRow("Delta", `${formatMoneyFromCents(detail.deltaCents)} enjoyment`)}
      <AnchoredTooltip
        open={isTooltipOpen}
        anchorEl={anchorEl}
        content={tooltipContent}
        testId={testId ? `${testId}-tooltip` : undefined}
      />
    </fieldset>
  );
}
