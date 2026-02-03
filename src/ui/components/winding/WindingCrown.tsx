import React from "react";
import { WindingBand } from "./windingMath";

type Props = {
  angleDeg: number;
  tension01: number;
  band: WindingBand;
  phase: "running" | "stopping" | "stopped";
  prefersReducedMotion: boolean;
  velocity01: number;
  progress01: number;
};

const WINDING_ANGLE_VAR = "--winding-angle" as const;
const WINDING_PROGRESS_VAR = "--winding-progress" as const;
const WINDING_TENSION_VAR = "--winding-tension" as const;
const WINDING_VELOCITY_VAR = "--winding-velocity" as const;

export function WindingCrown({
  angleDeg,
  tension01,
  band,
  phase,
  prefersReducedMotion,
  velocity01,
  progress01,
}: Props) {
  const normalizedVelocity = Math.max(0, Math.min(1.25, velocity01));
  const style = {
    [WINDING_ANGLE_VAR]: `${angleDeg}deg`,
    [WINDING_PROGRESS_VAR]: progress01,
    [WINDING_TENSION_VAR]: tension01,
    [WINDING_VELOCITY_VAR]: normalizedVelocity,
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
