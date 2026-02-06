import { PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clamp01,
  getWindingBand,
  getWindingPenaltyFlags,
  getWindingTension,
  getWindingVelocity,
  WindingBand,
} from "./windingMath";

type PhaseState = "running" | "stopping" | "stopped";

type PointerState = {
  pointerId: number;
  lastX: number;
  lastY: number;
  lastTime: number;
};

export type UseWindingRunOptions = {
  open: boolean;
  runDurationMs: number;
  prefersReducedMotion: boolean;
  stepMsReducedMotion: number;
};

export type WindingSurfaceBind = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
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
  progressPercent: number;
  tensionPercent: number;
  velocityPercent: number;
  softPenalty: boolean;
  strictPenalty: boolean;
  bind: WindingSurfaceBind;
};

const ANGLE_BASE_SPEED = 80;
const ANGLE_SPEED_BOOST = 220;
const DECEL_DURATION_MS = 420;
const DRAG_DISTANCE_PER_MS = 0.1;
const MIN_DRAG_DISTANCE = 1;
const MIN_PROGRESS_STEP = 0.02;

const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

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
  const dragDistanceRef = useRef(0);
  const pointerStateRef = useRef<PointerState | null>(null);
  const stopRequestedRef = useRef(false);
  const angleRef = useRef(0);
  const lastSpeedRef = useRef(ANGLE_BASE_SPEED);
  const decelRaf = useRef<number | null>(null);
  const decelStartRef = useRef<number | null>(null);
  const decelLastTickRef = useRef<number | null>(null);

  const tension01 = useMemo(() => getWindingTension(progress01), [progress01]);
  const velocity01 = useMemo(() => getWindingVelocity(progress01), [progress01]);
  const band = useMemo(() => getWindingBand(progress01), [progress01]);
  const progressPercent = useMemo(() => Math.round(progress01 * 100), [progress01]);
  const tensionPercent = useMemo(() => Math.round(tension01 * 100), [tension01]);
  const velocityPercent = useMemo(
    () => Math.round(Math.min(1, Math.max(0, velocity01)) * 100),
    [velocity01],
  );
  const { softPenalty, strictPenalty } = useMemo(
    () => getWindingPenaltyFlags(progress01),
    [progress01],
  );

  const cleanupAnimation = useCallback(() => {
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

  const fullDragDistance = useMemo(
    () => Math.max(runDurationMs * DRAG_DISTANCE_PER_MS, MIN_DRAG_DISTANCE),
    [runDurationMs],
  );

  const quantizeProgress = useCallback(
    (value: number) => {
      if (!prefersReducedMotion || stepMsReducedMotion <= 0) {
        return clamp01(value);
      }
      const stepFraction = Math.max(
        MIN_PROGRESS_STEP,
        (stepMsReducedMotion * DRAG_DISTANCE_PER_MS) / fullDragDistance,
      );
      return clamp01(Math.round(value / stepFraction) * stepFraction);
    },
    [prefersReducedMotion, stepMsReducedMotion, fullDragDistance],
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.button !== 0 || !open || stopRequestedRef.current) {
        return;
      }
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      pointerStateRef.current = {
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
      };
      dragDistanceRef.current = 0;
    },
    [open],
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      const state = pointerStateRef.current;
      if (!state || state.pointerId !== event.pointerId || stopRequestedRef.current || !open) {
        return;
      }
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      const distance = Math.hypot(dx, dy);
      const deltaSeconds = Math.max((event.timeStamp - state.lastTime) / 1000, 0.001);
      if (distance <= 0) {
        pointerStateRef.current = {
          ...state,
          lastX: event.clientX,
          lastY: event.clientY,
          lastTime: event.timeStamp,
        };
        setProgressVelocity(0);
        return;
      }

      const nextDragDistance = Math.min(fullDragDistance, dragDistanceRef.current + distance);
      const rawProgress = nextDragDistance / fullDragDistance;
      const quantized = quantizeProgress(rawProgress);
      const nextProgress = Math.min(1, quantized);
      const deltaProgress = nextProgress - progressRef.current;
      const velocity = deltaSeconds > 0 ? deltaProgress / deltaSeconds : 0;
      setProgressVelocity(velocity);

      if (deltaProgress > 0) {
        progressRef.current = nextProgress;
        setProgress01(nextProgress);
        const speed = ANGLE_BASE_SPEED + ANGLE_SPEED_BOOST * Math.min(1, nextProgress * 1.1);
        lastSpeedRef.current = speed;
        angleRef.current = (angleRef.current + speed * deltaSeconds) % 360;
        setCrownAngleDeg(angleRef.current);
      }

      dragDistanceRef.current = nextDragDistance;

      pointerStateRef.current = {
        pointerId: state.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
      };
    },
    [fullDragDistance, open, quantizeProgress],
  );

  const releasePointer = useCallback<PointerEventHandler<HTMLDivElement>>((event) => {
    const state = pointerStateRef.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    pointerStateRef.current = null;
  }, []);

  const bind: WindingSurfaceBind = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: releasePointer,
      onPointerCancel: releasePointer,
    }),
    [handlePointerDown, handlePointerMove, releasePointer],
  );

  useEffect(() => {
    if (!open) {
      cleanupAnimation();
      progressRef.current = 0;
      pointerStateRef.current = null;
      setProgress01(0);
      setCrownAngleDeg(0);
      setProgressVelocity(0);
      setPhase("stopped");
      stopRequestedRef.current = false;
      lastSpeedRef.current = ANGLE_BASE_SPEED;
      dragDistanceRef.current = 0;
      return;
    }

    stopRequestedRef.current = false;
    progressRef.current = 0;
    pointerStateRef.current = null;
    setProgress01(0);
    setCrownAngleDeg(0);
    setProgressVelocity(0);
    setPhase("running");
    lastSpeedRef.current = ANGLE_BASE_SPEED;
    dragDistanceRef.current = 0;
  }, [cleanupAnimation, open]);

  useEffect(() => {
    return () => {
      cleanupAnimation();
    };
  }, [cleanupAnimation]);

  const stop = useCallback(() => {
    if (stopRequestedRef.current) {
      return;
    }
    stopRequestedRef.current = true;
    setPhase("stopping");
    cleanupAnimation();
    setProgressVelocity(0);
    startDecel(nowMs());
  }, [cleanupAnimation, startDecel]);

  return {
    progress01,
    crownAngleDeg,
    tension01,
    band,
    phase,
    progressVelocity,
    velocity01,
    progressPercent,
    tensionPercent,
    velocityPercent,
    softPenalty,
    strictPenalty,
    stop,
    bind,
  };
}
