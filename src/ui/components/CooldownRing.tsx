import React from "react";

type CooldownRingProps = {
  progress01: number;
  sizePx?: number;
  strokeWidthPx?: number;
  label?: string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function CooldownRing({
  progress01,
  sizePx = 44,
  strokeWidthPx = 4,
  label,
}: CooldownRingProps) {
  const normalized = clamp01(progress01);
  const radius = Math.max(0, (sizePx - strokeWidthPx) / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = Math.max(0, circumference * (1 - normalized));
  const center = sizePx / 2;

  return (
    <div className="cooldown-ring" role="img" aria-label={label ?? "Cooldown progress"}>
      <svg width={sizePx} height={sizePx} viewBox={`0 0 ${sizePx} ${sizePx}`} aria-hidden="true">
        <circle
          className="cooldown-ring-track"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidthPx}
          fill="none"
        />
        <circle
          className="cooldown-ring-progress"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidthPx}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
        />
      </svg>
    </div>
  );
}
