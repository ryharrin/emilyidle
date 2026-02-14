import React from "react";

import { CAREER_TRACKS, TRACK_CHOICE_UNLOCK_LEVEL } from "../../../game/data/career";
import { CAREER_STAGES } from "../../../game/data/careerStages";
import { formatMoneyFromCents } from "../../../game/format";
import {
  canPerformTherapistSession,
  getCareerNextActionCue,
  getTherapistCareerChoiceStatus,
  getTherapistCareer,
  getTherapistCareerStageUnlockLevel,
  getTherapistSessionCostLabel,
  getTherapistSessionValueDeltaSummary,
  getTherapistSalaryWindowSummary,
  getTherapistNearTermUnlockImpact,
  getTherapistSessionPolicy,
  getTherapistXpRequiredForNextLevel,
  getTherapistSalaryExpirationAlert,
  performTherapistSession,
  startCareerWithKickoffSession,
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
  const [sessionEconomicsOpen, setSessionEconomicsOpen] = React.useState(false);
  const career = getTherapistCareer(state);
  const nextActionCue = getCareerNextActionCue(state, nowMs);
  const nextXpRequired = getTherapistXpRequiredForNextLevel(career.level);
  const sessionPolicy = getTherapistSessionPolicy(state, nowMs);
  const costLabel = getTherapistSessionCostLabel(state, nowMs);
  const canPerform = canPerformTherapistSession(state, nowMs);
  const canBootstrapKickoffSession = career.careerStartId === null && career.freeSessionAvailable;
  const runSessionDisabled = canBootstrapKickoffSession
    ? false
    : !sessionPolicy.supportsSessions || !canPerform;
  const runSessionAction = () =>
    onPurchase(
      canBootstrapKickoffSession
        ? startCareerWithKickoffSession(state, nowMs)
        : performTherapistSession(state, nowMs),
    );
  const cooldownSeconds = Math.max(0, Math.ceil(sessionPolicy.cooldownRemainingMs / 1000));
  const trackUnlocked = career.level >= TRACK_CHOICE_UNLOCK_LEVEL;
  const activeTrack = CAREER_TRACKS.find((track) => track.id === career.activeTrackId) ?? null;
  const remainingMs = Math.max(0, sessionPolicy.cooldownRemainingMs);
  const showCooldownRing =
    sessionPolicy.supportsSessions &&
    sessionPolicy.premiumCount > 0 &&
    remainingMs > 0 &&
    sessionPolicy.cooldownMs > 0;
  const cooldownProgress =
    sessionPolicy.cooldownMs > 0 ? clamp01(1 - remainingMs / sessionPolicy.cooldownMs) : 1;
  const cooldownLabel = `Cost recovery ${Math.max(0, Math.ceil(remainingMs / 1000))}s`;
  const salaryAlert = getTherapistSalaryExpirationAlert(state, nowMs);
  const salaryWindowSummary = getTherapistSalaryWindowSummary(state, nowMs);
  const sessionValueSummary = getTherapistSessionValueDeltaSummary(state, nowMs);
  const nearTermUnlock = getTherapistNearTermUnlockImpact(state);
  const choiceStatus = getTherapistCareerChoiceStatus(state);
  const availableChoices = choiceStatus.filter((status) => status.available);
  const pendingChoices = choiceStatus.filter((status) => !status.chosen);
  const salaryRemainingLabel = formatDuration(salaryAlert.remainingMs);
  const showSalaryAlert = salaryAlert.level !== "none";
  const cooldownComplicationValue =
    showCooldownRing && cooldownSeconds > 0 ? formatDuration(remainingMs) : "Base tier";
  const salaryComplicationValue = salaryWindowSummary.isActive
    ? `${formatDuration(salaryWindowSummary.remainingMs)} left`
    : "Inactive";
  const salaryComplicationDetail = `Window ${formatDuration(salaryWindowSummary.windowMs)} base refresh`;

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
        ? `Cost tier recovers in ${cooldownSeconds}s`
        : `Need more enjoyment · tier recovers in ${cooldownSeconds}s`;
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
      if (career.freeSessionAvailable) {
        return "Run one free kickoff session to start your career economy.";
      }
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
    if (sessionPolicy.premiumCount > 0 && sessionPolicy.cooldownRemainingMs > 0) {
      return "Back-to-back sessions raise cost; each cooldown interval drops one tier.";
    }
    return "Run sessions to earn cash and XP. Cost rises with rapid repeats.";
  })();

  const runNowCostLabel = (() => {
    if (career.careerStartId === null) {
      if (career.freeSessionAvailable) {
        return "Run now: 0 enjoyment (starts career + free kickoff session).";
      }
      return "Run now: unavailable until career starts.";
    }
    if (!sessionPolicy.supportsSessions) {
      return "Run now: unavailable until sessions unlock.";
    }
    if (career.freeSessionAvailable) {
      return "Run now: 0 enjoyment (first session free).";
    }
    return `Run now total: ${formatMoneyFromCents(sessionPolicy.effectiveEnjoymentCostCents)}.`;
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
  const interactionRunsTotal = state.interactionRunsTotal;
  const interactionPerfectRuns = state.interactionPerfectRuns;
  const interactionPerfectStreak = state.interactionPerfectStreak;
  const interactionBestPerfectStreak = state.interactionBestPerfectStreak;
  const interactionPrecisionPercent =
    interactionRunsTotal > 0
      ? Math.round((interactionPerfectRuns / interactionRunsTotal) * 100)
      : 0;
  const interactionOutcomeSummary =
    interactionPerfectStreak > 0
      ? `${interactionPerfectStreak} perfect run${
          interactionPerfectStreak === 1 ? "" : "s"
        } in a row.`
      : interactionRunsTotal > 0
        ? "No active perfect streak."
        : "No outcomes logged yet.";

  const choiceQueueCard = (
    <article className="card career-choice-queue" data-testid="career-choice-queue">
      <header className="career-economy-summary-header">
        <h4>Actionable choices</h4>
        <p className="muted">
          {availableChoices.length > 0
            ? `${availableChoices.length} permanent choice${availableChoices.length === 1 ? "" : "s"} ready now.`
            : "No permanent choices are ready yet."}
        </p>
      </header>
      <ul className="career-choice-queue-list" data-testid="career-choice-queue-list">
        {pendingChoices.length === 0 ? (
          <li data-testid="career-choice-queue-empty">
            <div>
              <strong>All permanent choices locked in</strong>
              <p className="muted">No pending stage decisions remain.</p>
            </div>
          </li>
        ) : (
          pendingChoices.map((status) => {
            const stage = CAREER_STAGES.find((candidate) => candidate.id === status.stageId);
            const unlockLevel = getTherapistCareerStageUnlockLevel(status.stageId);
            const stateLabel = status.available
              ? "Ready now"
              : status.unlocked
                ? "Waiting on earlier choice"
                : `Unlocks at level ${unlockLevel}`;

            return (
              <li key={status.stageId} data-testid={`career-choice-queue-item-${status.stageId}`}>
                <div>
                  <strong>{stage?.label ?? status.stageId}</strong>
                  <p className="muted">{stateLabel}</p>
                </div>
                {status.available ? (
                  <button
                    type="button"
                    className="secondary"
                    data-testid={`career-choice-queue-open-${status.stageId}`}
                    onClick={openProgressDetails}
                  >
                    Choose now
                  </button>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
      <div className="card-actions">
        <button
          type="button"
          className="secondary"
          data-testid="career-choice-queue-open-map"
          onClick={openProgressDetails}
        >
          Open stage map
        </button>
      </div>
    </article>
  );

  const mobileRailAction = (() => {
    if (nextActionCue.id === "start-career") {
      return {
        label: "Enter program",
        disabled: false,
        onClick: () => onPurchase(startCareerWithKickoffSession(state, nowMs)),
      };
    }

    if (
      nextActionCue.id === "choose-track" ||
      nextActionCue.id === "choose-modality" ||
      nextActionCue.id === "choose-operating-style" ||
      nextActionCue.id === "choose-expansion-focus"
    ) {
      return {
        label: "Open progression choices",
        disabled: false,
        onClick: openProgressDetails,
      };
    }

    if (nextActionCue.id === "perform-session") {
      return {
        label: canPerform ? "Run session" : "Need enjoyment",
        disabled: runSessionDisabled,
        onClick: runSessionAction,
      };
    }

    return {
      label: "Open progression",
      disabled: false,
      onClick: openProgressDetails,
    };
  })();
  const showProgressionShortcut =
    mobileRailAction.label !== "Open progression" &&
    mobileRailAction.label !== "Open progression choices";
  const secondaryMissionContent = (
    <div className="card-stack career-stack career-stack-secondary">
      <article className="card interaction-feed-card" data-testid="career-interaction-feed">
        <header className="interaction-feed-card__header">
          <div>
            <p className="eyebrow">Interaction outcomes</p>
            <h4>Career feed</h4>
          </div>
          <p className="interaction-feed-card__status">{interactionOutcomeSummary}</p>
        </header>
        <dl className="interaction-feed-card__grid">
          <div>
            <dt>Perfect runs</dt>
            <dd>
              {interactionPerfectRuns.toLocaleString()} / {interactionRunsTotal.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt>Precision</dt>
            <dd>{interactionPrecisionPercent}%</dd>
          </div>
          <div>
            <dt>Best streak</dt>
            <dd>{interactionBestPerfectStreak.toLocaleString()}</dd>
          </div>
        </dl>
      </article>
      <article className="card career-economy-summary" data-testid="career-economy-summary">
        <header className="career-economy-summary-header">
          <div>
            <h4>Session economics</h4>
            <p className="muted">Live payout, timing, and cadence for your next run.</p>
          </div>
          <button
            type="button"
            className="secondary career-economy-summary-toggle"
            data-testid="career-economy-summary-toggle"
            aria-expanded={sessionEconomicsOpen}
            onClick={() => setSessionEconomicsOpen((current) => !current)}
          >
            {sessionEconomicsOpen ? "Collapse" : "Expand"}
          </button>
        </header>
        {sessionEconomicsOpen ? (
          <>
            <dl className="career-economy-summary-grid" data-testid="session-delta-breakdown">
              <div className="career-economy-summary-metric career-economy-summary-metric-cash">
                <dt>Session Cash</dt>
                <dd>
                  +{formatMoneyFromCents(sessionValueSummary.cashPayoutCents)}
                  {sessionValueSummary.supportsSessions ? "" : " (locked)"}
                </dd>
              </div>
              <div className="career-economy-summary-metric">
                <dt>Run now cost</dt>
                <dd>
                  {sessionValueSummary.isFreeSession
                    ? "0 (free)"
                    : `-${formatMoneyFromCents(sessionValueSummary.effectiveEnjoymentCostCents)}`}
                </dd>
              </div>
              <div className="career-economy-summary-metric">
                <dt>Cooldown</dt>
                <dd>{formatDuration(sessionValueSummary.cooldownMs)}</dd>
              </div>
              <div className="career-economy-summary-metric">
                <dt>Cadence premium</dt>
                <dd>
                  {sessionValueSummary.premiumCount > 0
                    ? `+${Math.max(0, Math.round((sessionValueSummary.premiumMultiplier - 1) * 100))}%`
                    : "None"}
                </dd>
              </div>
              <div className="career-economy-summary-metric">
                <dt>Cost recovery</dt>
                <dd>
                  {sessionValueSummary.premiumCount > 0 &&
                  sessionValueSummary.cooldownRemainingMs > 0
                    ? formatDuration(sessionValueSummary.cooldownRemainingMs)
                    : "Base cost"}
                </dd>
              </div>
            </dl>
            <p className="career-economy-summary-window" data-testid="salary-window-summary">
              <span className="career-economy-summary-window-label">Salary window</span>
              <span className="career-economy-summary-window-value">
                {salaryWindowSummary.statusLabel === "active"
                  ? `Active now • refreshes in ${formatDuration(salaryWindowSummary.remainingMs)}`
                  : "Inactive • waiting for the next rollover"}
              </span>
              <span className="career-economy-summary-window-detail">
                Window cadence: {formatDuration(salaryWindowSummary.windowMs)}.
              </span>
            </p>
            <p className="career-economy-summary-note" data-testid="near-term-unlock-summary">
              <span className="career-economy-summary-note-label">Near-term unlock</span>
              <strong>{nearTermUnlock.title}</strong>
              <span className="career-economy-summary-note-summary">
                {nearTermUnlock.summaryText}
              </span>
              <span className="career-economy-summary-note-detail">{nearTermUnlock.detail}</span>
            </p>
          </>
        ) : null}
      </article>
      <div className="card career-session">
        <div className="career-session-header">
          <div>
            <h4>Run session</h4>
            <p className="muted">Run sessions for burst Cash and career XP.</p>
          </div>
          <div className="career-session-note">{sessionCostNote}</div>
        </div>
        {showSalaryAlert && (
          <div
            className={`career-salary-alert career-salary-alert-${salaryAlert.level}`}
            data-testid="career-salary-expiration"
          >
            <strong>
              {salaryAlert.level === "urgent" ? "Urgent salary expiration" : "Salary expiring soon"}
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
                {sessionPolicy.premiumNote || "Session cost drops one tier each cooldown interval."}
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
            <div className="career-session-cooldown" data-testid="career-session-cooldown-ring">
              <CooldownRing progress01={cooldownProgress} label={cooldownLabel} />
            </div>
          )}
          <button
            type="button"
            data-testid="career-action"
            disabled={runSessionDisabled}
            onClick={runSessionAction}
          >
            Run session
          </button>
        </div>
      </div>
    </div>
  );

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
          <div className="career-complication-stack" data-testid="career-complication-stack">
            <article
              className="career-complication"
              data-testid="career-complication-power-reserve"
            >
              <p className="career-complication-label">Power reserve · Session payout</p>
              <p className="career-complication-value">
                +{formatMoneyFromCents(sessionValueSummary.cashPayoutCents)} per run
              </p>
              <p className="career-complication-detail">
                Session cost {costLabel}
                {sessionValueSummary.isFreeSession ? " (free now)" : ""}
              </p>
            </article>
            <article className="career-complication" data-testid="career-complication-chronograph">
              <p className="career-complication-label">Chronograph · Cost recovery</p>
              <p className="career-complication-value">{cooldownComplicationValue}</p>
              <p className="career-complication-detail">
                {showCooldownRing
                  ? "Time until the next session-cost tier drop"
                  : "Session cost is at base tier"}
              </p>
            </article>
            <article className="career-complication" data-testid="career-complication-date-wheel">
              <p className="career-complication-label">Date wheel · Near-term unlock</p>
              <p className="career-complication-value" data-testid="career-near-term-summary">
                {nearTermUnlock.summaryText}
              </p>
              <p className="career-complication-detail">
                <strong>{nearTermUnlock.title}:</strong> {nearTermUnlock.detail}
              </p>
            </article>
            <article className="career-complication" data-testid="career-complication-moonphase">
              <p className="career-complication-label">Moonphase · Salary window</p>
              <p className="career-complication-value">{salaryComplicationValue}</p>
              <p className="career-complication-detail">{salaryComplicationDetail}</p>
            </article>
          </div>
        </div>
        <div className="results-count" data-testid="career-status">
          {statusLabel}
        </div>
      </header>

      <section className="career-mini-progress" data-testid="career-mini-progress">
        <div className="career-mini-progress__level">
          <span className="eyebrow">Level</span>
          <span className="career-mini-progress__value">{career.level}</span>
        </div>
        <div className="career-mini-progress__xp">
          <div className="career-mini-progress__xp-bar-bg">
            <div
              className="career-mini-progress__xp-bar"
              style={{ width: `${Math.min(100, (career.xp / nextXpRequired) * 100)}%` }}
            />
          </div>
          <span className="career-mini-progress__xp-text">
            {career.xp.toLocaleString()} / {nextXpRequired.toLocaleString()} XP
          </span>
        </div>
        <div className="career-mini-progress__next">
          <span className="eyebrow">Next</span>
          <span className="career-mini-progress__value">{nearTermUnlock.title}</span>
        </div>
      </section>

      <div className="career-layout">
        <section
          className="career-priority-section career-priority-now"
          data-testid="career-now-section"
        >
          <header className="career-priority-header">
            <p className="eyebrow">Execute</p>
            <h4>Career execution lane</h4>
            <p className="muted" data-testid="career-now-guidance-note">
              Mission Rail owns immediate priorities. Use this lane for career-specific run controls
              and diagnostics.
            </p>
          </header>
          <div className="card-stack career-stack career-stack-now">
            <CareerNextActionCard
              state={state}
              nowMs={nowMs}
              statusLabel={statusLabel}
              onPurchase={onPurchase}
              onOpenProgressionChoices={openProgressDetails}
            />
            {secondaryMissionContent}
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
                {choiceQueueCard}
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
                {choiceQueueCard}
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
        <div className="career-mobile-now-rail-actions">
          <button
            type="button"
            data-testid="career-mobile-now-rail-action"
            disabled={mobileRailAction.disabled}
            onClick={mobileRailAction.onClick}
          >
            {mobileRailAction.label}
          </button>
          {showProgressionShortcut ? (
            <button
              type="button"
              className="secondary"
              data-testid="career-mobile-now-rail-progression"
              onClick={openProgressDetails}
            >
              Progression
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
