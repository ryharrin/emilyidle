import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatMoneyFromCents } from "../../game/format";

export type QuartzOutcomeTier = "miss" | "good" | "perfect";

export type QuartzOutcome = {
  performance: number;
  tier: QuartzOutcomeTier;
};

type QuartzMiniGameModalProps = {
  open: boolean;
  itemLabel: string;
  rewardRangeLabel: string;
  onComplete: (outcome: QuartzOutcome) => void;
  onClose: () => void;
  helpAction?: React.ReactNode;
};

const RUN_DURATION_MS = 10_000; // 10 seconds for full game
const STEP_MS_REDUCED_MOTION = 180;

const CASH_PAYOUT_BY_TIER_CENTS: Record<QuartzOutcomeTier, number> = {
  miss: 100,
  good: 250,
  perfect: 500,
};

const PERFECT_DISTANCE_FROM_CENTER = 0.03;
const GOOD_DISTANCE_FROM_CENTER = 0.18;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Generate a random target time
function generateTargetTime(): { hour: number; minute: number } {
  const hour = Math.floor(Math.random() * 12) + 1; // 1-12
  const minute = Math.floor(Math.random() * 60); // 0-59
  return { hour, minute };
}

// Convert time to hand position (0-1, where 0 is 12 o'clock)
export function timeToPosition(hour: number, minute: number): number {
  // Hour hand position: each hour = 1/12, each minute adds 1/720
  const hour12 = hour % 12 || 12;
  return (hour12 / 12 + minute / 720) % 1;
}

// Format time for display
function formatTime(hour: number, minute: number): string {
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

export function getOutcomeTier(progress: number, targetPosition: number): QuartzOutcomeTier {
  // Distance from target (wraps around)
  const rawDistance = Math.abs(progress - targetPosition);
  const distance = Math.min(rawDistance, 1 - rawDistance);
  if (distance <= PERFECT_DISTANCE_FROM_CENTER) {
    return "perfect";
  }
  if (distance <= GOOD_DISTANCE_FROM_CENTER) {
    return "good";
  }
  return "miss";
}

export function getPerformance(progress: number, targetPosition: number): number {
  const rawDistance = Math.abs(progress - targetPosition);
  const distance = Math.min(rawDistance, 1 - rawDistance);
  return clamp01(1 - distance / 0.5);
}

export function QuartzMiniGameModal({
  open,
  itemLabel,
  rewardRangeLabel,
  onComplete,
  onClose,
  helpAction,
}: QuartzMiniGameModalProps): JSX.Element | null {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | QuartzOutcome>(null);
  const [targetTime, setTargetTime] = useState<{ hour: number; minute: number } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => getPrefersReducedMotion(), []);

  // Generate new target time when modal opens
  useEffect(() => {
    if (open && !targetTime) {
      setTargetTime(generateTargetTime());
    }
  }, [open, targetTime]);

  const resetRun = useCallback(() => {
    startTimeRef.current = null;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setProgress(0);
    setResult(null);
    setTargetTime(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetRun();
      return;
    }

    resetRun();
    // Generate new target time
    setTargetTime(generateTargetTime());

    const stepMs = prefersReducedMotion ? STEP_MS_REDUCED_MOTION : 0;

    const tick = (nowMs: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = nowMs;
      }

      const elapsedMs = nowMs - startTimeRef.current;
      const normalized = clamp01(elapsedMs / RUN_DURATION_MS);
      const stepped =
        stepMs > 0
          ? Math.min(1, (Math.floor(elapsedMs / stepMs) * stepMs) / RUN_DURATION_MS)
          : normalized;

      setProgress(stepped);

      if (stepped >= 1) {
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [open, prefersReducedMotion, resetRun]);

  if (!open || !targetTime) {
    return null;
  }

  const targetPosition = timeToPosition(targetTime.hour, targetTime.minute);

  const handleSet = () => {
    if (result) {
      return;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const tier = getOutcomeTier(progress, targetPosition);
    const outcome: QuartzOutcome = { tier, performance: getPerformance(progress, targetPosition) };
    setResult(outcome);
    onComplete(outcome);
  };

  const title = result
    ? result.tier === "perfect"
      ? "Perfect"
      : result.tier === "good"
        ? "Good"
        : "Miss"
    : "Set the time";
  const payoutCents = result ? (CASH_PAYOUT_BY_TIER_CENTS[result.tier] ?? 0) : 0;

  return (
    <div
      className="nostalgia-modal quartz-modal"
      data-testid="quartz-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="nostalgia-modal-card quartz-modal-card">
        <header className="winding-modal-header">
          <div>
            <p className="eyebrow">Quartz</p>
            <h3>{itemLabel}</h3>
            <p className="muted winding-modal-subtitle">Reward: {rewardRangeLabel}</p>
          </div>
          <div className="card-actions">
            {helpAction}
            <button
              type="button"
              className="secondary"
              data-testid="quartz-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="quartz-modal-body">
          <div className="quartz-target-time" data-testid="quartz-target-time">
            <strong>Set to: {formatTime(targetTime.hour, targetTime.minute)}</strong>
          </div>

          <div className="quartz-dial" data-testid="quartz-dial" aria-hidden="true">
            <div className="quartz-target" aria-hidden="true" />
            <div className="quartz-anchor" data-testid="quartz-anchor" aria-hidden="true">
              <div
                className="quartz-hand"
                data-testid="quartz-hand"
                aria-hidden="true"
                style={{ transform: `rotate(${progress * 360}deg)` }}
              />
            </div>
          </div>

          {!result ? (
            <p className="muted">
              Tap when the hour hand points to {formatTime(targetTime.hour, targetTime.minute)}. The
              wider Good window rewards close hits while perfect still demands the tightest
              alignment.
            </p>
          ) : (
            <div
              className={`winding-outcome winding-outcome-${result.tier}`}
              data-testid="quartz-outcome"
            >
              <strong>
                {title} · Cash +{formatMoneyFromCents(payoutCents)}
              </strong>
              <p className="muted">Target was {formatTime(targetTime.hour, targetTime.minute)}.</p>
            </div>
          )}

          <div className="card-actions">
            {!result ? (
              <button type="button" data-testid="quartz-action" onClick={handleSet}>
                Set time
              </button>
            ) : (
              <button type="button" data-testid="quartz-done" onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
