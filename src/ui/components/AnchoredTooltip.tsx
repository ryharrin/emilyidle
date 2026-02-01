import React from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "bottom" | "left" | "right";

export type AnchoredTooltipContent = {
  title: string;
  description?: string;
  meta?: string;
};

type AnchoredTooltipProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  preferredPlacement?: Placement;
  content: AnchoredTooltipContent;
  testId?: string;
};

type TooltipSize = { width: number; height: number };

type TooltipPosition = {
  left: number;
  top: number;
  placement: Placement;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pickPlacement(args: {
  preferred: Placement;
  anchor: DOMRect;
  tip: TooltipSize;
  gap: number;
  margin: number;
  viewportW: number;
  viewportH: number;
}) {
  const { preferred, anchor, tip, gap, margin, viewportW, viewportH } = args;

  const spaces = {
    top: anchor.top - margin,
    bottom: viewportH - anchor.bottom - margin,
    left: anchor.left - margin,
    right: viewportW - anchor.right - margin,
  };

  const fits = (placement: Placement) => {
    if (placement === "top" || placement === "bottom") {
      return (placement === "top" ? spaces.top : spaces.bottom) >= tip.height + gap;
    }
    return (placement === "left" ? spaces.left : spaces.right) >= tip.width + gap;
  };

  const order: Placement[] = [preferred, "top", "bottom", "right", "left"].filter(
    (v, idx, arr) => arr.indexOf(v) === idx,
  ) as Placement[];

  for (const placement of order) {
    if (fits(placement)) {
      return placement;
    }
  }

  const scored: Array<{ placement: Placement; score: number }> = [
    { placement: "top", score: spaces.top },
    { placement: "bottom", score: spaces.bottom },
    { placement: "right", score: spaces.right },
    { placement: "left", score: spaces.left },
  ];
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.placement ?? preferred;
}

function computePosition(args: {
  placement: Placement;
  anchor: DOMRect;
  tip: TooltipSize;
  gap: number;
  margin: number;
  viewportW: number;
  viewportH: number;
}): { left: number; top: number } {
  const { placement, anchor, tip, gap, margin, viewportW, viewportH } = args;

  let left = 0;
  let top = 0;
  if (placement === "top") {
    left = anchor.left + anchor.width / 2 - tip.width / 2;
    top = anchor.top - gap - tip.height;
  } else if (placement === "bottom") {
    left = anchor.left + anchor.width / 2 - tip.width / 2;
    top = anchor.bottom + gap;
  } else if (placement === "right") {
    left = anchor.right + gap;
    top = anchor.top + anchor.height / 2 - tip.height / 2;
  } else {
    left = anchor.left - gap - tip.width;
    top = anchor.top + anchor.height / 2 - tip.height / 2;
  }

  left = clamp(left, margin, Math.max(margin, viewportW - margin - tip.width));
  top = clamp(top, margin, Math.max(margin, viewportH - margin - tip.height));
  return { left, top };
}

export function AnchoredTooltip({
  open,
  anchorEl,
  preferredPlacement = "top",
  content,
  testId,
}: AnchoredTooltipProps) {
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const [tipSize, setTipSize] = React.useState<TooltipSize | null>(null);
  const [pos, setPos] = React.useState<TooltipPosition | null>(null);

  React.useLayoutEffect(() => {
    if (!open) {
      setTipSize(null);
      setPos(null);
      return;
    }
    const el = tooltipRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setTipSize({ width: rect.width, height: rect.height });
    }
  }, [content.description, content.meta, content.title, open]);

  React.useEffect(() => {
    if (!open || !anchorEl || !tipSize) {
      return;
    }

    let rafId = 0;
    const gap = 10;
    const margin = 12;

    const update = () => {
      const anchor = anchorEl.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const placement = pickPlacement({
        preferred: preferredPlacement,
        anchor,
        tip: tipSize,
        gap,
        margin,
        viewportW,
        viewportH,
      });
      const { left, top } = computePosition({
        placement,
        anchor,
        tip: tipSize,
        gap,
        margin,
        viewportW,
        viewportH,
      });
      setPos({ left, top, placement });
      rafId = window.requestAnimationFrame(update);
    };

    rafId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(rafId);
  }, [anchorEl, open, preferredPlacement, tipSize]);

  if (!open || !anchorEl) {
    return null;
  }

  return createPortal(
    <div
      ref={tooltipRef}
      className={[
        "anchored-tooltip",
        pos ? `anchored-tooltip-${pos.placement}` : "anchored-tooltip-top",
      ].join(" ")}
      data-testid={testId}
      style={
        pos
          ? {
              left: pos.left,
              top: pos.top,
            }
          : undefined
      }
      role="tooltip"
    >
      <div className="anchored-tooltip-title">{content.title}</div>
      {content.description ? (
        <div className="anchored-tooltip-desc">{content.description}</div>
      ) : null}
      {content.meta ? <div className="anchored-tooltip-meta">{content.meta}</div> : null}
      <div className="anchored-tooltip-arrow" aria-hidden="true" />
    </div>,
    document.body,
  );
}
