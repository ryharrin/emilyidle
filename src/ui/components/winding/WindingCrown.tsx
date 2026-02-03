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
  const glowIntensity = clamp01(normalizedVelocity + normalizedTension * 0.6);
  const style = {
    ["--winding-angle" as "--winding-angle"]: `${angleDeg}deg`,
    ["--winding-progress" as "--winding-progress"]: normalizedProgress,
    ["--winding-tension" as "--winding-tension"]: normalizedTension,
    ["--winding-velocity" as "--winding-velocity"]: normalizedVelocity,
    ["--winding-glow" as "--winding-glow"]: glowIntensity,
  } as React.CSSProperties;

  return (
    <div
      className={`winding-crown winding-crown-${band} winding-crown-phase-${phase} ${
        prefersReducedMotion ? "winding-crown-reduced-motion" : ""
      }`}
      style={style}
      aria-hidden="true"
    />
  );
}
