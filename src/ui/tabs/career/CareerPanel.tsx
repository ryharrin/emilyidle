import React from "react";

import { CAREER_TRACKS, TRACK_CHOICE_UNLOCK_LEVEL } from "../../../game/data/career";
import { formatMoneyFromCents } from "../../../game/format";
import {
  canPerformTherapistSession,
  enterPhdProgram,
  getCareerNextActionCue,
  getTherapistCareer,
  getTherapistSessionCostLabel,
  getTherapistSessionValueDeltaSummary,
  getTherapistSalaryWindowSummary,
  getTherapistNearTermUnlockImpact,
  getTherapistSessionPolicy,
  getTherapistXpRequiredForNextLevel,
  getTherapistSalaryExpirationAlert,
  performTherapistSession,
} from "../../../game/state";
import type { GameState } from "../../../game/state";
import { CareerProgressCard } from "../../components/CareerProgressCard";
import { CareerNextActionCard } from "../../components/CareerNextActionCard";
import { CooldownRing } from "../../components/CooldownRing";
import { CareerStageChoiceSummary } from "../../components/CareerStageChoiceSummary";
import { ExplainButton } from "../../help/ExplainButton";
import { HELP_SECTION_IDS } from "../../help/helpContent";
import { CareerMap } from "./CareerMap";
import { CareerTimeline } from "../../components/CareerTimeline";
import { CareerUpgradesView } from "./CareerUpgradesView";

type CareerPanelProps = {
  state: GameState;
  nowMs: number;
  onPurchase: (nextState: GameState) => void;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

const MOBILE_CAREER_QUERY = "(max-width: 820px)";

const getIsCompactCareerViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(MOBILE_CAREER_QUERY).matches;
};

export function CareerPanel({ state, nowMs, onPurchase }: CareerPanelProps) {
  const [activeView, setActiveView] = React.useState<"stages" | "upgrades">("stages");
  const [isCompactLayout, setIsCompactLayout] = React.useState(getIsCompactCareerViewport);
  const [deepDetailsOpen, setDeepDetailsOpen] = React.useState(() => !getIsCompactCareerViewport());
  const [nextSectionOpen, setNextSectionOpen] = React.useState(() => !getIsCompactCareerViewport());
  const career = getTherapistCareer(state);
  const nextActionCue = getCareerNextActionCue(state, nowMs);
  const nextXpRequired = getTherapistXpRequiredForNextLevel(career.level);
  const sessionPolicy = getTherapistSessionPolicy(state, nowMs);
  const costLabel = getTherapistSessionCostLabel(state, nowMs);
  const canPerform = canPerformTherapistSession(state, nowMs);
  const cooldownSeconds = Math.max(0, Math.ceil((career.nextAvailableAtMs - nowMs) / 1000));
  const trackUnlocked = career.level >= TRACK_CHOICE_UNLOCK_LEVEL;
  const activeTrack = CAREER_TRACKS.find((track) => track.id === career.activeTrackId) ?? null;
  const remainingMs = Math.max(0, career.nextAvailableAtMs - nowMs);
  const showCooldownRing =
    sessionPolicy.supportsSessions && remainingMs > 0 && sessionPolicy.cooldownMs > 0;
  const cooldownProgress =
    sessionPolicy.cooldownMs > 0 ? clamp01(1 - remainingMs / sessionPolicy.cooldownMs) : 1;
  const cooldownLabel = `Cooldown ${Math.max(0, Math.ceil(remainingMs / 1000))}s`;
  const salaryAlert = getTherapistSalaryExpirationAlert(state, nowMs);
  const salaryWindowSummary = getTherapistSalaryWindowSummary(state, nowMs);
  const sessionValueSummary = getTherapistSessionValueDeltaSummary(state, nowMs);
  const nearTermUnlock = getTherapistNearTermUnlockImpact(state);
  const salaryRemainingLabel = formatDuration(salaryAlert.remainingMs);
  const showSalaryAlert = salaryAlert.level !== "none";

  const statusLabel = (() => {
    if (career.careerStartId === null) {
      return "Start your career";
    }
    if (!sessionPolicy.supportsSessions) {
      if (!activeTrack && !trackUnlocked) {
        return `Unlock tracks at level ${TRACK_CHOICE_UNLOCK_LEVEL}`;
      }
      return activeTrack ? "Sessions unavailable" : "Select a track";
    }
    if (cooldownSeconds > 0) {
      return canPerform
        ? `Cooldown ${cooldownSeconds}s · Rush available`
        : `Cooldown ${cooldownSeconds}s`;
    }
    if (canPerform) {
      return "Ready";
    }
    if (
      !career.freeSessionAvailable &&
      state.enjoymentCents < sessionPolicy.effectiveEnjoymentCostCents
    ) {
      return "Need more enjoyment";
    }
    return "Unavailable";
  })();

  const sessionCostNote = (() => {
    if (career.careerStartId === null) {
      return "Enter the PhD program to begin earning salary and unlock career progression.";
    }
    if (!sessionPolicy.supportsSessions) {
      if (!activeTrack && !trackUnlocked) {
        return `Tracks unlock at level ${TRACK_CHOICE_UNLOCK_LEVEL}. Spend points in Core foundations while your career level rises.`;
      }
      return activeTrack
        ? "Sessions are unavailable for your current career stage."
        : "Select a track to unlock sessions.";
    }
    if (career.freeSessionAvailable) {
      return "First session is free. Additional sessions spend enjoyment.";
    }
    if (sessionPolicy.cooldownRemainingMs > 0 && sessionPolicy.cooldownRushExtraCents > 0) {
      return "Cooldown rush is active. Running now adds a rush fee.";
    }
    return "Running again before cooldown ends adds a rush fee.";
  })();

  const runNowCostLabel = (() => {
    if (career.careerStartId === null) {
      return "Run now: unavailable until career starts.";
    }
    if (!sessionPolicy.supportsSessions) {
      return "Run now: unavailable until sessions unlock.";
    }
    if (career.freeSessionAvailable) {
      return "Run now: 0 enjoyment (first session free).";
    }

    const sessionCost = formatMoneyFromCents(sessionPolicy.premiumEnjoymentCostCents);
    const totalCost = formatMoneyFromCents(sessionPolicy.effectiveEnjoymentCostCents);
    if (sessionPolicy.cooldownRushExtraCents > 0) {
      return `Run now total: ${totalCost} (${sessionCost} session cost + ${formatMoneyFromCents(sessionPolicy.cooldownRushExtraCents)} rush fee).`;
    }
    return `Run now total: ${totalCost} (${sessionCost} session cost).`;
  })();

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_CAREER_QUERY);
    const syncLayout = (matches: boolean) => {
      setIsCompactLayout(matches);
      if (matches) {
        setDeepDetailsOpen(false);
        setNextSectionOpen(false);
        return;
      }

      setDeepDetailsOpen(true);
      setNextSectionOpen(true);
    };

    syncLayout(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => {
      syncLayout(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  const openProgressDetails = React.useCallback(() => {
    setNextSectionOpen(true);
    setDeepDetailsOpen(true);
    setActiveView("stages");
  }, []);

  const mobileRailAction = (() => {
    if (nextActionCue.id === "start-career") {
      return {
        label: "Enter program",
        disabled: false,
        onClick: () => onPurchase(enterPhdProgram(state, nowMs)),
      };
    }

    if (nextActionCue.id === "perform-session") {
      return {
        label:
          canPerform && sessionPolicy.cooldownRemainingMs > 0
            ? "Run session (rush)"
            : canPerform
              ? "Run session"
              : "Run session (locked)",
        disabled: !sessionPolicy.supportsSessions || !canPerform,
        onClick: () => onPurchase(performTherapistSession(state, nowMs)),
      };
    }

    return {
      label: "Open progression",
      disabled: false,
      onClick: openProgressDetails,
    };
  })();

  return (
    <div className="panel" data-testid="career-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Money generation</p>
          <h3 id="career-title">Therapist career</h3>
          <p className="muted">
            Start here on fresh saves: enter the program, earn salary, and run sessions for burst
            cash.
          </p>
        </div>
        <div className="results-count" data-testid="career-status">
          {statusLabel}
        </div>
      </header>

      <div className="career-layout">
        <section
          className="career-priority-section career-priority-now"
          data-testid="career-now-section"
        >
          <header className="career-priority-header">
            <p className="eyebrow">Now</p>
            <h4>What to do now</h4>
            <p className="muted">Top recommended action first, then the key numbers behind it.</p>
          </header>
          <div className="card-stack career-stack career-stack-now">
            <CareerNextActionCard
              state={state}
              nowMs={nowMs}
              statusLabel={statusLabel}
              onPurchase={onPurchase}
            />
            <article className="card career-economy-summary" data-testid="career-economy-summary">
              <header className="career-economy-summary-header">
                <h4>Session value snapshot</h4>
                <p className="muted">Payout, cooldown, and pacing modifiers.</p>
              </header>
              <dl className="career-economy-summary-grid" data-testid="session-delta-breakdown">
                <div>
                  <dt>Session cash</dt>
                  <dd>
                    +{formatMoneyFromCents(sessionValueSummary.cashPayoutCents)}
                    {sessionValueSummary.supportsSessions ? "" : " (locked)"}
                  </dd>
                </div>
                <div>
                  <dt>Run now cost</dt>
                  <dd>
                    {sessionValueSummary.isFreeSession
                      ? "0 (free)"
                      : `-${formatMoneyFromCents(sessionValueSummary.effectiveEnjoymentCostCents)}`}
                  </dd>
                </div>
                <div>
                  <dt>Cooldown</dt>
                  <dd>{formatDuration(sessionValueSummary.cooldownMs)}</dd>
                </div>
                <div>
                  <dt>Cadence premium</dt>
                  <dd>
                    {sessionValueSummary.premiumCount > 0
                      ? `+${Math.max(0, Math.round((sessionValueSummary.premiumMultiplier - 1) * 100))}%`
                      : "None"}
                  </dd>
                </div>
                <div>
                  <dt>Cooldown rush</dt>
                  <dd>
                    {sessionValueSummary.cooldownRushExtraCents > 0
                      ? `+${formatMoneyFromCents(sessionValueSummary.cooldownRushExtraCents)}`
                      : "None"}
                  </dd>
                </div>
              </dl>
              <p className="career-economy-summary-window" data-testid="salary-window-timer">
                Salary window{" "}
                {salaryWindowSummary.isActive
                  ? `ends in ${formatDuration(salaryWindowSummary.remainingMs)}`
                  : "is inactive"}{" "}
                ({formatDuration(salaryWindowSummary.windowMs)} base refresh).
              </p>
              <p className="muted">
                <strong>{nearTermUnlock.title}:</strong> {nearTermUnlock.detail}
              </p>
            </article>
            <div className="card career-session">
              <div className="career-session-header">
                <div>
                  <h4>Run session</h4>
                  <p className="muted">Run sessions for burst cash and career XP.</p>
                </div>
                <div className="career-session-note">{sessionCostNote}</div>
              </div>
              {showSalaryAlert && (
                <div
                  className={`career-salary-alert career-salary-alert-${salaryAlert.level}`}
                  data-testid="career-salary-expiration"
                >
                  <strong>
                    {salaryAlert.level === "urgent"
                      ? "Urgent salary expiration"
                      : "Salary expiring soon"}
                    :
                  </strong>{" "}
                  Salary window ends in {salaryRemainingLabel}.{" "}
                  {salaryAlert.level === "urgent"
                    ? "Refresh now to keep your income flowing."
                    : "Refresh soon to avoid a gap in salary."}
                </div>
              )}
              <div className="workshop-reset">
                <div>
                  <p className="workshop-label">Level</p>
                  <p className="workshop-value">{career.level.toLocaleString()}</p>
                </div>
                <div>
                  <p className="workshop-label">XP</p>
                  <p className="workshop-value">
                    {career.xp.toLocaleString()} / {nextXpRequired.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="workshop-label">Session cost</p>
                  <p className="workshop-value">{costLabel}</p>
                </div>
                {sessionPolicy.premiumCount > 0 && (
                  <div className="career-session-premium" data-testid="career-session-premium">
                    <div className="career-session-premium-row">
                      <span className="career-session-premium-label">
                        {sessionPolicy.premiumLabel || "Session premium"}
                      </span>
                      <span className="career-session-premium-value">
                        +{Math.max(0, Math.round((sessionPolicy.premiumMultiplier - 1) * 100))}%
                      </span>
                    </div>
                    <p className="career-session-premium-note">
                      {sessionPolicy.premiumNote ||
                        "Waiting twice the cooldown resets the premium."}
                    </p>
                  </div>
                )}
              </div>
              <div className="inline-icon-button">
                <ExplainButton
                  sectionId={HELP_SECTION_IDS.careerProgression}
                  label="Explain career progression"
                />
                <span className="muted">Career help</span>
              </div>
              <p className="career-session-run-now-cost" data-testid="career-session-run-now-cost">
                {runNowCostLabel}
              </p>
              <div className="card-actions">
                {showCooldownRing && (
                  <div
                    className="career-session-cooldown"
                    data-testid="career-session-cooldown-ring"
                  >
                    <CooldownRing progress01={cooldownProgress} label={cooldownLabel} />
                  </div>
                )}
                <button
                  type="button"
                  data-testid="career-action"
                  disabled={!sessionPolicy.supportsSessions || !canPerform}
                  onClick={() => onPurchase(performTherapistSession(state, nowMs))}
                >
                  {canPerform && sessionPolicy.cooldownRemainingMs > 0
                    ? "Run session (rush)"
                    : "Run session"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="career-priority-section career-priority-next"
          data-testid="career-next-section"
        >
          {isCompactLayout ? (
            <details
              className="career-next-details"
              open={nextSectionOpen}
              onToggle={(event) => setNextSectionOpen(event.currentTarget.open)}
              data-testid="career-next-details"
            >
              <summary data-testid="career-next-details-toggle">
                <span>Progress and choices</span>
                <span className="muted">{nextSectionOpen ? "Collapse" : "Expand"}</span>
              </summary>
              <div className="card-stack career-stack career-stack-next">
                <CareerProgressCard state={state} nowMs={nowMs} />
                <CareerStageChoiceSummary state={state} />
              </div>
            </details>
          ) : (
            <>
              <header className="career-priority-header">
                <p className="eyebrow">Next</p>
                <h4>Progress and choices</h4>
                <p className="muted">Check upcoming unlocks and stage choices.</p>
              </header>
              <div className="card-stack career-stack career-stack-next">
                <CareerProgressCard state={state} nowMs={nowMs} />
                <CareerStageChoiceSummary state={state} />
              </div>
            </>
          )}
        </section>

        <details
          className="career-deep-details"
          open={deepDetailsOpen}
          onToggle={(event) => setDeepDetailsOpen(event.currentTarget.open)}
          data-testid="career-deep-details"
        >
          <summary data-testid="career-deep-details-toggle">
            <span>Detailed planning</span>
            <span className="muted">{deepDetailsOpen ? "Collapse" : "Expand"}</span>
          </summary>
          <div className="career-deep-details-body">
            <div className="career-canvas">
              <div className="career-view-switch" data-testid="career-view-switch">
                <button
                  type="button"
                  className={`secondary career-view-button ${activeView === "stages" ? "career-view-active" : ""}`}
                  data-testid="career-view-stages"
                  onClick={() => setActiveView("stages")}
                >
                  Stages
                </button>
                <button
                  type="button"
                  className={`secondary career-view-button ${activeView === "upgrades" ? "career-view-active" : ""}`}
                  data-testid="career-view-upgrades"
                  onClick={() => setActiveView("upgrades")}
                >
                  Upgrades
                </button>
              </div>

              {activeView === "stages" ? (
                <div className="career-stage-stack">
                  <div className="career-stages-pane">
                    <div className="career-timeline-wrapper">
                      <div className="career-canvas-header">
                        <div>
                          <h4>Career stages</h4>
                          <p className="muted">Drag to pan. Pinch or ctrl-wheel to zoom.</p>
                        </div>
                        <ExplainButton
                          sectionId={HELP_SECTION_IDS.careerStages}
                          label="Explain career stages"
                        />
                      </div>
                      <CareerTimeline state={state} />
                    </div>
                  </div>
                  <CareerMap state={state} onPurchase={onPurchase} />
                </div>
              ) : (
                <CareerUpgradesView state={state} nowMs={nowMs} onPurchase={onPurchase} />
              )}
            </div>
          </div>
        </details>
      </div>

      <div className="career-mobile-now-rail" data-testid="career-mobile-now-rail">
        <div className="career-mobile-now-rail-copy">
          <p className="eyebrow">Now</p>
          <p>{nextActionCue.label}</p>
        </div>
        <button
          type="button"
          data-testid="career-mobile-now-rail-action"
          disabled={mobileRailAction.disabled}
          onClick={mobileRailAction.onClick}
        >
          {mobileRailAction.label}
        </button>
      </div>
    </div>
  );
}
