import type { CSSProperties } from "react";
import type { TierBadgeCategory } from "../../game/tierBadges";

type TierBadgeProps = {
  tier: TierBadgeCategory;
  showLabel?: boolean;
  label?: string;
  description?: string;
  className?: string;
  backgroundVar?: string;
  textVar?: string;
};

const DEFAULT_LABELS: Record<TierBadgeCategory, string> = {
  quartz: "Quartz",
  automatic: "Automatic",
  manual: "Manual",
  tourbillon: "Tourbillon",
};

type TierBadgeStyle = CSSProperties & {
  "--tier-badge-background"?: string;
  "--tier-badge-text"?: string;
};

export function TierBadge({
  tier,
  showLabel = true,
  label,
  description,
  className = "",
  backgroundVar,
  textVar,
}: TierBadgeProps) {
  const displayLabel = label ?? DEFAULT_LABELS[tier];
  const title = description ?? displayLabel;
  const style: TierBadgeStyle = {};

  if (backgroundVar) {
    style["--tier-badge-background"] = `var(${backgroundVar})`;
  }
  if (textVar) {
    style["--tier-badge-text"] = `var(${textVar})`;
  }

  return (
    <span
      className={["tier-badge", className].filter(Boolean).join(" ")}
      data-tier={tier}
      data-tier-badge={tier}
      title={title}
      style={style}
    >
      <span className="tier-badge-dot" aria-hidden="true" />
      {showLabel && <span className="tier-badge-label">{displayLabel}</span>}
    </span>
  );
}
