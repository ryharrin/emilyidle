import React from "react";
import { AnchoredTooltip, type AnchoredTooltipContent } from "./AnchoredTooltip";
import type { PowerReserveDetail } from "../../game/selectors/interactions";

type PowerReserveHintProps = {
  detail: PowerReserveDetail;
  testId?: string;
};

export function PowerReserveHint({ detail, testId }: PowerReserveHintProps): JSX.Element {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement | null>(null);
  const showTooltip = React.useCallback(() => setIsTooltipOpen(true), []);
  const hideTooltip = React.useCallback(() => setIsTooltipOpen(false), []);
  const tooltipContent = React.useMemo<AnchoredTooltipContent>(
    () => ({
      title: detail.label,
      description: detail.explanation,
    }),
    [detail],
  );

  return (
    <div className="power-reserve-hint" data-testid={testId}>
      <span className="power-reserve-label">{detail.label}</span>
      <span className="power-reserve-value">{detail.reservePercent}%</span>
      <button
        type="button"
        className="power-reserve-hint-button"
        aria-label={`Explain ${detail.label}`}
        ref={anchorRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        ?
      </button>
      <AnchoredTooltip
        open={isTooltipOpen}
        anchorEl={anchorRef.current}
        content={tooltipContent}
        preferredPlacement="top"
        testId="power-reserve-tooltip"
      />
    </div>
  );
}
