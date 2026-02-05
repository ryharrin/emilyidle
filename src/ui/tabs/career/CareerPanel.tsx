import React from "react";

import { CAREER_TRACKS, TRACK_CHOICE_UNLOCK_LEVEL } from "../../../game/data/career";
import { formatMoneyFromCents } from "../../../game/format";
import {
  canPerformTherapistSession,
  getTherapistCareer,
  getTherapistSessionCostLabel,
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

export function CareerPanel({ state, nowMs, onPurchase }: CareerPanelProps) {
  const [activeView, setActiveView] = React.useState<"stages" | "upgrades">("stages");
  const career = getTherapistCareer(state);
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
    if (canPerform) {
      return "Ready";
    }
    if (cooldownSeconds > 0) {
      return `Cooldown ${cooldownSeconds}s`;
    }
    if (
      !career.freeSessionAvailable &&
      state.enjoymentCents < sessionPolicy.premiumEnjoymentCostCents
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
    const normalCost = formatMoneyFromCents(sessionPolicy.enjoymentCostCents);
    if (career.freeSessionAvailable) {
      return `Next session costs 0 enjoyment (first session free). After that: ${normalCost} enjoyment.`;
    }
    return `Next session costs ${normalCost} enjoyment.`;
  })();

  return (
    <div className="panel" data-testid="career-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Money generation</p>
          <h3 id="career-title">Therapist career</h3>
          <p className="muted">
            Build your career track, earn salary, and choose when to run sessions for bursts of
            cash.
          </p>
        </div>
        <div className="results-count" data-testid="career-status">
          {statusLabel}
        </div>
      </header>

      <div className="career-layout">
        <div className="career-sidebar">
          <div className="card-stack career-stack">
            <CareerNextActionCard state={state} nowMs={nowMs} onPurchase={onPurchase} />
            <div className="card career-session">
              <div className="career-session-header">
                <div>
                  <h4>Sessions</h4>
                  <p className="muted">Run focused sessions for cash bursts and career XP.</p>
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
                <div>
                  <p className="workshop-label">Session payout</p>
                  <p className="workshop-value">
                    {sessionPolicy.supportsSessions
                      ? `${formatMoneyFromCents(sessionPolicy.cashPayoutCents)} cash`
                      : "Unavailable"}
                  </p>
                </div>
                <div>
                  <p className="workshop-label">Cooldown</p>
                  <p className="workshop-value">
                    {sessionPolicy.supportsSessions
                      ? `${Math.round(sessionPolicy.cooldownMs / 1000)}s`
                      : "Unavailable"}
                  </p>
                </div>
              </div>
              <div className="inline-icon-button">
                <ExplainButton
                  sectionId={HELP_SECTION_IDS.careerProgression}
                  label="Explain career progression"
                />
                <span className="muted">Career progression + sessions</span>
              </div>
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
                  Run session
                </button>
              </div>
            </div>

            <CareerProgressCard state={state} />
            <CareerStageChoiceSummary state={state} />
          </div>
        </div>

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
            <>
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
              <CareerMap state={state} onPurchase={onPurchase} />
            </>
          ) : (
            <CareerUpgradesView state={state} nowMs={nowMs} onPurchase={onPurchase} />
          )}
        </div>
      </div>
    </div>
  );
}
