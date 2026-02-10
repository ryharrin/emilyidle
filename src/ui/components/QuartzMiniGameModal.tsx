import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { formatMoneyFromCents } from "../../game/format";
import type { InteractionMiniGameMode, WatchItemId } from "../../game/state";
import {
  getInteractionDifficultyProfile,
  getInteractionPerfectStreakBonusMultiplierFromStreak,
  resolveInteractionOutcomeTier,
} from "../../game/state";
import { useModalAccessibility } from "./useModalAccessibility";

export type QuartzOutcomeTier = "miss" | "good" | "perfect";

export type QuartzOutcome = {
  performance: number;
  tier: QuartzOutcomeTier;
};

type QuartzMiniGameModalProps = {
  open: boolean;
  itemId: WatchItemId;
  itemLabel: string;
  mode: InteractionMiniGameMode;
  onModeChange: (mode: InteractionMiniGameMode) => void;
  currentPerfectStreak: number;
  rewardRangeLabel: string;
  onComplete: (outcome: QuartzOutcome) => void;
  onClose: () => void;
  helpAction?: React.ReactNode;
};

const RUN_DURATION_MS = 10_000; // 10 seconds for full game
const STEP_MS_REDUCED_MOTION = 180;

export const QUARTZ_ENJOYMENT_BY_TIER_CENTS: Record<QuartzOutcomeTier, number> = {
  miss: 100,
  good: 250,
  perfect: 500,
};

// Static hour marker data (avoid array index as key)
const HOUR_MARKERS = [
  { angle: 0, isMajor: true },
  { angle: 30, isMajor: false },
  { angle: 60, isMajor: false },
  { angle: 90, isMajor: true },
  { angle: 120, isMajor: false },
  { angle: 150, isMajor: false },
  { angle: 180, isMajor: true },
  { angle: 210, isMajor: false },
  { angle: 240, isMajor: false },
  { angle: 270, isMajor: true },
  { angle: 300, isMajor: false },
  { angle: 330, isMajor: false },
];

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

export function getOutcomeTier(
  progress: number,
  targetPosition: number,
  itemId: WatchItemId,
): QuartzOutcomeTier {
  return resolveInteractionOutcomeTier(getPerformance(progress, targetPosition), itemId);
}

export function getPerformance(progress: number, targetPosition: number): number {
  const rawDistance = Math.abs(progress - targetPosition);
  const distance = Math.min(rawDistance, 1 - rawDistance);
  return clamp01(1 - distance / 0.5);
}

type QuartzLiveMessageArgs = {
  result: QuartzOutcome | null;
  progressPercent: number;
  targetTime: { hour: number; minute: number };
};

export function getQuartzLiveMessage({
  result,
  progressPercent,
  targetTime,
}: QuartzLiveMessageArgs): string {
  if (result) {
    const tierLabel =
      result.tier === "perfect" ? "Perfect" : result.tier === "good" ? "Good" : "Miss";
    return `${tierLabel} timing • Stopped at ${progressPercent}% near ${formatTime(targetTime.hour, targetTime.minute)} • Reward locked`;
  }

  return `Keep the minute hand near ${formatTime(targetTime.hour, targetTime.minute)} • ${progressPercent}% progress • Tap Set to lock the tier`;
}

type QuartzRewardCopy = {
  headline: string;
  detail: string;
};

const QUARTZ_REWARD_INFO: Record<QuartzOutcomeTier, { prefix: string; detail: string }> = {
  miss: {
    prefix: "Miss timing keeps the dial calm",
    detail: "Misses keep the clock steady and still earn the baseline reward.",
  },
  good: {
    prefix: "Good timing rewards steady enjoyment",
    detail: "Good hits keep the minute hand stable and deliver the dependable quartz reward.",
  },
  perfect: {
    prefix: "Perfect timing pays 2×",
    detail: "Perfect hits align the dial precisely and double the enjoyment.",
  },
};

export function getQuartzRewardCopy(
  tier: QuartzOutcomeTier,
  rewardMultiplier = 1,
): QuartzRewardCopy {
  const rewardCents = Math.max(
    0,
    Math.floor(QUARTZ_ENJOYMENT_BY_TIER_CENTS[tier] * rewardMultiplier),
  );
  const info = QUARTZ_REWARD_INFO[tier];
  const multiplierSuffix = rewardMultiplier > 1 ? ` (x${rewardMultiplier.toFixed(2)} streak)` : "";
  return {
    headline: `${info.prefix} · +${formatMoneyFromCents(rewardCents)} enjoyment${multiplierSuffix}`,
    detail: `${info.detail} Tier pays ${rewardCents / QUARTZ_ENJOYMENT_BY_TIER_CENTS.miss}× baseline enjoyment.`,
  };
}

export function QuartzMiniGameModal({
  open,
  itemId,
  itemLabel,
  mode,
  onModeChange,
  currentPerfectStreak,
  rewardRangeLabel,
  onComplete,
  onClose,
  helpAction,
}: QuartzMiniGameModalProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;

  useModalAccessibility({
    open,
    modalRef,
    onClose,
  });

  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | QuartzOutcome>(null);
  const [targetTime, setTargetTime] = useState<{ hour: number; minute: number } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const runStartStreakRef = useRef(currentPerfectStreak);

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
    if (open) {
      runStartStreakRef.current = currentPerfectStreak;
    }
  }, [currentPerfectStreak, open]);

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

  const difficultyProfile = useMemo(() => getInteractionDifficultyProfile(itemId), [itemId]);

  if (!open || !targetTime) {
    return null;
  }

  const targetPosition = timeToPosition(targetTime.hour, targetTime.minute);
  const progressPercent = Math.round(progress * 100);
  const liveMessageText = getQuartzLiveMessage({
    result,
    progressPercent,
    targetTime,
  });
  const streakMultiplier =
    result && mode === "normal" && result.tier === "perfect"
      ? getInteractionPerfectStreakBonusMultiplierFromStreak(runStartStreakRef.current)
      : 1;
  const rewardCopy =
    result && mode === "normal" ? getQuartzRewardCopy(result.tier, streakMultiplier) : null;
  const outcomeState = result ? "resolved" : "running";

  const handleSet = () => {
    if (result) {
      return;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const tier = getOutcomeTier(progress, targetPosition, itemId);
    const outcome: QuartzOutcome = { tier, performance: getPerformance(progress, targetPosition) };
    setResult(outcome);
    onComplete(outcome);
  };

  return (
    <div
      className="nostalgia-modal quartz-modal overlay-instrument-modal"
      data-testid="quartz-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="nostalgia-modal-card quartz-modal-card modal-panel-card mini-game-modal-card"
        ref={modalRef}
      >
        <header className="winding-modal-header modal-panel-header">
          <div className="winding-modal-heading">
            <p className="eyebrow">Quartz</p>
            <h3 id={titleId}>{itemLabel}</h3>
            <p id={descriptionId} className="muted winding-modal-subtitle modal-panel-description">
              Reward: {rewardRangeLabel}
            </p>
            <p className="muted winding-modal-subtitle" data-testid="quartz-difficulty">
              Difficulty: {difficultyProfile.label}
            </p>
          </div>
          <div className="card-actions modal-panel-actions">
            {helpAction}
            <button
              type="button"
              className="secondary action-priority-secondary"
              data-testid="quartz-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="quartz-modal-body modal-panel-body" data-outcome-state={outcomeState}>
          <div className="winding-mode-strip modal-instrument-strip" data-testid="quartz-mode-strip">
            <label className="winding-mode-toggle">
              <input
                type="checkbox"
                checked={mode === "practice"}
                onChange={(event) => onModeChange(event.target.checked ? "practice" : "normal")}
                data-testid="quartz-practice-toggle"
              />
              Practice mode (no rewards, no streak bonus)
            </label>
            <p className="muted" data-testid="quartz-streak-label">
              Perfect streak: {currentPerfectStreak}
            </p>
          </div>
          <div className="quartz-target-time modal-instrument-strip" data-testid="quartz-target-time">
            <strong>Set to: {formatTime(targetTime.hour, targetTime.minute)}</strong>
          </div>
          <div
            className="quartz-live modal-live-readout"
            data-testid="quartz-live"
            aria-live="polite"
            data-live-state={outcomeState}
          >
            {liveMessageText}
          </div>

          <div className="quartz-dial" data-testid="quartz-dial" aria-hidden="true">
            {/* Hour markers */}
            {HOUR_MARKERS.map((marker) => (
              <div
                key={marker.angle}
                className={`quartz-hour-marker ${marker.isMajor ? "quartz-hour-marker-major" : "quartz-hour-marker-minor"}`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${marker.angle}deg) translateY(-70px)`,
                }}
              />
            ))}

            {/* Target marker - shows where player needs to stop */}
            <div
              className="quartz-target-marker"
              style={{
                transform: `translate(-50%, -50%) rotate(${targetPosition * 360}deg) translateY(-60px)`,
              }}
            />

            {/* Hour hand - shows current approximate hour position */}
            <div className="quartz-anchor" data-testid="quartz-anchor" aria-hidden="true">
              <div
                className="quartz-hand quartz-hour-hand"
                data-testid="quartz-hour-hand"
                aria-hidden="true"
                style={{
                  transform: `rotate(${(progress * 360) % 360}deg)`,
                }}
              />
            </div>

            {/* Minute hand - the main hand player controls */}
            <div className="quartz-anchor" data-testid="quartz-minute-anchor" aria-hidden="true">
              <div
                className="quartz-hand quartz-minute-hand"
                data-testid="quartz-minute-hand"
                aria-hidden="true"
                style={{
                  transform: `rotate(${(progress * 360 * 12) % 360}deg)`,
                }}
              />
            </div>

            {/* Center dot */}
            <div className="quartz-center-dot" />
          </div>

          {!result ? (
            <p className="muted">
              Quartz watches aren't very enjoyable, but at least this one doesn't have a second
              hand. Tap when the hour hand lines up with{" "}
              {formatTime(targetTime.hour, targetTime.minute)}
            </p>
          ) : (
            <div
              className={`quartz-outcome quartz-outcome-${result.tier}`}
              data-testid="quartz-outcome"
              data-tier={result.tier}
            >
              {mode === "practice" ? (
                <>
                  <strong>Practice run complete</strong>
                  <p className="muted quartz-outcome-copy">
                    Rewards and streak bonuses are disabled in practice mode.
                  </p>
                </>
              ) : (
                rewardCopy && (
                  <>
                    <strong>{rewardCopy.headline}</strong>
                    <p className="muted quartz-outcome-copy">{rewardCopy.detail}</p>
                  </>
                )
              )}
              <p className="muted">Target was {formatTime(targetTime.hour, targetTime.minute)}.</p>
            </div>
          )}

          <div className="card-actions modal-panel-actions">
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
