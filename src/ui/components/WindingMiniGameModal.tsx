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
const LIVE_RUNNING_MESSAGE = "Winding...";
const ENJOYMENT_BY_TIER_CENTS: Record<WindingOutcomeTier, number> = {
  miss: 25,
  good: 75,
  perfect: 150,
};

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
  const { progress01, crownAngleDeg, tension01, band, phase, stop, progressVelocity, velocity01 } =
    useWindingRun({
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

  useEffect(() => {
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
    requestAnimationFrame(() => {
      stopButtonRef.current?.focus();
    });
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

  const rewardCents = result ? ENJOYMENT_BY_TIER_CENTS[result.tier] : 0;
  const shouldShowHint = showTapHint && !hintDismissed;
  const bandLabel = getWindingBandLabel(band);
  const tensionPercent = Math.round(tension01 * 100);
  const velocityPulse = Math.min(1, Math.max(0, velocity01));
  const liveMessageText = result
    ? `Stopped at ${Math.round(progress01 * 100)}% — ${bandLabel}`
    : `Tension ${tensionPercent}% — ${bandLabel}`;
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
                  <strong>Stopped at {Math.round(progress01 * 100)}%</strong>
                  <p className="muted">{bandLabel}</p>
                </>
              ) : (
                <p className="muted">Tension: {Math.round(progress01 * 100)}%</p>
              )}
            </div>
          </div>

          <div
            className="winding-track"
            data-testid="winding-track"
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

          <div className="winding-band-legend" data-testid="winding-band-legend">
            {BAND_ORDER.map((legendBand) => (
              <span
                key={legendBand}
                className={`winding-band-chip${band === legendBand ? " active" : ""}`}
                data-testid={`winding-band-${legendBand}`}
              >
                {getWindingBandLabel(legendBand)}
              </span>
            ))}
          </div>

          <div className="winding-live" data-testid="winding-live" aria-live="polite">
            {liveMessageText}
          </div>

          <div className="card-actions winding-actions">
            {!result ? (
              <button
                type="button"
                data-testid="winding-stop"
                onClick={handleStop}
                ref={stopButtonRef}
              >
                Stop
              </button>
            ) : (
              <button type="button" data-testid="winding-done" onClick={handleClose}>
                Done
              </button>
            )}
          </div>

          {result && (
            <div
              className={`winding-outcome winding-outcome-${result.tier}`}
              data-testid="winding-outcome"
            >
              <strong>
                {bandLabel} · +{formatMoneyFromCents(rewardCents)} enjoyment
              </strong>
              <p className="muted">{cooldownLabel}</p>
            </div>
          )}
        </div>

        <span tabIndex={0} className="winding-focus-sentinel" onFocus={handleBottomSentinel} />
      </div>
    </div>
  ) : null;
}
