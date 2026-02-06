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

export const QUARTZ_ENJOYMENT_BY_TIER_CENTS: Record<QuartzOutcomeTier, number> = {
  miss: 100,
  good: 250,
  perfect: 500,
};

const PERFECT_DISTANCE_FROM_CENTER = 0.03;
const GOOD_DISTANCE_FROM_CENTER = 0.18;

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
    detail: "Good hits keep the minute hand stable and deliver the dependable mid-tier reward.",
  },
  perfect: {
    prefix: "Perfect timing pays 2×",
    detail: "Perfect hits align the dial precisely and double the enjoyment.",
  },
};

const QUARTZ_TIER_LABELS: Record<QuartzOutcomeTier, string> = {
  miss: "Miss",
  good: "Good",
  perfect: "Perfect",
};

export function getQuartzRewardCopy(tier: QuartzOutcomeTier): QuartzRewardCopy {
  const rewardCents = QUARTZ_ENJOYMENT_BY_TIER_CENTS[tier];
  const info = QUARTZ_REWARD_INFO[tier];
  return {
    headline: `${info.prefix} · +${formatMoneyFromCents(rewardCents)} enjoyment`,
    detail: `${info.detail} Tier pays ${rewardCents / QUARTZ_ENJOYMENT_BY_TIER_CENTS.miss}× baseline enjoyment.`,
  };
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
  const progressPercent = Math.round(progress * 100);
  const liveMessageText = getQuartzLiveMessage({
    result,
    progressPercent,
    targetTime,
  });
  const rewardCopy = result ? getQuartzRewardCopy(result.tier) : null;
  const outcomeState = result ? "resolved" : "running";

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

        <div className="quartz-modal-body" data-outcome-state={outcomeState}>
          <div className="quartz-target-time" data-testid="quartz-target-time">
            <strong>Set to: {formatTime(targetTime.hour, targetTime.minute)}</strong>
          </div>
          <div
            className="quartz-live"
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
                className="quartz-hour-marker"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "2px",
                  height: marker.isMajor ? "12px" : "6px",
                  background: marker.isMajor
                    ? "rgba(232, 198, 147, 0.6)"
                    : "rgba(232, 198, 147, 0.3)",
                  transform: `translate(-50%, -50%) rotate(${marker.angle}deg) translateY(-70px)`,
                  transformOrigin: "center",
                }}
              />
            ))}

            {/* Target marker - shows where player needs to stop */}
            <div
              className="quartz-target-marker"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "4px",
                height: "20px",
                background: "rgba(72, 175, 255, 0.8)",
                borderRadius: "2px",
                transform: `translate(-50%, -50%) rotate(${targetPosition * 360}deg) translateY(-60px)`,
                transformOrigin: "center",
                boxShadow: "0 0 8px rgba(72, 175, 255, 0.5)",
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
                  width: "4px",
                  height: "45px",
                  background: "rgba(232, 198, 147, 0.6)",
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
                  width: "2px",
                  height: "65px",
                  background: "rgba(232, 198, 147, 0.9)",
                }}
              />
            </div>

            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "8px",
                height: "8px",
                background: "rgba(232, 198, 147, 1)",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            />
          </div>

          {!result ? (
            <p className="muted">
              Quartz watches aren't very enjoyable, but at least this one doesn't have a second
              hand. Tap when the hour hand lines up with{" "}
              {formatTime(targetTime.hour, targetTime.minute)}
            </p>
          ) : (
            rewardCopy && (
              <div
                className={`quartz-outcome quartz-outcome-${result.tier}`}
                data-testid="quartz-outcome"
                data-tier={result.tier}
              >
                <strong>{rewardCopy.headline}</strong>
                <p className="muted quartz-outcome-copy">{rewardCopy.detail}</p>
                <p className="muted">
                  Target was {formatTime(targetTime.hour, targetTime.minute)}.
                </p>
              </div>
            )
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
