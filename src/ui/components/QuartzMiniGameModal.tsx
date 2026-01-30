import React, { useEffect, useMemo, useRef, useState } from "react";

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

const RUN_DURATION_MS = 6_000;
const STEP_MS_REDUCED_MOTION = 180;

const CASH_PAYOUT_BY_TIER_CENTS: Record<QuartzOutcomeTier, number> = {
  miss: 100,
  good: 250,
  perfect: 500,
};

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

function getOutcomeTier(progress: number): QuartzOutcomeTier {
  const distance = Math.abs(progress - 0.5);
  if (distance <= 0.04) {
    return "perfect";
  }
  if (distance <= 0.14) {
    return "good";
  }
  return "miss";
}

function getPerformance(progress: number): number {
  const distance = Math.abs(progress - 0.5);
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
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => getPrefersReducedMotion(), []);

  const resetRun = () => {
    startTimeRef.current = null;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setProgress(0);
    setResult(null);
  };

  useEffect(() => {
    if (!open) {
      resetRun();
      return;
    }

    resetRun();
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
  }, [open, prefersReducedMotion]);

  if (!open) {
    return null;
  }

  const handleSet = () => {
    if (result) {
      return;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const tier = getOutcomeTier(progress);
    const outcome: QuartzOutcome = { tier, performance: getPerformance(progress) };
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
          <div className="quartz-dial" aria-hidden="true">
            <div className="quartz-target" aria-hidden="true" />
            <div
              className="quartz-hand"
              aria-hidden="true"
              style={{ transform: `translateX(-50%) rotate(${progress * 360}deg)` }}
            />
          </div>

          {!result ? (
            <p className="muted">Tap when the hand aligns with the marker to set the time.</p>
          ) : (
            <div
              className={`winding-outcome winding-outcome-${result.tier}`}
              data-testid="quartz-outcome"
            >
              <strong>
                {title} · Cash +{formatMoneyFromCents(payoutCents)}
              </strong>
              <p className="muted">Dealers pay for quick, accurate resets.</p>
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
