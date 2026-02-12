import React from "react";
import { AnchoredTooltip, type AnchoredTooltipContent } from "./AnchoredTooltip";
import type { PowerReserveDetail } from "../../game/selectors/interactions";

type PowerReserveHintProps = {
  detail: PowerReserveDetail;
  testId?: string;
};

export function PowerReserveHint({ detail, testId }: PowerReserveHintProps): JSX.Element {
  const tooltipId = React.useId();
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement | null>(null);
  const pointerTypeRef = React.useRef<string>("mouse");
  const showTooltip = React.useCallback(() => setIsTooltipOpen(true), []);
  const hideTooltip = React.useCallback(() => setIsTooltipOpen(false), []);
  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    pointerTypeRef.current = event.pointerType || "mouse";
  }, []);
  const handleClick = React.useCallback(() => {
    if (pointerTypeRef.current === "mouse") {
      return;
    }
    setIsTooltipOpen((open) => !open);
  }, []);
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape") {
      return;
    }
    setIsTooltipOpen(false);
  }, []);
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
        aria-controls={tooltipId}
        aria-describedby={isTooltipOpen ? tooltipId : undefined}
        aria-haspopup="true"
        aria-expanded={isTooltipOpen}
        ref={anchorRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        ?
      </button>
      <AnchoredTooltip
        open={isTooltipOpen}
        anchorEl={anchorRef.current}
        id={tooltipId}
        content={tooltipContent}
        preferredPlacement="top"
        testId="power-reserve-tooltip"
      />
    </div>
  );
}
