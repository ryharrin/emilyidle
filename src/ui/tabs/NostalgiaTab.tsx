import React, { useEffect, useRef, useState } from "react";

import { LockIcon, PrestigeIcon } from "../icons/coreIcons";
import { FloatingDelta } from "../components/FloatingDelta";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { PrestigeSummary } from "../components/PrestigeSummary";
import { buildNostalgiaPrestigeSummary } from "../prestigeSummary";

import { formatMoneyFromCents } from "../../game/format";
import {
  buyNostalgiaUnlock,
  canBuyNostalgiaUnlock,
  canRefundNostalgiaUnlock,
  getEnjoymentThresholdLabel,
  getEnjoymentRateCentsPerSec,
  getNostalgiaUnlockCost,
  prestigeNostalgia,
  refundNostalgiaUnlock,
} from "../../game/state";
import type { GameState, WatchItemDefinition, WatchItemId } from "../../game/state";

type ThemeMode = "system" | "light" | "dark";

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

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  hiddenTabs: TabId[];
  coachmarksDismissed: Record<string, boolean>;
  confirmNostalgiaUnlocks: boolean;
  notificationPreferences: {
    sessionsReady: boolean;
    prestigeReady: boolean;
    achievements: boolean;
    events: boolean;
  };
};

type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type NostalgiaTabProps = {
  isActive: boolean;
  state: GameState;
  showNostalgiaSection: boolean;
  showNostalgiaPanel: boolean;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  nostalgiaResultsDismissed: boolean;
  onDismissResults: () => void;
  nostalgiaProgress: number;
  nostalgiaEarned: number;
  nostalgiaPrestigeThreshold: number;
  nostalgiaPrestigeGain: number;
  canPrestigeNostalgia: boolean;
  nostalgiaUnlockIds: WatchItemId[];
  watchItemsById: Map<WatchItemId, WatchItemDefinition>;
  nostalgiaModalOpen: boolean;
  onToggleNostalgiaModal: (open: boolean) => void;
  nostalgiaUnlockPending: WatchItemId | null;
  pendingNostalgiaUnlock: WatchItemDefinition | null;
  pendingNostalgiaUnlockCost: number;
  onSetNostalgiaUnlockPending: (next: WatchItemId | null) => void;
  settings: Settings;
  persistSettings: (nextSettings: Settings) => void;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
};

export function NostalgiaTab({
  isActive,
  state,
  showNostalgiaSection,
  showNostalgiaPanel,
  nostalgiaResultsDismissed,
  onDismissResults,
  nostalgiaProgress,
  nostalgiaEarned,
  nostalgiaPrestigeThreshold,
  nostalgiaPrestigeGain,
  canPrestigeNostalgia,
  nostalgiaUnlockIds,
  watchItemsById,
  nostalgiaModalOpen,
  onToggleNostalgiaModal,
  nostalgiaUnlockPending,
  pendingNostalgiaUnlock,
  pendingNostalgiaUnlockCost,
  onSetNostalgiaUnlockPending,
  settings,
  persistSettings,
  onPurchase,
}: NostalgiaTabProps) {
  const [floatingDelta, setFloatingDelta] = useState<{ message: string } | null>(null);
  const [floatingDeltaVisible, setFloatingDeltaVisible] = useState(false);
  const floatingDeltaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNostalgiaGainRef = useRef(state.nostalgiaLastGain);

  useEffect(() => {
    if (state.nostalgiaLastGain > 0 && state.nostalgiaLastGain !== lastNostalgiaGainRef.current) {
      lastNostalgiaGainRef.current = state.nostalgiaLastGain;
      setFloatingDelta({
        message: `+${state.nostalgiaLastGain.toLocaleString()} Nostalgia`,
      });
      setFloatingDeltaVisible(true);
      if (floatingDeltaTimer.current) {
        clearTimeout(floatingDeltaTimer.current);
      }
      floatingDeltaTimer.current = setTimeout(() => {
        setFloatingDeltaVisible(false);
        setFloatingDelta(null);
        floatingDeltaTimer.current = null;
      }, 900);
      return;
    }

    if (state.nostalgiaLastGain === 0 && lastNostalgiaGainRef.current !== 0) {
      lastNostalgiaGainRef.current = 0;
    }
  }, [state.nostalgiaLastGain]);

  useEffect(() => {
    return () => {
      if (floatingDeltaTimer.current) {
        clearTimeout(floatingDeltaTimer.current);
      }
    };
  }, []);
  const enjoymentRate = getEnjoymentRateCentsPerSec(state);
  const nostalgiaRemainingCents = Math.max(0, nostalgiaPrestigeThreshold - nostalgiaEarned);
  const nostalgiaRecoveryEtaSeconds =
    enjoymentRate > 0 ? Math.ceil(nostalgiaRemainingCents / enjoymentRate) : null;
  const nostalgiaRecoveryEtaLabel =
    nostalgiaRecoveryEtaSeconds === null
      ? "ETA unavailable"
      : nostalgiaRecoveryEtaSeconds < 60
        ? `${nostalgiaRecoveryEtaSeconds}s`
        : `${Math.ceil(nostalgiaRecoveryEtaSeconds / 60)}m`;
  return (
    <section id="nostalgia" role="tabpanel" aria-labelledby="nostalgia-tab" hidden={!isActive}>
      {isActive && showNostalgiaSection && (
        <section
          className={`panel ${showNostalgiaPanel ? "" : "panel-teaser"}`}
          data-testid="nostalgia-panel"
          aria-labelledby="nostalgia-title"
        >
          {showNostalgiaPanel ? (
            <>
              <header className="panel-header">
                <div>
                  <p className="eyebrow">Prestige loop</p>
                  <h3 id="nostalgia-title">Nostalgia</h3>
                  <p className="muted">
                    Reset your collection to bank Nostalgia points and carry your collection
                    forward.
                  </p>
                  <div
                    className="surface-complication-strip nostalgia-complication-strip"
                    data-testid="nostalgia-complication-strip"
                  >
                    <article
                      className="surface-complication nostalgia-complication"
                      data-testid="nostalgia-complication-power-reserve"
                    >
                      <p className="surface-complication-label nostalgia-complication-label">
                        Power reserve
                      </p>
                      <p className="surface-complication-value nostalgia-complication-value">
                        {state.nostalgiaPoints.toLocaleString()} banked
                      </p>
                      <p className="surface-complication-detail nostalgia-complication-detail">
                        Projected gain +{nostalgiaPrestigeGain}
                      </p>
                    </article>
                    <article
                      className="surface-complication nostalgia-complication"
                      data-testid="nostalgia-complication-chronograph"
                    >
                      <p className="surface-complication-label nostalgia-complication-label">
                        Chronograph
                      </p>
                      <p className="surface-complication-value nostalgia-complication-value">
                        {Math.round(nostalgiaProgress * 100)}% ready
                      </p>
                      <p className="surface-complication-detail nostalgia-complication-detail">
                        {formatMoneyFromCents(nostalgiaEarned)} /{" "}
                        {getEnjoymentThresholdLabel(nostalgiaPrestigeThreshold)}
                      </p>
                    </article>
                    <article
                      className="surface-complication nostalgia-complication"
                      data-testid="nostalgia-complication-date-wheel"
                    >
                      <p className="surface-complication-label nostalgia-complication-label">
                        Date wheel
                      </p>
                      <p className="surface-complication-value nostalgia-complication-value">
                        {nostalgiaRecoveryEtaLabel}
                      </p>
                      <p className="surface-complication-detail nostalgia-complication-detail">
                        Recovery ETA
                      </p>
                    </article>
                    <article
                      className="surface-complication nostalgia-complication"
                      data-testid="nostalgia-complication-moonphase"
                    >
                      <p className="surface-complication-label nostalgia-complication-label">
                        Moonphase
                      </p>
                      <p className="surface-complication-value nostalgia-complication-value">
                        {state.nostalgiaUnlockedItems.length}/{nostalgiaUnlockIds.length} unlocked
                      </p>
                      <p className="surface-complication-detail nostalgia-complication-detail">
                        {state.nostalgiaResets.toLocaleString()} completed resets
                      </p>
                    </article>
                  </div>
                </div>
                <div className="results-count" data-testid="nostalgia-balance">
                  {state.nostalgiaPoints.toLocaleString()} Nostalgia
                </div>
              </header>

              {state.nostalgiaLastGain > 0 && !nostalgiaResultsDismissed && (
                <div className="nostalgia-results" data-testid="nostalgia-results">
                  <h4>Reset complete</h4>
                  <p>
                    +{state.nostalgiaLastGain.toLocaleString()} Nostalgia · New total{" "}
                    {state.nostalgiaPoints.toLocaleString()}
                  </p>
                  {state.nostalgiaLastPrestigedAtMs > 0 && (
                    <p className="muted">
                      {new Date(state.nostalgiaLastPrestigedAtMs).toLocaleString()}
                    </p>
                  )}
                  <div className="card-actions">
                    <button type="button" className="secondary" onClick={onDismissResults}>
                      Back to progress
                    </button>
                  </div>
                </div>
              )}

              <div className="nostalgia-progress" data-testid="nostalgia-progress">
                <div className="nostalgia-progress-track">
                  <div
                    className="nostalgia-progress-fill"
                    style={{ width: `${Math.round(nostalgiaProgress * 100)}%` }}
                  ></div>
                </div>
                <div className="nostalgia-progress-meta">
                  <span>{Math.round(nostalgiaProgress * 100)}% to prestige</span>
                  <span>
                    {formatMoneyFromCents(nostalgiaEarned)} enjoyment /{" "}
                    {getEnjoymentThresholdLabel(nostalgiaPrestigeThreshold)}
                  </span>
                </div>
              </div>

              <div className="card" data-testid="nostalgia-preview">
                <h4>Projected nostalgia</h4>
                <p className="muted">Reset now to gain +{nostalgiaPrestigeGain} Nostalgia.</p>
                <p>Current balance: {state.nostalgiaPoints.toLocaleString()} Nostalgia</p>
                <p className="muted">
                  Recovery ETA at current enjoyment pace: {nostalgiaRecoveryEtaLabel}.
                </p>
                <p className="muted">
                  Current run resets; owned watches, catalog discovery, achievements, and Nostalgia
                  unlock purchases carry forward.
                </p>
              </div>

              <PrestigeSummary
                summary={buildNostalgiaPrestigeSummary(nostalgiaPrestigeGain)}
                testId="nostalgia-prestige-summary"
              />

              <div className="card-actions">
                <div className="floating-delta-anchor">
                  <button
                    type="button"
                    className="inline-icon-button"
                    data-testid="nostalgia-prestige"
                    disabled={!canPrestigeNostalgia}
                    onClick={() => {
                      if (!canPrestigeNostalgia) {
                        return;
                      }
                      onToggleNostalgiaModal(true);
                    }}
                  >
                    <PrestigeIcon className="inline-icon" />
                    Review reset
                  </button>
                  {floatingDelta && (
                    <FloatingDelta
                      visible={floatingDeltaVisible}
                      message={floatingDelta.message}
                      testId="nostalgia-floating-delta"
                    />
                  )}
                </div>
              </div>

              {state.nostalgiaResets >= 1 && (
                <div className="nostalgia-unlocks" data-testid="nostalgia-unlocks">
                  <header className="nostalgia-unlocks-header">
                    <div>
                      <p className="eyebrow">Permanent unlocks</p>
                      <h4>
                        Unlock store{" "}
                        <ExplainButton
                          sectionId={HELP_SECTION_IDS.nostalgiaUnlocks}
                          label="Explain unlock order"
                        />
                      </h4>
                      <p className="muted">
                        Spend Nostalgia to unlock new watch lines across every reset. Unlocks are
                        purchased in order.
                      </p>
                    </div>
                    <label className="nostalgia-unlocks-toggle">
                      <input
                        type="checkbox"
                        checked={settings.confirmNostalgiaUnlocks}
                        data-testid="nostalgia-unlock-confirm-toggle"
                        onChange={() =>
                          persistSettings({
                            ...settings,
                            confirmNostalgiaUnlocks: !settings.confirmNostalgiaUnlocks,
                          })
                        }
                      />
                      Confirm unlock purchases
                    </label>
                  </header>
                  <div className="nostalgia-unlock-grid">
                    {nostalgiaUnlockIds.map((unlockId, index) => {
                      const item = watchItemsById.get(unlockId);
                      if (!item) {
                        return null;
                      }
                      const cost = getNostalgiaUnlockCost(unlockId);
                      const unlocked = state.nostalgiaUnlockedItems.includes(unlockId);
                      const canBuy = canBuyNostalgiaUnlock(state, unlockId);
                      const canRefund = canRefundNostalgiaUnlock(state, unlockId);
                      const previousId = index > 0 ? nostalgiaUnlockIds[index - 1] : null;
                      const missingPrereq =
                        previousId && !state.nostalgiaUnlockedItems.includes(previousId);
                      const nostalgiaGap = Math.max(0, cost - state.nostalgiaPoints);
                      const lockReason = !unlocked
                        ? missingPrereq
                          ? `Unlock ${watchItemsById.get(previousId)?.name ?? previousId} first`
                          : nostalgiaGap > 0
                            ? `Need ${nostalgiaGap.toLocaleString()} more Nostalgia`
                            : null
                        : null;

                      return (
                        <div
                          className={`card nostalgia-unlock-card ${
                            unlocked ? "nostalgia-unlock-owned" : ""
                          }`}
                          key={unlockId}
                          data-testid={`nostalgia-unlock-card-${unlockId}`}
                        >
                          <div className="card-header">
                            <div>
                              <h4>{item.name}</h4>
                              <p>{item.description}</p>
                            </div>
                            <div className="nostalgia-unlock-status">
                              {unlocked ? (
                                <span className="nostalgia-unlock-badge">Unlocked</span>
                              ) : (
                                <>
                                  <LockIcon className="inline-icon" />
                                  <span className="nostalgia-unlock-status-text">Locked</span>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="nostalgia-unlock-cost">
                            Cost: {cost.toLocaleString()} Nostalgia
                          </p>
                          {lockReason && <p className="nostalgia-unlock-hint">{lockReason}</p>}
                          <div className="card-actions">
                            <button
                              type="button"
                              data-testid={`nostalgia-unlock-buy-${unlockId}`}
                              disabled={unlocked || !canBuy}
                              onClick={() => {
                                if (settings.confirmNostalgiaUnlocks) {
                                  onSetNostalgiaUnlockPending(unlockId);
                                  return;
                                }
                                onPurchase(buyNostalgiaUnlock(state, unlockId));
                              }}
                            >
                              {unlocked ? "Unlocked" : `Unlock (${cost.toLocaleString()})`}
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              data-testid={`nostalgia-unlock-refund-${unlockId}`}
                              disabled={!canRefund}
                              onClick={() => onPurchase(refundNostalgiaUnlock(state, unlockId))}
                            >
                              Refund +{cost.toLocaleString()}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {nostalgiaModalOpen && (
                <div
                  className="nostalgia-modal"
                  data-testid="nostalgia-modal"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="nostalgia-modal-card">
                    <h3>Confirm nostalgia prestige</h3>
                    <p className="muted">
                      Review Current run, Next run keeps, and Delta before confirming the reset.
                    </p>
                    <PrestigeSummary
                      summary={buildNostalgiaPrestigeSummary(nostalgiaPrestigeGain)}
                    />
                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => {
                          onPurchase(prestigeNostalgia(state, Date.now()), {
                            prestigeTier: "nostalgia",
                          });
                          onToggleNostalgiaModal(false);
                        }}
                      >
                        Confirm reset
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => onToggleNostalgiaModal(false)}
                      >
                        Keep current run
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {nostalgiaUnlockPending && pendingNostalgiaUnlock && (
                <div
                  className="nostalgia-modal"
                  data-testid="nostalgia-unlock-modal"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="nostalgia-modal-card">
                    <h3>Confirm nostalgia unlock</h3>
                    <p className="muted">
                      Spend {pendingNostalgiaUnlockCost.toLocaleString()} Nostalgia to unlock{" "}
                      {pendingNostalgiaUnlock.name} permanently?
                    </p>
                    <ul>
                      <li>Unlocks the watch line for every future reset</li>
                      <li>Refunds are available for the most recent unlock</li>
                    </ul>
                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => {
                          if (!nostalgiaUnlockPending) {
                            return;
                          }
                          onPurchase(buyNostalgiaUnlock(state, nostalgiaUnlockPending));
                          onSetNostalgiaUnlockPending(null);
                        }}
                      >
                        Confirm unlock
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => onSetNostalgiaUnlockPending(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="panel-teaser-content" data-testid="nostalgia-teaser">
              <p className="eyebrow">Prestige loop</p>
              <h3>Nostalgia</h3>
              <p className="muted">Your collection is nearing its first nostalgia reset.</p>
              <div className="teaser-progress">
                <div className="teaser-track">
                  <div
                    className="teaser-fill"
                    style={{ width: `${Math.round(nostalgiaProgress * 100)}%` }}
                  ></div>
                </div>
                <span>{Math.round(nostalgiaProgress * 100)}% to nostalgia prestige</span>
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
