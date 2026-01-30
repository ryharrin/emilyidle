import React from "react";

import { CAREER_NODES, CAREER_TRACKS, TRACK_CHOICE_UNLOCK_LEVEL } from "../../game/data/career";
import { formatMoneyFromCents } from "../../game/format";
import {
  canPerformTherapistSession,
  getTherapistCareer,
  getTherapistSessionCostLabel,
  getTherapistSessionPolicy,
  getTherapistXpRequiredForNextLevel,
  performTherapistSession,
} from "../../game/state";
import type { GameState } from "../../game/state";
import type { CareerNodeId, CareerTrackId } from "../../game/model/types";
import { CareerTree, type CareerTreeSection } from "../components/CareerTree";

type TabId =
  | "collection"
  | "career"
  | "upgrades"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "catalog"
  | "stats"
  | "save";

type CareerTabProps = {
  isActive: boolean;
  state: GameState;
  nowMs: number;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  onPurchase: (nextState: GameState) => void;
};

type CareerNodeView = {
  id: CareerNodeId;
  label: string;
  description: string;
  costPoints: number;
  status: "available" | "locked" | "spent";
  hint?: string;
  canSpend: boolean;
};

export function CareerTab({ isActive, state, nowMs, onPurchase }: CareerTabProps) {
  return (
    <section id="career" role="tabpanel" aria-labelledby="career-tab" hidden={!isActive}>
      {isActive &&
        (() => {
          const career = getTherapistCareer(state);
          const nextXpRequired = getTherapistXpRequiredForNextLevel(career.level);
          const sessionPolicy = getTherapistSessionPolicy(state);
          const costLabel = getTherapistSessionCostLabel(state);
          const canPerform = canPerformTherapistSession(state, nowMs);
          const cooldownSeconds = Math.max(0, Math.ceil((career.nextAvailableAtMs - nowMs) / 1000));
          const trackUnlocked = career.level >= TRACK_CHOICE_UNLOCK_LEVEL;
          const activeTrack =
            CAREER_TRACKS.find((track) => track.id === career.activeTrackId) ?? null;
          const nodeLabelLookup = new Map(CAREER_NODES.map((node) => [node.id, node.label]));

          const statusLabel = (() => {
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
              state.enjoymentCents < sessionPolicy.enjoymentCostCents
            ) {
              return "Need more enjoyment";
            }
            return "Unavailable";
          })();

          const totalSpentPoints = CAREER_NODES.reduce(
            (total, node) => total + (career.spentNodes[node.id] ? node.costPoints : 0),
            0,
          );
          const canRespec = totalSpentPoints > 0;

          const handleSpendNode = (nodeId: CareerNodeId) => {
            const node = CAREER_NODES.find((entry) => entry.id === nodeId);
            if (!node) {
              return;
            }
            if (career.spentNodes[node.id]) {
              return;
            }
            if (!node.prerequisites.every((id) => career.spentNodes[id])) {
              return;
            }
            if (career.pointsAvailable < node.costPoints) {
              return;
            }
            if (node.trackId !== "core" && node.trackId !== career.activeTrackId) {
              return;
            }

            onPurchase({
              ...state,
              therapistCareer: {
                ...career,
                pointsAvailable: career.pointsAvailable - node.costPoints,
                spentNodes: {
                  ...career.spentNodes,
                  [node.id]: true,
                },
              },
            });
          };

          const handleRespec = () => {
            if (!canRespec) {
              return;
            }
            onPurchase({
              ...state,
              therapistCareer: {
                ...career,
                pointsAvailable: career.pointsAvailable + totalSpentPoints,
                spentNodes: {},
              },
            });
          };

          const handleSelectTrack = (trackId: CareerTrackId) => {
            if (!trackUnlocked) {
              return;
            }
            if (career.activeTrackId === trackId) {
              return;
            }
            onPurchase({
              ...state,
              therapistCareer: {
                ...career,
                activeTrackId: trackId,
              },
            });
          };

          const buildNodeView = (node: (typeof CAREER_NODES)[number]): CareerNodeView => {
            const isSpent = Boolean(career.spentNodes[node.id]);
            const prereqsMet = node.prerequisites.every((id) => career.spentNodes[id]);
            const canAfford = career.pointsAvailable >= node.costPoints;
            const canSpend = !isSpent && prereqsMet && canAfford;
            const missingPrereqs = node.prerequisites.filter((id) => !career.spentNodes[id]);
            const missingLabels = missingPrereqs
              .map((id) => nodeLabelLookup.get(id))
              .filter(Boolean)
              .join(", ");
            const missingPoints = Math.max(0, node.costPoints - career.pointsAvailable);
            const hint = isSpent
              ? "Unlocked"
              : !prereqsMet
                ? `Requires ${missingLabels || "prerequisite"}`
                : !canAfford
                  ? `Need ${missingPoints} more point${missingPoints === 1 ? "" : "s"}`
                  : "Spend point";
            const status: CareerNodeView["status"] = isSpent
              ? "spent"
              : canSpend
                ? "available"
                : "locked";
            return {
              id: node.id,
              label: node.label,
              description: node.description,
              costPoints: node.costPoints,
              status,
              hint,
              canSpend,
            };
          };

          const coreNodes = CAREER_NODES.filter((node) => node.trackId === "core").map(
            buildNodeView,
          );
          const activeNodes = activeTrack
            ? CAREER_NODES.filter((node) => node.trackId === activeTrack.id).map(buildNodeView)
            : [];
          const treeSections: CareerTreeSection[] = [
            {
              id: "core",
              label: "Core foundations",
              description: "Shared foundations before specialization.",
              nodes: coreNodes,
            },
          ];
          if (activeTrack) {
            treeSections.push({
              id: activeTrack.id,
              label: activeTrack.label,
              description: activeTrack.description,
              nodes: activeNodes,
            });
          }

          const sessionCostNote = (() => {
            if (!sessionPolicy.supportsSessions) {
              if (!activeTrack && !trackUnlocked) {
                return `Tracks unlock at level ${TRACK_CHOICE_UNLOCK_LEVEL}. Spend points in Core foundations while your career level rises.`;
              }
              return activeTrack
                ? "This track focuses on salary only; sessions are unavailable."
                : "Select a sessions track to unlock sessions.";
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
                    Build your career track, earn salary, and choose when to run sessions for bursts
                    of cash.
                  </p>
                </div>
                <div className="results-count" data-testid="career-status">
                  {statusLabel}
                </div>
              </header>

              <div className="card-stack career-stack">
                <div className="card career-track-panel">
                  <div className="career-track-header">
                    <div>
                      <h4>Career tracks</h4>
                      <p className="muted">
                        Choose one active track at a time. Unlocks at level{" "}
                        {TRACK_CHOICE_UNLOCK_LEVEL}.
                      </p>
                    </div>
                    <div className="career-track-level">Level {career.level.toLocaleString()}</div>
                  </div>
                  <div className="career-track-grid">
                    {CAREER_TRACKS.map((track) => {
                      const isActive = career.activeTrackId === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          className="career-track-card"
                          aria-pressed={isActive}
                          disabled={!trackUnlocked}
                          onClick={() => handleSelectTrack(track.id)}
                        >
                          <div>
                            <div className="career-track-title">{track.label}</div>
                            <p className="career-track-desc">{track.description}</p>
                          </div>
                          <div className="career-track-meta">
                            <span className="career-track-tag">
                              {track.hasSessions ? "Sessions" : "Salary-only"}
                            </span>
                            {isActive && <span className="career-track-active">Active</span>}
                          </div>
                          {!trackUnlocked && (
                            <span className="career-track-lock">
                              Unlocks at level {TRACK_CHOICE_UNLOCK_LEVEL}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <CareerTree
                  pointsAvailable={career.pointsAvailable}
                  sections={treeSections}
                  onSpendNode={handleSpendNode}
                  onRespec={handleRespec}
                  respecDisabled={!canRespec}
                />

                <div className="card career-session">
                  <div className="career-session-header">
                    <div>
                      <h4>Sessions</h4>
                      <p className="muted">Run focused sessions for cash bursts and career XP.</p>
                    </div>
                    <div className="career-session-note">{sessionCostNote}</div>
                  </div>
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
                  <div className="card-actions">
                    <button
                      type="button"
                      data-testid="career-action"
                      disabled={!sessionPolicy.supportsSessions || !canPerform}
                      onClick={() => onPurchase(performTherapistSession(state, Date.now()))}
                    >
                      Run session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </section>
  );
}
