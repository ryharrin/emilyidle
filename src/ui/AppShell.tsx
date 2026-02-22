import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EventBanner } from "./components/EventBanner";
import { NextActionChips, type NextActionChip } from "./components/NextActionChips";
import { StatsHeader } from "./components/StatsHeader";
import { ToastStack, type ToastMessage } from "./components/ToastStack";
import { MissionRail } from "./components/MissionRail";
import { PageTabRail } from "./navigation/PageTabRail";
import { TabSwitchSkeleton } from "./navigation/TabSwitchSkeleton";
import { getTabReadiness } from "./navigation/tabReadiness";
import { TAB_DEFINITIONS, type TabId, type TabMeta } from "./navigation/tabMeta";
import { isTestEnvironment } from "../game/runtime/isTestEnvironment";
import { formatSoftcapEfficiency } from "../game/format";
import {
  getEffectiveCashRateCentsPerSec,
  getEnjoymentCents,
  getEnjoymentRateCentsPerSec,
  getCollectionValueCents,
  getEventIncomeMultiplier,
  canWorkshopPrestige,
  canMaisonPrestige,
  canNostalgiaPrestige,
  getMaisonPrestigeGain,
  getMaisonReputationGain,
  getNostalgiaPrestigeGain,
  getWorkshopPrestigeGain,
  getWorkshopPrestigeThresholdCents,
  getMaisonPrestigeThresholdCents,
  getNostalgiaPrestigeThresholdCents,
  isMaisonRevealReady,
  isWorkshopRevealReady,
  getGuideLanes,
  getSoftcapEfficiency,
} from "../game/state";
import type { GameState, GuideLaneAction } from "../game/state";

type TabActivationSource = "user" | "deep-link" | "system";

type AppShellProps = {
  children: React.ReactNode;
  state: GameState;
  nowMs: number;
  activeTab: TabId;
  focusedTab: TabId;
  isTabSwitching: boolean;
  onUserTabClick: (tabId: TabId) => void;
  onTabFocus: (tabId: TabId) => void;
  onTabKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onTabRef: (tabId: TabId, node: HTMLButtonElement | null) => void;
  onNavigateTo: (tabId: TabId, scrollTargetId?: string) => void;
  visibleTabs: TabMeta[];
  combinedTabVisibility: Record<TabId, boolean>;
  hiddenTabCount: number;
  onTabRailScroll: (direction: -1 | 1) => void;
  onOpenHiddenTabRecovery: () => void;
  onOpenHelp: () => void;
  onOpenShortcuts: () => void;
  onDismissShortcutHint: () => void;
  shortcutsHintDismissed: boolean;
  nextActionChips: NextActionChip[];
  onDismissNextActionChip: (chip: NextActionChip) => void;
  onSelectNextActionChip: (chip: NextActionChip) => void;
  tabRailHasOverflow: boolean;
  tabRailCanScrollBackward: boolean;
  tabRailCanScrollForward: boolean;
  toasts: ToastMessage[];
  onDismissToast: (toastId: string) => void;
  toastSafeTopPx: number;
  currentEventMultiplier: number;
  themeMode: "system" | "light" | "dark";
  emitUxEvent: (eventName: string, detail: Record<string, unknown>) => void;
};

export function AppShell({
  children,
  state,
  nowMs,
  activeTab,
  focusedTab,
  isTabSwitching,
  onUserTabClick,
  onTabFocus,
  onTabKeyDown,
  onTabRef,
  onNavigateTo,
  visibleTabs,
  combinedTabVisibility,
  hiddenTabCount,
  onTabRailScroll,
  onOpenHiddenTabRecovery,
  onOpenHelp,
  onOpenShortcuts,
  onDismissShortcutHint,
  shortcutsHintDismissed,
  nextActionChips,
  onDismissNextActionChip,
  onSelectNextActionChip,
  tabRailHasOverflow,
  tabRailCanScrollBackward,
  tabRailCanScrollForward,
  toasts,
  onDismissToast,
  toastSafeTopPx,
  currentEventMultiplier,
  themeMode,
  emitUxEvent,
}: AppShellProps) {
  const primaryNavRef = useRef<HTMLElement>(null);
  const [focusedTabState, setFocusedTabState] = useState(focusedTab);
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  useEffect(() => {
    setFocusedTabState(focusedTab);
  }, [focusedTab]);

  const handleHelpKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Tab" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (visibleTabs.length === 0) {
      return;
    }

    const preferredTabId = visibleTabs.find((tab: TabMeta) => tab.id === "collection")?.id;
    const nextTabId = preferredTabId ?? visibleTabs[0].id;
    const nextTab = tabRefs.current.get(nextTabId);
    if (nextTab) {
      nextTab.focus();
    }
    setFocusedTabState(nextTabId);
  };

  const handleTabRef = useCallback(
    (tabId: TabId, node: HTMLButtonElement | null) => {
      if (!node) {
        tabRefs.current.delete(tabId);
        return;
      }
      tabRefs.current.set(tabId, node);
      onTabRef(tabId, node);
    },
    [onTabRef],
  );

  const tabReadiness = useMemo(() => getTabReadiness(state, nowMs), [state, nowMs]);

  const stats = useMemo(() => {
    const eventMultiplier = getEventIncomeMultiplier(state, nowMs);
    const cashRate = getEffectiveCashRateCentsPerSec(state, nowMs, eventMultiplier);
    const enjoymentRate = getEnjoymentRateCentsPerSec(state) * eventMultiplier;

    return {
      cash: state.currencyCents,
      cashRate,
      enjoyment: getEnjoymentCents(state),
      enjoymentRate,
      sentimentalValue: getCollectionValueCents(state),
      softcap: formatSoftcapEfficiency(getSoftcapEfficiency(state)),
    };
  }, [nowMs, state]);

  const canPrestigeWorkshop = useMemo(() => canWorkshopPrestige(state), [state]);
  const canPrestigeMaison = useMemo(() => canMaisonPrestige(state), [state]);
  const canPrestigeNostalgia = useMemo(() => canNostalgiaPrestige(state), [state]);

  const showWorkshopPanel =
    canPrestigeWorkshop || state.workshopPrestigeCount > 0 || state.workshopBlueprints > 0;
  const showWorkshopTeaser = !showWorkshopPanel && isWorkshopRevealReady(state);
  const showWorkshopSection = showWorkshopPanel || showWorkshopTeaser;

  const showMaisonPanel =
    canPrestigeMaison || state.maisonHeritage > 0 || state.maisonReputation > 0;
  const showMaisonTeaser = !showMaisonPanel && isMaisonRevealReady(state);
  const showMaisonSection = showMaisonPanel || showMaisonTeaser;

  const nostalgiaPrestigeThreshold = getNostalgiaPrestigeThresholdCents();
  const nostalgiaEarned = state.nostalgiaEnjoymentEarnedCents;
  const nostalgiaProgress = Math.min(1, nostalgiaEarned / nostalgiaPrestigeThreshold);

  const showNostalgiaPanel =
    state.nostalgiaPoints > 0 ||
    canPrestigeNostalgia ||
    state.nostalgiaResets > 0 ||
    state.nostalgiaUnlockedItems.length > 0;
  const showNostalgiaTeaser = !showNostalgiaPanel && nostalgiaProgress >= 0.8;

  const systemStats = {
    atelierResets: state.workshopPrestigeCount,
    maisonHeritage: state.maisonHeritage,
    maisonReputation: state.maisonReputation,
    eventMultiplier: currentEventMultiplier,
  };

  const systemVisibility = {
    atelier: showWorkshopPanel,
    maison: showMaisonPanel,
    events: currentEventMultiplier > 1,
  };

  const guideLanes = useMemo(() => getGuideLanes(state, nowMs), [nowMs, state]);

  const runMissionAction = useCallback(
    (action: GuideLaneAction) => {
      emitUxEvent("mission.action", {
        label: action.label,
        tabId: action.target.tabId,
        targetId: action.target.scrollTargetId ?? null,
      });

      const destinationTab = combinedTabVisibility[action.target.tabId]
        ? action.target.tabId
        : "collection";
      onNavigateTo(destinationTab, action.target.scrollTargetId);
    },
    [combinedTabVisibility, emitUxEvent, onNavigateTo],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <div id="app-shell">
      <main className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">Collection loop</p>
            <h1>Emily Idle</h1>
            <p className="muted">Build your collection, unlock new lines, and stack bonuses.</p>
            <nav className="page-nav" aria-label="Primary navigation" ref={primaryNavRef}>
              <div className="page-tab-rail__wrapper">
                <PageTabRail
                  tabs={visibleTabs}
                  activeTabId={activeTab}
                  focusedTabId={focusedTabState}
                  onTabClick={onUserTabClick}
                  onTabFocus={onTabFocus}
                  onTabKeyDown={onTabKeyDown}
                  onTabRef={handleTabRef}
                  tabReadiness={tabReadiness}
                />
                <TabSwitchSkeleton visible={isTabSwitching} />
              </div>
              {hiddenTabCount > 0 ? (
                <button
                  type="button"
                  className="secondary hidden-tabs-recovery-button"
                  data-testid="hidden-tabs-recovery"
                  onClick={onOpenHiddenTabRecovery}
                >
                  Hidden tabs: {hiddenTabCount}
                </button>
              ) : null}
              {tabRailHasOverflow ? (
                <>
                  <button
                    type="button"
                    className="secondary"
                    data-testid="tab-overflow-prev"
                    aria-label="Reveal previous tabs"
                    onClick={() => onTabRailScroll(-1)}
                    disabled={!tabRailCanScrollBackward}
                  >
                    Prev tabs
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    data-testid="tab-overflow-next"
                    aria-label="Reveal more tabs"
                    onClick={() => onTabRailScroll(1)}
                    disabled={!tabRailCanScrollForward}
                  >
                    Next tabs
                  </button>
                  <span className="muted" data-testid="tab-overflow-hint">
                    Swipe or use Prev/Next to reveal more tabs.
                  </span>
                </>
              ) : null}
              <button
                type="button"
                className="help-open-button"
                aria-label="Open help"
                data-testid="help-open"
                onClick={onOpenHelp}
                onKeyDown={handleHelpKeyDown}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </button>
              <button
                type="button"
                className="secondary shortcuts-open-button"
                aria-label="Open keyboard shortcuts"
                data-testid="shortcuts-open"
                onClick={onOpenShortcuts}
              >
                ?
              </button>
            </nav>
            {!shortcutsHintDismissed ? (
              <div className="shortcut-hint-inline" data-testid="shortcut-hint-inline">
                <p className="muted">
                  {tabRailHasOverflow
                    ? "Keyboard: 1-8 switches visible tabs. Swipe or use Prev/Next for more."
                    : "Keyboard: 1-8 switches tabs. Use ? for shortcuts."}
                </p>
                <button
                  type="button"
                  className="secondary"
                  data-testid="shortcut-hint-dismiss"
                  onClick={onDismissShortcutHint}
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
          <StatsHeader
            stats={stats}
            systemStats={systemStats}
            systemVisibility={systemVisibility}
            eventMultiplier={currentEventMultiplier}
          />
        </header>

        {currentEventMultiplier > 1 && (
          <EventBanner
            activeEvents={[
              {
                id: "event-1",
                name: "Event Active",
                incomeMultiplier: currentEventMultiplier,
                remainingMs: 0,
              },
            ]}
          />
        )}

        <MissionRail
          urgency={guideLanes.urgency}
          urgencyReason={guideLanes.urgencyReason}
          now={{
            label: guideLanes.now.label,
            detail: guideLanes.now.detail,
            actionLabel: guideLanes.now.actionLabel,
            whyNow: guideLanes.now.whyNow,
            onAction: () => runMissionAction(guideLanes.now),
            testId: "mission-action-primary",
          }}
          next={{
            label: guideLanes.next.label,
            detail: guideLanes.next.detail,
            actionLabel: guideLanes.next.actionLabel,
            whyNow: guideLanes.next.whyNow,
            onAction: () => runMissionAction(guideLanes.next),
            testId: "mission-action-next",
          }}
          later={{
            label: guideLanes.later.label,
            detail: guideLanes.later.detail,
            actionLabel: guideLanes.later.actionLabel,
            whyNow: guideLanes.later.whyNow,
            onAction: () => runMissionAction(guideLanes.later),
            testId: "mission-action-later",
          }}
          checklist={guideLanes.checklist}
        />

        <NextActionChips
          chips={nextActionChips}
          onDismiss={onDismissNextActionChip}
          onSelect={onSelectNextActionChip}
        />

        {children}
      </main>
      <ToastStack toasts={toasts} onDismiss={onDismissToast} safeTopPx={toastSafeTopPx} />
    </div>
  );
}
