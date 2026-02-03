import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { formatMoneyFromCents } from "../../game/format";
import { getOutcomeTierFromBand, getWindingBandLabel, WindingBand } from "./winding/windingMath";
import { useWindingRun } from "./winding/useWindingRun";
import { WindingCrown } from "./winding/WindingCrown";

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
  showTapHint?: boolean;
  onTapHintDismiss?: () => void;
};

const RUN_DURATION_MS = 5_600;
const STEP_MS_REDUCED_MOTION = 180;
export const ENJOYMENT_BY_TIER_CENTS: Record<WindingOutcomeTier, number> = {
  miss: 25,
  good: 75,
  perfect: 150,
};

type WindingLiveMessageArgs = {
  result: WindingOutcome | null;
  progressPercent: number;
  bandLabel: string;
  tensionPercent: number;
  softWarningActive: boolean;
};

export function getWindingLiveMessage({
  result,
  progressPercent,
  bandLabel,
  tensionPercent,
  softWarningActive,
}: WindingLiveMessageArgs): string {
  if (result) {
    const tierLabel =
      result.tier === "perfect" ? "Perfect" : result.tier === "good" ? "Good" : "Miss";
    return `${tierLabel} timing • Stopped at ${progressPercent}% — ${bandLabel} • Reward locked`;
  }

  const tensionCopy = softWarningActive
    ? `Tension ${tensionPercent}% • red glow approaching`
    : `Tension ${tensionPercent}%`;
  return `Keep winding... ${progressPercent}% progress • ${tensionCopy} • ${bandLabel} • Stop to lock in the tier`;
}

type WindingRewardCopy = {
  headline: string;
  detail: string;
};

const WINDING_REWARD_INFO: Record<WindingOutcomeTier, { prefix: string; detail: string }> = {
  miss: {
    prefix: "Miss hits keep the crown calm 1×",
    detail: "Miss timing stays safe and earns the baseline enjoyment.",
  },
  good: {
    prefix: "Good timing keeps torque steady",
    detail: "Good hits deliver steady enjoyment while the needle stays in the green.",
  },
  perfect: {
    prefix: "Perfect timing pays 2×",
    detail: "Perfect tension doubles the reward without touching the red glow.",
  },
};

export function getWindingRewardCopy(tier: WindingOutcomeTier): WindingRewardCopy {
  const rewardCents = ENJOYMENT_BY_TIER_CENTS[tier];
  const info = WINDING_REWARD_INFO[tier];
  return {
    headline: `${info.prefix} · +${formatMoneyFromCents(rewardCents)} enjoyment`,
    detail: info.detail,
  };
}

const focusableSelector =
  "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

const BAND_ORDER: WindingBand[] = ["under", "good", "perfect", "over"];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function computePerformance(progress: number): number {
  const distance = Math.abs(progress - 0.5);
  return Math.max(0, 1 - distance / 0.5);
}

export function WindingMiniGameModal({
  open,
  itemLabel,
  rewardRangeLabel,
  cooldownLabel,
  onComplete,
  onClose,
  helpAction,
  showTapHint = false,
  onTapHintDismiss,
}: WindingMiniGameModalProps): JSX.Element | null {
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    progress01,
    crownAngleDeg,
    tension01,
    band,
    phase,
    stop,
    progressVelocity,
    velocity01,
    softPenalty,
    strictPenalty,
  } = useWindingRun({
    open,
    runDurationMs: RUN_DURATION_MS,
    prefersReducedMotion,
    stepMsReducedMotion: STEP_MS_REDUCED_MOTION,
  });

  const [result, setResult] = useState<WindingOutcome | null>(null);
  const [hintDismissed, setHintDismissed] = useState(!showTapHint);
  const hintCallbackRef = useRef(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const stopButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const prevOpenRef = useRef(open);

  useEffect(() => {
    setHintDismissed(!showTapHint);
    if (!showTapHint) {
      hintCallbackRef.current = false;
    }
  }, [showTapHint]);

  const persistHintDismissed = useCallback(() => {
    if (hintCallbackRef.current) {
      return;
    }
    hintCallbackRef.current = true;
    setHintDismissed(true);
    onTapHintDismiss?.();
  }, [onTapHintDismiss]);

  const handleClose = useCallback(() => {
    persistHintDismissed();
    onClose();
  }, [onClose, persistHintDismissed]);

  const handleStop = () => {
    if (result) {
      return;
    }

    stop();
    const outcome: WindingOutcome = {
      tier: getOutcomeTierFromBand(band),
      performance: computePerformance(progress01),
    };
    setResult(outcome);
    onComplete(outcome);
    persistHintDismissed();
  };

  useLayoutEffect(() => {
    const previouslyOpen = prevOpenRef.current;
    if (open && !previouslyOpen) {
      setResult(null);
    }
    if (!open && previouslyOpen) {
      setResult(null);
    }
    prevOpenRef.current = open;
  }, [open]);

  useLayoutEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    stopButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (!open) {
        previouslyFocusedRef.current?.focus();
      }
    };
  }, [handleClose, open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.dataset.windingScrollLocked = "true";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      delete document.documentElement.dataset.windingScrollLocked;
    };
  }, [open]);

  const handleTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStop();
    }
  };

  const getFocusableElements = () => {
    const modal = modalRef.current;
    if (!modal) {
      return [] as HTMLElement[];
    }
    return Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
  };

  const handleTopSentinel = () => {
    const focusables = getFocusableElements();
    focusables[focusables.length - 1]?.focus();
  };

  const handleBottomSentinel = () => {
    const focusables = getFocusableElements();
    focusables[0]?.focus();
  };

  const rewardCopy = result ? getWindingRewardCopy(result.tier) : null;
  const shouldShowHint = showTapHint && !hintDismissed;
  const bandLabel = getWindingBandLabel(band);
  const tensionPercent = Math.round(tension01 * 100);
  const progressPercent = Math.round(progress01 * 100);
  const velocityPulse = Math.min(1, Math.max(0, velocity01));
  const softWarningActive = softPenalty && !strictPenalty;
  const isOverWound = strictPenalty;
  const legendAnnouncement = "Band legend: Under-wound, Good wind, Perfect tension, Over-wound!";
  const liveMessageText = getWindingLiveMessage({
    result,
    progressPercent,
    bandLabel,
    tensionPercent,
    softWarningActive,
  });
  const trackStyle = {
    ["--winding-progress" as "--winding-progress"]: progress01,
    ["--winding-velocity" as "--winding-velocity"]: velocityPulse,
    ["--winding-tension" as "--winding-tension"]: tension01,
  } as React.CSSProperties;

  return open ? (
    <div className="nostalgia-modal winding-modal" data-testid="winding-modal" role="presentation">
      <div
        className="nostalgia-modal-card winding-modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
      >
        <span tabIndex={0} className="winding-focus-sentinel" onFocus={handleTopSentinel} />
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
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="winding-modal-body">
          <div className="winding-status-grid">
            <WindingCrown
              angleDeg={crownAngleDeg}
              tension01={tension01}
              band={band}
              phase={phase}
              prefersReducedMotion={prefersReducedMotion}
              velocity01={velocity01}
              progress01={progress01}
            />
            <div className="winding-progress-readout">
              {result ? (
                <>
                  <strong>Stopped at {progressPercent}%</strong>
                  <p className="muted">{bandLabel}</p>
                </>
              ) : (
                <>
                  <strong>{progressPercent}%</strong>
                  <p className="muted">Tension: {tensionPercent}%</p>
                  <p className="muted">{bandLabel}</p>
                </>
              )}
            </div>
          </div>

          <div
            className="winding-track"
            data-testid="winding-track"
            data-soft-penalty={softWarningActive ? "true" : "false"}
            role="button"
            tabIndex={0}
            onClick={handleStop}
            onKeyDown={handleTrackKeyDown}
            style={trackStyle}
          >
            <div className="winding-track-band winding-track-under" aria-hidden="true" />
            <div className="winding-track-band winding-track-good" aria-hidden="true" />
            <div className="winding-track-band winding-track-perfect" aria-hidden="true" />
            <div className="winding-track-band winding-track-over" aria-hidden="true" />
            <div
              className="winding-indicator"
              aria-hidden="true"
              style={{ left: `${progress01 * 100}%` }}
            />
            {shouldShowHint && (
              <div className="winding-track-hint" role="status">
                <p>Tap anywhere on the track to stop once the indicator lands in a band.</p>
                <button type="button" className="secondary small" onClick={persistHintDismissed}>
                  Got it
                </button>
              </div>
            )}
          </div>

          <div
            className="winding-band-legend"
            data-testid="winding-band-legend"
            data-active-band={band}
          >
            <p className="visually-hidden">{legendAnnouncement}</p>
            {BAND_ORDER.map((legendBand) => (
              <span
                key={legendBand}
                className={`winding-band-chip winding-band-chip-${legendBand}${band === legendBand ? " active" : ""}`}
                aria-hidden="true"
                role="presentation"
                data-testid={`winding-band-${legendBand}`}
                data-label={getWindingBandLabel(legendBand)}
              />
            ))}
          </div>

          <div
            id="winding-live"
            className="winding-live"
            data-testid="winding-live"
            aria-live="polite"
          >
            {liveMessageText}
          </div>

          <p
            className={`winding-soft-hint${softWarningActive ? " winding-soft-hint-active" : ""}`}
            data-testid="winding-soft-hint"
            aria-live="polite"
          >
            Stop before the red glow at 98.5% to keep tension from spiking.
          </p>

          <div className="card-actions winding-actions">
            {!result ? (
              <button
                type="button"
                className="primary winding-stop-button"
                data-testid="winding-stop"
                aria-label="Stop winding run"
                aria-describedby="winding-live"
                onClick={handleStop}
                ref={stopButtonRef}
              >
                Stop
              </button>
            ) : (
              <button
                type="button"
                className="primary winding-done-button"
                data-testid="winding-done"
                aria-label="Close winding modal"
                onClick={handleClose}
              >
                Done
              </button>
            )}
          </div>

          {result && rewardCopy && (
            <div
              className={`winding-outcome winding-outcome-${result.tier}`}
              data-testid="winding-outcome"
              data-tier={result.tier}
            >
              <strong>{rewardCopy.headline}</strong>
              <p className="muted winding-outcome-copy">{rewardCopy.detail}</p>
              <p className="muted">{cooldownLabel}</p>
              {isOverWound && (
                <p className="muted winding-outcome-warning">
                  Over-wound! Release before 95% to keep tension from spiking.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="visually-hidden"
          aria-label="Trap focus"
          tabIndex={0}
          onFocus={() => stopButtonRef.current?.focus()}
        />
        <span tabIndex={0} className="winding-focus-sentinel" onFocus={handleBottomSentinel} />
      </div>
    </div>
  ) : null;
}
