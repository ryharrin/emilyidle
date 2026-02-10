import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import type { InteractionMiniGameMode, WatchItemId } from "../../game/state";
import {
  getInteractionDifficultyProfile,
  getInteractionPerfectStreakBonusMultiplierFromStreak,
  resolveInteractionOutcomeTier,
} from "../../game/state";
import { useModalAccessibility } from "./useModalAccessibility";

export type AutomaticOutcomeTier = "miss" | "good" | "perfect";

export type AutomaticOutcome = {
  performance: number;
  tier: AutomaticOutcomeTier;
};

type AutomaticMiniGameModalProps = {
  open: boolean;
  itemId: WatchItemId;
  itemLabel: string;
  mode: InteractionMiniGameMode;
  onModeChange: (mode: InteractionMiniGameMode) => void;
  currentPerfectStreak: number;
  onComplete: (outcome: AutomaticOutcome) => void;
  onClose: () => void;
  helpAction?: React.ReactNode;
};

const DEFAULT_RUN_DURATION_MS = 10_000;
const TEST_RUN_DURATION_MS = 1_500;
const STEP_MS_REDUCED_MOTION = 200;

export const RESERVE_GAIN_BY_TIER: Record<AutomaticOutcomeTier, number> = {
  miss: 0.05,
  good: 0.1,
  perfect: 0.2,
};

type AutomaticLiveMessageArgs = {
  result: AutomaticOutcome | null;
  targetPercent: number;
};

export function getAutomaticLiveMessage({
  result,
  targetPercent,
}: AutomaticLiveMessageArgs): string {
  if (result) {
    const tierLabel =
      result.tier === "perfect" ? "Perfect" : result.tier === "good" ? "Good" : "Miss";
    return `${tierLabel} balance locked • ${targetPercent}% stability • Reward reserved`;
  }

  return `Keep the rotor balanced • ${targetPercent}% stability • Hold until the outcome resolves`;
}

type AutomaticRewardCopy = {
  headline: string;
  detail: string;
};

const AUTOMATIC_REWARD_INFO: Record<AutomaticOutcomeTier, { prefix: string; detail: string }> = {
  miss: {
    prefix: "Missed pulses keep it calm",
    detail: "Misses keep the rotor steady but only deliver the baseline reserve boost.",
  },
  good: {
    prefix: "Good balance powers a steady reserve",
    detail: "Good pulses maintain stability and deliver a reliable charge.",
  },
  perfect: {
    prefix: "Perfect balance pays 2×",
    detail: "Perfect pulses maximize the reserve while rewarding precision.",
  },
};

export function getAutomaticRewardCopy(
  tier: AutomaticOutcomeTier,
  percent: number,
): AutomaticRewardCopy {
  const info = AUTOMATIC_REWARD_INFO[tier];
  return {
    headline: `${info.prefix} · Power reserve +${percent}%`,
    detail: info.detail,
  };
}

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

export function getTier(performance: number, itemId: WatchItemId): AutomaticOutcomeTier {
  return resolveInteractionOutcomeTier(performance, itemId);
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
  itemId,
  itemLabel,
  mode,
  onModeChange,
  currentPerfectStreak,
  onComplete,
  onClose,
  helpAction,
}: AutomaticMiniGameModalProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;

  useModalAccessibility({
    open,
    modalRef,
    onClose,
  });

  const [needle, setNeedle] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [inBandMs, setInBandMs] = useState(0);
  const [result, setResult] = useState<null | AutomaticOutcome>(null);
  const needleRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const lastElapsedRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const runStartStreakRef = useRef(currentPerfectStreak);

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
    runStartStreakRef.current = currentPerfectStreak;
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
  }, [currentPerfectStreak, open, prefersReducedMotion, runDurationMs]);

  useEffect(() => {
    if (!open || result) {
      return;
    }

    if (elapsedMs < runDurationMs) {
      return;
    }

    const performance = clamp01(inBandMs / runDurationMs);
    const tier = getTier(performance, itemId);
    const outcome: AutomaticOutcome = { performance, tier };
    setResult(outcome);
    onComplete(outcome);
  }, [elapsedMs, inBandMs, itemId, onComplete, open, result, runDurationMs]);

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

  const liveMessageText = getAutomaticLiveMessage({ result, targetPercent });
  const liveState = result ? "resolved" : "running";

  const difficultyProfile = useMemo(() => getInteractionDifficultyProfile(itemId), [itemId]);
  const streakMultiplier =
    result && mode === "normal" && result.tier === "perfect"
      ? getInteractionPerfectStreakBonusMultiplierFromStreak(runStartStreakRef.current)
      : 1;
  const rewardCopy =
    result && mode === "normal"
      ? getAutomaticRewardCopy(
          result.tier,
          Math.round((RESERVE_GAIN_BY_TIER[result.tier] ?? 0) * 100 * streakMultiplier),
        )
      : null;
  const outcomeState = result ? "resolved" : "running";

  return (
    <div
      className="nostalgia-modal automatic-modal overlay-instrument-modal"
      data-testid="automatic-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="nostalgia-modal-card automatic-modal-card modal-panel-card mini-game-modal-card"
        ref={modalRef}
      >
        <header className="winding-modal-header modal-panel-header">
          <div className="winding-modal-heading">
            <p className="eyebrow">Automatic</p>
            <h3 id={titleId}>{itemLabel}</h3>
            <p id={descriptionId} className="muted winding-modal-subtitle modal-panel-description">
              Hold the needle near center for 10s.
            </p>
            <p className="muted winding-modal-subtitle" data-testid="automatic-difficulty">
              Difficulty: {difficultyProfile.label}
            </p>
          </div>
          <div className="card-actions modal-panel-actions">
            {helpAction}
            <button
              type="button"
              className="secondary action-priority-secondary"
              data-testid="automatic-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="automatic-modal-body modal-panel-body" data-outcome-state={outcomeState}>
          <div
            className="winding-mode-strip modal-instrument-strip"
            data-testid="automatic-mode-strip"
          >
            <label className="winding-mode-toggle">
              <input
                type="checkbox"
                checked={mode === "practice"}
                onChange={(event) => onModeChange(event.target.checked ? "practice" : "normal")}
                data-testid="automatic-practice-toggle"
              />
              Practice mode (no rewards, no streak bonus)
            </label>
            <p className="muted" data-testid="automatic-streak-label">
              Perfect streak: {currentPerfectStreak}
            </p>
          </div>
          <div className="automatic-track" aria-hidden="true">
            <div className="automatic-target" aria-hidden="true" />
            <div
              className="automatic-needle"
              aria-hidden="true"
              style={{ left: `${needlePercent}%` }}
            />
          </div>

          <div
            className="automatic-live modal-live-readout"
            data-testid="automatic-live"
            aria-live="polite"
            data-live-state={liveState}
            role="status"
          >
            {liveMessageText}
          </div>

          <div className="teaser-progress">
            <div className="teaser-track" aria-hidden="true">
              <div className="teaser-fill" style={{ width: `${targetPercent}%` }} />
            </div>
            <div>Stability: {targetPercent}%</div>
          </div>

          {!result ? (
            <div className="card-actions modal-panel-actions">
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
              className={`automatic-outcome automatic-outcome-${result.tier}`}
              data-testid="automatic-outcome"
              data-tier={result.tier}
            >
              {mode === "practice" ? (
                <>
                  <strong>Practice run complete</strong>
                  <p className="muted automatic-outcome-copy">
                    Rewards and streak bonuses are disabled in practice mode.
                  </p>
                </>
              ) : (
                rewardCopy && (
                  <>
                    <strong>{rewardCopy.headline}</strong>
                    <p className="muted automatic-outcome-copy">{rewardCopy.detail}</p>
                    <p className="muted">Boosted enjoyment while charged.</p>
                  </>
                )
              )}
              <div className="card-actions modal-panel-actions">
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
