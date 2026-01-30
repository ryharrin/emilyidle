import React, { useEffect, useMemo, useRef, useState } from "react";

export type AutomaticOutcomeTier = "miss" | "good" | "perfect";

export type AutomaticOutcome = {
  performance: number;
  tier: AutomaticOutcomeTier;
};

type AutomaticMiniGameModalProps = {
  open: boolean;
  itemLabel: string;
  onComplete: (outcome: AutomaticOutcome) => void;
  onClose: () => void;
};

const DEFAULT_RUN_DURATION_MS = 10_000;
const TEST_RUN_DURATION_MS = 1_500;
const STEP_MS_REDUCED_MOTION = 200;

const RESERVE_GAIN_BY_TIER: Record<AutomaticOutcomeTier, number> = {
  miss: 0.05,
  good: 0.1,
  perfect: 0.2,
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getTier(performance: number): AutomaticOutcomeTier {
  if (performance >= 0.75) {
    return "perfect";
  }
  if (performance >= 0.45) {
    return "good";
  }
  return "miss";
}

function getRunDurationMs(): number {
  if (typeof window === "undefined") {
    return DEFAULT_RUN_DURATION_MS;
  }

  const testMode = (window as unknown as { __EMILY_IDLE_TEST_MODE__?: boolean })
    .__EMILY_IDLE_TEST_MODE__;
  return testMode ? TEST_RUN_DURATION_MS : DEFAULT_RUN_DURATION_MS;
}

export function AutomaticMiniGameModal({
  open,
  itemLabel,
  onComplete,
  onClose,
}: AutomaticMiniGameModalProps): JSX.Element | null {
  const [needle, setNeedle] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [inBandMs, setInBandMs] = useState(0);
  const [result, setResult] = useState<null | AutomaticOutcome>(null);
  const needleRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const lastElapsedRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => getPrefersReducedMotion(), []);
  const runDurationMs = useMemo(() => getRunDurationMs(), []);

  const resetRun = () => {
    startTimeRef.current = null;
    lastElapsedRef.current = null;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setNeedle(0);
    needleRef.current = 0;
    setElapsedMs(0);
    setInBandMs(0);
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
        lastElapsedRef.current = 0;
      }

      const start = startTimeRef.current;
      const rawElapsedMs = Math.max(0, nowMs - start);
      const elapsed = Math.min(runDurationMs, rawElapsedMs);
      const steppedElapsed =
        stepMs > 0 ? Math.min(runDurationMs, Math.floor(elapsed / stepMs) * stepMs) : elapsed;
      const dt =
        lastElapsedRef.current === null ? 0 : Math.max(0, steppedElapsed - lastElapsedRef.current);
      lastElapsedRef.current = steppedElapsed;

      setElapsedMs(steppedElapsed);

      const driftDirection = Math.floor(steppedElapsed / 1_000) % 2 === 0 ? 1 : -1;
      const driftPerSec = 0.55;
      const drift = driftDirection * driftPerSec * (dt / 1_000);

      const nextNeedle = clamp(needleRef.current + drift, -1, 1);
      needleRef.current = nextNeedle;
      setNeedle(nextNeedle);

      if (dt > 0 && Math.abs(nextNeedle) <= 0.2) {
        setInBandMs((current) => Math.min(runDurationMs, current + dt));
      }

      if (steppedElapsed >= runDurationMs) {
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
  }, [open, prefersReducedMotion, runDurationMs]);

  useEffect(() => {
    if (!open || result) {
      return;
    }

    if (elapsedMs < runDurationMs) {
      return;
    }

    const performance = clamp01(inBandMs / runDurationMs);
    const tier = getTier(performance);
    const outcome: AutomaticOutcome = { performance, tier };
    setResult(outcome);
    onComplete(outcome);
  }, [elapsedMs, inBandMs, onComplete, open, result, runDurationMs]);

  if (!open) {
    return null;
  }

  const handleImpulse = (direction: -1 | 1) => {
    if (result) {
      return;
    }

    const next = clamp(needleRef.current + direction * 0.28, -1, 1);
    needleRef.current = next;
    setNeedle(next);
  };

  const targetPercent = Math.round(clamp01(inBandMs / runDurationMs) * 100);
  const needlePercent = Math.round(((needle + 1) / 2) * 100);

  const reserveGain = result ? Math.round((RESERVE_GAIN_BY_TIER[result.tier] ?? 0) * 100) : 0;
  const title = result
    ? result.tier === "perfect"
      ? "Perfect"
      : result.tier === "good"
        ? "Good"
        : "Miss"
    : "Keep the rotor balanced";

  return (
    <div
      className="nostalgia-modal automatic-modal"
      data-testid="automatic-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="nostalgia-modal-card automatic-modal-card">
        <header className="winding-modal-header">
          <div>
            <p className="eyebrow">Automatic</p>
            <h3>{itemLabel}</h3>
            <p className="muted winding-modal-subtitle">Hold the needle near center for 10s.</p>
          </div>
          <button
            type="button"
            className="secondary"
            data-testid="automatic-close"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="automatic-modal-body">
          <div className="automatic-track" aria-hidden="true">
            <div className="automatic-target" aria-hidden="true" />
            <div
              className="automatic-needle"
              aria-hidden="true"
              style={{ left: `${needlePercent}%` }}
            />
          </div>

          <div className="teaser-progress">
            <div className="teaser-track" aria-hidden="true">
              <div className="teaser-fill" style={{ width: `${targetPercent}%` }} />
            </div>
            <div>Stability: {targetPercent}%</div>
          </div>

          {!result ? (
            <div className="card-actions">
              <button type="button" data-testid="automatic-left" onClick={() => handleImpulse(-1)}>
                Left
              </button>
              <button
                type="button"
                className="secondary"
                data-testid="automatic-right"
                onClick={() => handleImpulse(1)}
              >
                Right
              </button>
            </div>
          ) : (
            <div
              className={`winding-outcome winding-outcome-${result.tier}`}
              data-testid="automatic-outcome"
            >
              <strong>
                {title} · Power reserve +{reserveGain}%
              </strong>
              <p className="muted">Boosted enjoyment while charged.</p>
              <div className="card-actions">
                <button type="button" data-testid="automatic-done" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
