import React from "react";
import { clamp01, WindingBand } from "./windingMath";

type Props = {
  angleDeg: number;
  tension01: number;
  band: WindingBand;
  phase: "running" | "stopping" | "stopped";
  prefersReducedMotion: boolean;
  velocity01: number;
  progress01: number;
};

export function WindingCrown({
  angleDeg,
  tension01,
  band,
  phase,
  prefersReducedMotion,
  velocity01,
  progress01,
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
  const style = {
    ["--winding-angle" as "--winding-angle"]: `${angleDeg}deg`,
    ["--winding-progress" as "--winding-progress"]: normalizedProgress,
    ["--winding-tension" as "--winding-tension"]: normalizedTension,
    ["--winding-velocity" as "--winding-velocity"]: normalizedVelocity,
    ["--winding-glow" as "--winding-glow"]: glowIntensity,
    ["--winding-display-tension" as "--winding-display-tension"]: displayTension,
    ["--winding-gauge-progress" as "--winding-gauge-progress"]: normalizedProgress,
    ["--winding-spring-progress" as "--winding-spring-progress"]: springGaugeProgress,
    ["--winding-penalty" as "--winding-penalty"]: penaltyIntensity,
  } as React.CSSProperties;

  return (
    <div
      className={`winding-crown winding-crown-${band} winding-crown-phase-${phase} ${
        prefersReducedMotion ? "winding-crown-reduced-motion" : ""
      }`}
      style={style}
      aria-hidden="true"
    >
      <svg className="winding-crown-gauge" viewBox="0 0 72 72" role="presentation">
        <circle className="winding-gauge-track" cx="36" cy="36" r="30" fill="none" />
        <circle className="winding-gauge-spring" cx="36" cy="36" r="30" fill="none" />
        <circle className="winding-gauge-progress" cx="36" cy="36" r="30" fill="none" />
        <circle className="winding-gauge-penalty" cx="36" cy="36" r="30" fill="none" />
      </svg>
    </div>
  );
}
