import React, { useCallback, useState } from "react";

import { HelpModal, loadHelpState, persistHelpState } from "./help/HelpModal";
import { ExplainButton } from "./help/ExplainButton";
import { HELP_SECTION_IDS, HELP_SECTIONS } from "./help/helpContent";
import { PrestigeOnboardingModal } from "./components/PrestigeOnboardingModal";
import { AutomaticMiniGameModal, type AutomaticOutcome } from "./components/AutomaticMiniGameModal";
import { QuartzMiniGameModal, type QuartzOutcome } from "./components/QuartzMiniGameModal";
import { WindingMiniGameModal, type WindingOutcome } from "./components/WindingMiniGameModal";
import { formatMoneyFromCents } from "../game/format";
import {
  INTERACTION_BASE_COOLDOWN_MS,
  applyAutomaticReward,
  applyQuartzReward,
  applyWindingReward,
} from "../game/state";
import { emitTelemetryEvent } from "./telemetry/emitter";
import { TELEMETRY_EVENTS, type HelpOpenSource } from "./telemetry/events";
import type { GameState, WatchItemId, InteractionMiniGameMode } from "../game/state";
import type { PrestigeEvent } from "./prestigeOnboarding";

type InteractionKind = "winding" | "automatic" | "quartz";

type AppModalsProps = {
  state: GameState;
  nowMs: number;
  activeInteraction: { kind: InteractionKind; itemId: WatchItemId } | null;
  onSetActiveInteraction: (
    interaction: { kind: InteractionKind; itemId: WatchItemId } | null,
  ) => void;
  interactionModes: Record<InteractionKind, InteractionMiniGameMode>;
  onInteractionModeChange: (kind: InteractionKind, mode: InteractionMiniGameMode) => void;
  interactionStreak: { currentStreak: number };
  helpOpen: boolean;
  onSetHelpOpen: (open: boolean) => void;
  helpSectionId: string | null;
  onSetHelpSectionId: (id: string | null) => void;
  shortcutModalOpen: boolean;
  onSetShortcutModalOpen: (open: boolean) => void;
  prestigeOnboarding: PrestigeEvent | null;
  onSetPrestigeOnboarding: (event: PrestigeEvent | null) => void;
  onPurchase: (nextState: GameState, meta?: { prestigeTier?: string }) => void;
  onActivateTab: (tabId: string, source: "user" | "deep-link" | "system") => void;
  settings: {
    coachmarksDismissed: Record<string, boolean>;
  };
  onDismissWindingTapHint: () => void;
  watchItemLabels: Map<WatchItemId, string>;
};

export function AppModals({
  state,
  nowMs,
  activeInteraction,
  onSetActiveInteraction,
  interactionModes,
  onInteractionModeChange,
  interactionStreak,
  helpOpen,
  onSetHelpOpen,
  helpSectionId,
  onSetHelpSectionId,
  shortcutModalOpen,
  onSetShortcutModalOpen,
  prestigeOnboarding,
  onSetPrestigeOnboarding,
  onPurchase,
  onActivateTab,
  settings,
  onDismissWindingTapHint,
  watchItemLabels,
}: AppModalsProps) {
  const helpSections = HELP_SECTIONS;

  const resolveHelpSectionId = (candidate: string | null) => {
    if (helpSections.length === 0) {
      return null;
    }

    const matched = helpSections.find((section) => section.id === candidate);
    return matched ? matched.id : helpSections[0].id;
  };

  const handleOpenHelp = () => {
    const stored = loadHelpState();
    const nextId = resolveHelpSectionId(stored?.lastSectionId ?? null);
    emitTelemetryEvent(TELEMETRY_EVENTS.helpOpen, {
      source: "header-help-button",
      sectionId: nextId,
    });
    onSetHelpSectionId(nextId);
    onSetHelpOpen(true);
  };

  const handleSelectHelpSection = (nextId: string) => {
    onSetHelpSectionId(nextId);
    persistHelpState({ lastSectionId: nextId });
  };

  const openHelpTo = (sectionId: string, source: HelpOpenSource = "context") => {
    const nextId = resolveHelpSectionId(sectionId);
    emitTelemetryEvent(TELEMETRY_EVENTS.helpOpen, {
      source,
      sectionId: nextId,
    });
    onSetHelpSectionId(nextId);
    if (nextId) {
      persistHelpState({ lastSectionId: nextId });
    }
    onSetHelpOpen(true);
  };

  const handleCompleteWinding = (outcome: WindingOutcome) => {
    if (activeInteraction?.kind !== "winding") {
      return;
    }
    onPurchase(
      applyWindingReward(state, activeInteraction.itemId, nowMs, outcome.tier, {
        mode: interactionModes.winding,
      }),
    );
  };

  const handleCompleteAutomatic = (outcome: AutomaticOutcome) => {
    if (activeInteraction?.kind !== "automatic") {
      return;
    }
    onPurchase(
      applyAutomaticReward(state, activeInteraction.itemId, nowMs, outcome.tier, {
        mode: interactionModes.automatic,
      }),
    );
  };

  const handleCompleteQuartz = (outcome: QuartzOutcome) => {
    if (activeInteraction?.kind !== "quartz") {
      return;
    }
    onPurchase(
      applyQuartzReward(state, activeInteraction.itemId, nowMs, outcome.tier, {
        mode: interactionModes.quartz,
      }),
    );
  };

  return (
    <>
      <WindingMiniGameModal
        open={activeInteraction?.kind === "winding"}
        itemId={activeInteraction?.kind === "winding" ? activeInteraction.itemId : "manual"}
        itemLabel={
          activeInteraction?.kind === "winding"
            ? (watchItemLabels.get(activeInteraction.itemId) ?? "")
            : ""
        }
        mode={interactionModes.winding}
        onModeChange={(mode) => onInteractionModeChange("winding", mode)}
        currentPerfectStreak={interactionStreak.currentStreak}
        rewardRangeLabel={`${formatMoneyFromCents(25)} - ${formatMoneyFromCents(150)} enjoyment`}
        cooldownLabel={`Cooldown ${Math.floor(INTERACTION_BASE_COOLDOWN_MS / 1000)}s`}
        helpAction={
          <ExplainButton
            sectionId={HELP_SECTION_IDS.interactions}
            label="Explain interactions"
            className="help-open-button"
          />
        }
        onComplete={handleCompleteWinding}
        showTapHint={!settings.coachmarksDismissed["winding:tap-hint"]}
        onTapHintDismiss={onDismissWindingTapHint}
        onClose={() => onSetActiveInteraction(null)}
      />

      <AutomaticMiniGameModal
        open={activeInteraction?.kind === "automatic"}
        itemId={activeInteraction?.kind === "automatic" ? activeInteraction.itemId : "automatic"}
        itemLabel={
          activeInteraction?.kind === "automatic"
            ? (watchItemLabels.get(activeInteraction.itemId) ?? "")
            : ""
        }
        mode={interactionModes.automatic}
        onModeChange={(mode) => onInteractionModeChange("automatic", mode)}
        currentPerfectStreak={interactionStreak.currentStreak}
        helpAction={
          <ExplainButton
            sectionId={HELP_SECTION_IDS.interactions}
            label="Explain interactions"
            className="help-open-button"
          />
        }
        onComplete={handleCompleteAutomatic}
        onClose={() => onSetActiveInteraction(null)}
      />

      <QuartzMiniGameModal
        open={activeInteraction?.kind === "quartz"}
        itemId={activeInteraction?.kind === "quartz" ? activeInteraction.itemId : "quartz"}
        itemLabel={
          activeInteraction?.kind === "quartz"
            ? (watchItemLabels.get(activeInteraction.itemId) ?? "")
            : ""
        }
        mode={interactionModes.quartz}
        onModeChange={(mode) => onInteractionModeChange("quartz", mode)}
        currentPerfectStreak={interactionStreak.currentStreak}
        rewardRangeLabel={`${formatMoneyFromCents(100)} - ${formatMoneyFromCents(500)}`}
        helpAction={
          <ExplainButton
            sectionId={HELP_SECTION_IDS.interactions}
            label="Explain interactions"
            className="help-open-button"
          />
        }
        onComplete={handleCompleteQuartz}
        onClose={() => onSetActiveInteraction(null)}
      />

      {prestigeOnboarding && (
        <PrestigeOnboardingModal
          event={prestigeOnboarding}
          onClose={() => onSetPrestigeOnboarding(null)}
          onRecommendedAction={(tabId) => {
            onActivateTab(tabId, "system");
            onSetPrestigeOnboarding(null);
          }}
        />
      )}

      {shortcutModalOpen ? (
        <div className="shortcut-dialog-backdrop" role="presentation">
          <section
            className="shortcut-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcut-dialog-title"
            data-testid="shortcut-dialog"
          >
            <header className="shortcut-dialog__header">
              <h3 id="shortcut-dialog-title">Keyboard shortcuts</h3>
              <button
                type="button"
                className="secondary"
                data-testid="shortcut-dialog-close"
                onClick={() => onSetShortcutModalOpen(false)}
              >
                Close
              </button>
            </header>
            <ul className="shortcut-dialog__list">
              <li>
                <kbd>1-8</kbd>
                <span>Jump between visible tabs</span>
              </li>
              <li>
                <kbd>Arrow Keys</kbd>
                <span>Move tab focus in the top nav</span>
              </li>
              <li>
                <kbd>Enter</kbd>
                <span>Open focused tab</span>
              </li>
              <li>
                <kbd>?</kbd>
                <span>Open this shortcut guide</span>
              </li>
            </ul>
          </section>
        </div>
      ) : null}

      <HelpModal
        open={helpOpen}
        sections={helpSections}
        activeSectionId={helpSectionId}
        onSelectSectionId={handleSelectHelpSection}
        onClose={() => onSetHelpOpen(false)}
      />
    </>
  );
}
