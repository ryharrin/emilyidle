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
    ["--winding-angle" as "--winding-angle"]: `${angleDeg}deg`,
    ["--winding-progress" as "--winding-progress"]: progress01,
    ["--winding-tension" as "--winding-tension"]: tension01,
    ["--winding-velocity" as "--winding-velocity"]: normalizedVelocity,
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
