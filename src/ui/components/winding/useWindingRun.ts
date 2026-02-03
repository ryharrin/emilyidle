import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp01, getWindingBand, getWindingVelocity, WindingBand } from "./windingMath";

type PhaseState = "running" | "stopping" | "stopped";

export type UseWindingRunOptions = {
  open: boolean;
  runDurationMs: number;
  prefersReducedMotion: boolean;
  stepMsReducedMotion: number;
};

export type UseWindingRunResult = {
  progress01: number;
  crownAngleDeg: number;
  tension01: number;
  band: WindingBand;
  phase: PhaseState;
  stop: () => void;
  progressVelocity: number;
  velocity01: number;
};

const ANGLE_BASE_SPEED = 80;
const ANGLE_SPEED_BOOST = 220;
const DECEL_DURATION_MS = 420;

const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const calculateTension = (progress01: number): number => {
  const base = clamp01((progress01 - 0.3) / 0.7);
  if (progress01 > 0.95) {
    return clamp01(base + (progress01 - 0.95) * 4);
  }
  return base;
};

export function useWindingRun({
  open,
  runDurationMs,
  prefersReducedMotion,
  stepMsReducedMotion,
}: UseWindingRunOptions): UseWindingRunResult {
  const [progress01, setProgress01] = useState(0);
  const [phase, setPhase] = useState<PhaseState>("stopped");
  const [crownAngleDeg, setCrownAngleDeg] = useState(0);
  const [progressVelocity, setProgressVelocity] = useState(0);

  const progressRef = useRef(0);
  const runningRaf = useRef<number | null>(null);
  const decelRaf = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const stopRequestedRef = useRef(false);
  const angleRef = useRef(0);
  const lastSpeedRef = useRef(ANGLE_BASE_SPEED);
  const decelStartRef = useRef<number | null>(null);
  const decelLastTickRef = useRef<number | null>(null);

  const band = getWindingBand(progress01);
  const tension01 = useMemo(() => calculateTension(progress01), [progress01]);
  const velocity01 = useMemo(() => getWindingVelocity(progress01), [progress01]);

  const cleanupAnimation = useCallback(() => {
    if (runningRaf.current !== null) {
      cancelAnimationFrame(runningRaf.current);
      runningRaf.current = null;
    }
    if (decelRaf.current !== null) {
      cancelAnimationFrame(decelRaf.current);
      decelRaf.current = null;
    }
  }, []);

  const startDecel = useCallback((timestamp: number) => {
    decelStartRef.current = timestamp;
    decelLastTickRef.current = timestamp;
    const initialSpeed = lastSpeedRef.current;

    const tick = (now: number) => {
      const elapsed = now - (decelStartRef.current ?? now);
      const delta = now - (decelLastTickRef.current ?? now);
      decelLastTickRef.current = now;
      const mix = clamp01(elapsed / DECEL_DURATION_MS);
      const easedSpeed = initialSpeed * (1 - mix);
      angleRef.current = (angleRef.current + (easedSpeed * delta) / 1000) % 360;
      setCrownAngleDeg(angleRef.current);
      if (mix < 1) {
        decelRaf.current = requestAnimationFrame(tick);
      } else {
        setPhase("stopped");
        decelRaf.current = null;
      }
    };

    decelRaf.current = requestAnimationFrame(tick);
  }, []);

  const runningTick = useCallback(
    (timestamp: number) => {
      if (!open || stopRequestedRef.current) {
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;
      const rawProgress = clamp01(elapsed / runDurationMs);
      const steppedProgress = prefersReducedMotion
        ? Math.min(
            1,
            (Math.floor(elapsed / stepMsReducedMotion) * stepMsReducedMotion) / runDurationMs,
          )
        : rawProgress;

      const nextProgress = Math.min(1, steppedProgress);
      const deltaSeconds = Math.max(delta / 1000, 0.001);
      const deltaProgress = nextProgress - progressRef.current;
      const velocity = deltaProgress / deltaSeconds;
      setProgressVelocity(velocity);
      progressRef.current = nextProgress;
      setProgress01(nextProgress);

      const speed = ANGLE_BASE_SPEED + ANGLE_SPEED_BOOST * Math.min(1, nextProgress * 1.1);
      lastSpeedRef.current = speed;
      angleRef.current = (angleRef.current + (speed * delta) / 1000) % 360;
      setCrownAngleDeg(angleRef.current);

      if (nextProgress >= 1) {
        stopRequestedRef.current = true;
        setPhase("stopping");
        startDecel(timestamp);
        return;
      }
    },
    [open, runDurationMs, prefersReducedMotion, stepMsReducedMotion, startDecel],
  );

  useEffect(() => {
    if (!open) {
      cleanupAnimation();
      progressRef.current = 0;
      setProgress01(0);
      setCrownAngleDeg(0);
      setProgressVelocity(0);
      setPhase("stopped");
      stopRequestedRef.current = false;
      startTimeRef.current = null;
      lastTickRef.current = null;
      return;
    }

    stopRequestedRef.current = false;
    progressRef.current = 0;
    setProgress01(0);
    setCrownAngleDeg(0);
    setPhase("running");
    startTimeRef.current = null;
    lastTickRef.current = null;
    runningRaf.current = requestAnimationFrame(runningTick);

    return () => {
      cleanupAnimation();
    };
  }, [open, runningTick, cleanupAnimation]);

  useEffect(() => {
    return () => {
      cleanupAnimation();
    };
  }, [cleanupAnimation]);

  const stop = () => {
    if (stopRequestedRef.current || phase !== "running") {
      return;
    }
    stopRequestedRef.current = true;
    setPhase("stopping");
    cleanupAnimation();
    setProgressVelocity(0);
    startDecel(nowMs());
  };

  return {
    progress01,
    crownAngleDeg,
    tension01,
    band,
    phase,
    progressVelocity,
    velocity01,
    stop,
  };
}
