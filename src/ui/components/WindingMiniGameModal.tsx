import React, { useEffect, useMemo, useRef, useState } from "react";

import { formatMoneyFromCents } from "../../game/format";

export type WindingOutcomeTier = "miss" | "good" | "perfect";

export type WindingOutcome = {
  performance: number;
  tier: WindingOutcomeTier;
};

type WindingMiniGameModalProps = {
  open: boolean;
  itemLabel: string;
  rewardRangeLabel: string;
  cooldownLabel: string;
  onComplete: (outcome: WindingOutcome) => void;
  onClose: () => void;
  helpAction?: React.ReactNode;
};

const RUN_DURATION_MS = 4_000;
const STEP_MS_REDUCED_MOTION = 180;

const ENJOYMENT_BY_TIER_CENTS: Record<WindingOutcomeTier, number> = {
  miss: 25,
  good: 75,
  perfect: 150,
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function getOutcomeTier(progress: number): WindingOutcomeTier {
  const distance = Math.abs(progress - 0.5);
  if (distance <= 0.035) {
    return "perfect";
  }
  if (distance <= 0.12) {
    return "good";
  }
  return "miss";
}

function getPerformance(progress: number): number {
  const distance = Math.abs(progress - 0.5);
  return clamp01(1 - distance / 0.5);
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WindingMiniGameModal({
  open,
  itemLabel,
  rewardRangeLabel,
  cooldownLabel,
  onComplete,
  onClose,
  helpAction,
}: WindingMiniGameModalProps): JSX.Element | null {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | WindingOutcome>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => getPrefersReducedMotion(), []);
  const statusTier = result?.tier ?? null;
  const statusLabel = useMemo(() => {
    if (!statusTier) {
      return null;
    }
    return statusTier === "perfect" ? "Perfect" : statusTier === "good" ? "Good" : "Miss";
  }, [statusTier]);
  const rewardCents = statusTier ? (ENJOYMENT_BY_TIER_CENTS[statusTier] ?? 0) : 0;

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

  const handleStop = () => {
    if (result) {
      return;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const tier = getOutcomeTier(progress);
    const outcome: WindingOutcome = {
      tier,
      performance: getPerformance(progress),
    };
    setResult(outcome);
    onComplete(outcome);
  };

  return (
    <div
      className="nostalgia-modal winding-modal"
      data-testid="winding-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="nostalgia-modal-card winding-modal-card">
        <header className="winding-modal-header">
          <div>
            <p className="eyebrow">Winding</p>
            <h3>{itemLabel}</h3>
            <p className="muted winding-modal-subtitle">Reward: {rewardRangeLabel}</p>
          </div>
          <div className="card-actions">
            {helpAction}
            <button
              type="button"
              className="secondary"
              data-testid="winding-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="winding-modal-body">
          <div
            className={`winding-crown ${result ? `winding-crown-${result.tier}` : "winding-crown-running"}`}
            aria-hidden="true"
          />

          <div className="winding-track" data-testid="winding-track" onClick={handleStop}>
            <div className="winding-sweetspot" aria-hidden="true" />
            <div
              className="winding-indicator"
              aria-hidden="true"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          {!result ? (
            <p className="muted">Tap when the marker hits the gold window.</p>
          ) : (
            <div
              className={`winding-outcome winding-outcome-${result.tier}`}
              data-testid="winding-outcome"
            >
              <strong>
                {statusLabel} · +{formatMoneyFromCents(rewardCents)} enjoyment
              </strong>
              <p className="muted">{cooldownLabel}</p>
            </div>
          )}

          <div className="card-actions">
            {!result ? (
              <button type="button" data-testid="winding-stop" onClick={handleStop}>
                Stop
              </button>
            ) : (
              <button type="button" data-testid="winding-done" onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
