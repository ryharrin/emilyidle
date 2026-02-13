import React from "react";
import {
  clamp01,
  WindingBand,
  WINDING_GOOD_THRESHOLD,
  WINDING_PERFECT_THRESHOLD,
  WINDING_SOFT_PENALTY_THRESHOLD,
} from "./windingMath";

type Props = {
  angleDeg: number;
  tension01: number;
  band: WindingBand;
  phase: "running" | "stopping" | "stopped";
  prefersReducedMotion: boolean;
  velocity01: number;
  progress01: number;
  outcomeTier?: "miss" | "good" | "perfect";
};

const RADIUS = 30;

function arcPath(startRatio: number, endRatio: number): string {
  const startAngle = startRatio * 2 * Math.PI - Math.PI / 2;
  const endAngle = endRatio * 2 * Math.PI - Math.PI / 2;
  const cx = 36;
  const cy = 36;
  const x1 = cx + RADIUS * Math.cos(startAngle);
  const y1 = cy + RADIUS * Math.sin(startAngle);
  const x2 = cx + RADIUS * Math.cos(endAngle);
  const y2 = cy + RADIUS * Math.sin(endAngle);
  const largeArc = endRatio - startRatio > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function WindingCrown({
  angleDeg,
  tension01,
  band,
  phase,
  prefersReducedMotion,
  velocity01,
  progress01,
  outcomeTier,
}: Props) {
  const normalizedVelocity = clamp01(velocity01);
  const normalizedProgress = clamp01(progress01);
  const normalizedTension = clamp01(tension01);
  const displayTension = clamp01(
    normalizedTension * 0.55 + normalizedVelocity * 0.2 + normalizedProgress * 0.25,
  );
  const glowIntensity = clamp01(normalizedVelocity + normalizedTension * 0.6);
  const springGaugeProgress = clamp01(displayTension * 0.6 + normalizedProgress * 0.4);
  const penaltyIntensity = band === "over" ? 1 : 0;
  const flashClass = outcomeTier && !prefersReducedMotion ? `winding-flash--${outcomeTier}` : "";
  const style = {
    ["--winding-angle" as const]: `${angleDeg}deg`,
    ["--winding-progress" as const]: normalizedProgress,
    ["--winding-tension" as const]: normalizedTension,
    ["--winding-velocity" as const]: normalizedVelocity,
    ["--winding-glow" as const]: glowIntensity,
    ["--winding-display-tension" as const]: displayTension,
    ["--winding-gauge-progress" as const]: normalizedProgress,
    ["--winding-spring-progress" as const]: springGaugeProgress,
    ["--winding-penalty" as const]: penaltyIntensity,
  } as React.CSSProperties;

  return (
    <div
      className={`winding-crown winding-crown-${band} winding-crown-phase-${phase} ${
        prefersReducedMotion ? "winding-crown-reduced-motion" : ""
      } ${flashClass}`}
      style={style}
      aria-hidden="true"
    >
      <svg className="winding-crown-gauge" viewBox="0 0 72 72" role="presentation">
        <g className="winding-zone-indicators">
          <path className="winding-zone--miss" d={arcPath(0, WINDING_GOOD_THRESHOLD)} fill="none" />
          <path
            className="winding-zone--good"
            d={arcPath(WINDING_GOOD_THRESHOLD, WINDING_PERFECT_THRESHOLD)}
            fill="none"
          />
          <path
            className="winding-zone--perfect"
            d={arcPath(WINDING_PERFECT_THRESHOLD, WINDING_SOFT_PENALTY_THRESHOLD)}
            fill="none"
          />
          <path
            className="winding-zone--miss"
            d={arcPath(WINDING_SOFT_PENALTY_THRESHOLD, 1)}
            fill="none"
          />
        </g>
        <circle className="winding-gauge-track" cx="36" cy="36" r="30" fill="none" />
        <circle className="winding-gauge-spring" cx="36" cy="36" r="30" fill="none" />
        <circle className="winding-gauge-progress" cx="36" cy="36" r="30" fill="none" />
        <circle className="winding-gauge-penalty" cx="36" cy="36" r="30" fill="none" />
      </svg>
    </div>
  );
}
