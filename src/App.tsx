import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "./ui/AppShell";
import { AppProviders } from "./ui/AppProviders";
import { AppTabs } from "./ui/AppTabs";
import { AppModals } from "./ui/AppModals";
import { useAppRuntime } from "./game/runtime/useAppRuntime";
import { type NextActionChip } from "./ui/components/NextActionChips";
import { type ToastMessage } from "./ui/components/ToastStack";
import { TAB_DEFINITIONS, type TabId } from "./ui/navigation/tabMeta";
import { isTestEnvironment } from "./game/runtime/isTestEnvironment";
import { resolveLandingTab, resolveTabAlias } from "./ui/navigation/landing";
import { detectPrestigeEvent, type PrestigeEvent } from "./ui/prestigeOnboarding";
import { emitTelemetryEvent } from "./ui/telemetry/emitter";
import { TELEMETRY_EVENTS } from "./ui/telemetry/events";
import {
  canPerformTherapistSession,
  canWorkshopPrestige,
  canMaisonPrestige,
  canNostalgiaPrestige,
  getAchievementProgressRatio,
  getEventIncomeMultiplier,
  getInteractionStreakDetail,
  getGuideLanes,
  getWatchItems,
  getWatchModels,
  getAchievements,
  getEvents,
  getMilestones,
  buyWatchModel,
  getAutoBuyEnabled,
} from "./game/state";
import type { GameState, WatchItemId, InteractionMiniGameMode } from "./game/state";
import { step } from "./game/sim";

const AUDIO_SETTINGS_KEY = "emily-idle:audio";
const SETTINGS_KEY = "emily-idle:settings";
const NAVIGATION_KEY = "emily-idle:navigation";

const HIDEABLE_TAB_IDS: TabId[] = ["career", "catalog", "workshop", "maison", "stats"];

const DEFAULT_AUDIO_SETTINGS = {
  sfxEnabled: false,
  bgmEnabled: false,
};

const DEFAULT_SETTINGS = {
  themeMode: "system" as const,
  hideCompletedAchievements: false,
  hiddenTabs: [] as TabId[],
  coachmarksDismissed: {} as Record<string, boolean>,
  confirmNostalgiaUnlocks: true,
  notificationPreferences: {
    sessionsReady: true,
    prestigeReady: true,
    achievements: true,
    events: true,
  },
};

const NEXT_ACTION_DISMISS_KEYS = {
  careerStarted: "next-action:career-started",
  firstPurchase: "next-action:first-purchase",
  prestigeWorkshop: "next-action:prestige-workshop",
  prestigeMaison: "next-action:prestige-maison",
  prestigeNostalgia: "next-action:prestige-nostalgia",
} as const;

function countOwnedWatchModels(gameState: GameState): number {
  return Object.values(gameState.watchModels).reduce(
    (total, value) => total + Math.max(0, Math.floor(value)),
    0,
  );
}

function getNextActionMilestones(gameState: GameState) {
  return {
    careerStarted: gameState.therapistCareer.careerStartId !== null,
    firstPurchase: countOwnedWatchModels(gameState) > 0,
    prestigeWorkshop: gameState.workshopPrestigeCount > 0,
    prestigeMaison: gameState.maisonHeritage > 0 || gameState.maisonReputation > 0,
    prestigeNostalgia: gameState.nostalgiaResets > 0,
  };
}

function loadNavigationState(): {
  lastTabId: TabId;
  tabSectionMemory?: Partial<Record<TabId, string>>;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(NAVIGATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const lastTabId = parsed.lastTabId;
    if (typeof lastTabId !== "string") return null;
    const resolvedTabId = resolveTabAlias(lastTabId);
    if (!resolvedTabId) return null;
    return { lastTabId: resolvedTabId, tabSectionMemory: parsed.tabSectionMemory };
  } catch {
    return null;
  }
}

function loadAudioSettings() {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_AUDIO_SETTINGS;
    return {
      sfxEnabled: typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : false,
      bgmEnabled: typeof parsed.bgmEnabled === "boolean" ? parsed.bgmEnabled : false,
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return {
      themeMode: ["light", "dark", "system"].includes(parsed.themeMode)
        ? parsed.themeMode
        : "system",
      hideCompletedAchievements:
        typeof parsed.hideCompletedAchievements === "boolean"
          ? parsed.hideCompletedAchievements
          : false,
      hiddenTabs: Array.isArray(parsed.hiddenTabs)
        ? parsed.hiddenTabs.filter(
            (id: unknown): id is TabId =>
              typeof id === "string" && HIDEABLE_TAB_IDS.includes(id as TabId),
          )
        : [],
      coachmarksDismissed:
        parsed.coachmarksDismissed && typeof parsed.coachmarksDismissed === "object"
          ? Object.entries(parsed.coachmarksDismissed).reduce<Record<string, boolean>>(
              (acc, [key, value]) => {
                if (typeof value === "boolean") acc[key] = value;
                return acc;
              },
              {},
            )
          : {},
      confirmNostalgiaUnlocks:
        typeof parsed.confirmNostalgiaUnlocks === "boolean" ? parsed.confirmNostalgiaUnlocks : true,
      notificationPreferences: {
        sessionsReady:
          typeof parsed.notificationPreferences?.sessionsReady === "boolean"
            ? parsed.notificationPreferences.sessionsReady
            : DEFAULT_SETTINGS.notificationPreferences.sessionsReady,
        prestigeReady:
          typeof parsed.notificationPreferences?.prestigeReady === "boolean"
            ? parsed.notificationPreferences.prestigeReady
            : DEFAULT_SETTINGS.notificationPreferences.prestigeReady,
        achievements:
          typeof parsed.notificationPreferences?.achievements === "boolean"
            ? parsed.notificationPreferences.achievements
            : DEFAULT_SETTINGS.notificationPreferences.achievements,
        events:
          typeof parsed.notificationPreferences?.events === "boolean"
            ? parsed.notificationPreferences.events
            : DEFAULT_SETTINGS.notificationPreferences.events,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

type InteractionKind = "winding" | "automatic" | "quartz";

type TabActivationSource = "user" | "deep-link" | "system";

export default function App() {
  const runtime = useAppRuntime();
  const { nowMs, state, setState, persistNow, markSaveDirty, resetSimulationClock } = runtime;

  const [activeInteraction, setActiveInteraction] = useState<null | {
    kind: InteractionKind;
    itemId: WatchItemId;
  }>(null);
  const [interactionModes, setInteractionModes] = useState<
    Record<InteractionKind, InteractionMiniGameMode>
  >({
    winding: "normal",
    automatic: "normal",
    quartz: "normal",
  });
  const initialNavigationState = useMemo(() => loadNavigationState(), []);

  const [saveStatus, setSaveStatus] = useState("");
  const [importText, setImportText] = useState("");
  const [workshopResetArmed, setWorkshopResetArmed] = useState(false);
  const [maisonResetArmed, setMaisonResetArmed] = useState(false);
  const [nostalgiaModalOpen, setNostalgiaModalOpen] = useState(false);
  const [nostalgiaResultsDismissed, setNostalgiaResultsDismissed] = useState(false);
  const [nostalgiaUnlockPending, setNostalgiaUnlockPending] = useState<WatchItemId | null>(null);
  const [prestigeOnboarding, setPrestigeOnboarding] = useState<PrestigeEvent | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shortcutModalOpen, setShortcutModalOpen] = useState(false);
  const [helpSectionId, setHelpSectionId] = useState<string | null>(null);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const tabSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerTabSwitch = useCallback(() => {
    setIsTabSwitching(true);
    if (tabSwitchTimerRef.current) clearTimeout(tabSwitchTimerRef.current);
    tabSwitchTimerRef.current = setTimeout(() => {
      setIsTabSwitching(false);
      tabSwitchTimerRef.current = null;
    }, 260);
  }, []);

  useEffect(() => {
    return () => {
      if (tabSwitchTimerRef.current) clearTimeout(tabSwitchTimerRef.current);
    };
  }, []);

  const [autoBuyToggle, setAutoBuyToggle] = useState(true);
  const [audioSettings, setAudioSettings] = useState(() => loadAudioSettings());
  const [settings, setSettings] = useState(() => loadSettings());
  const [coachmarksDismissed, setCoachmarksDismissed] = useState<Record<string, boolean>>(
    () => settings.coachmarksDismissed,
  );
  const shortcutsHintDismissed = coachmarksDismissed["keyboard-shortcuts"] ?? false;
  const primaryNavRef = useRef<HTMLElement | null>(null);
  const [tabRailHasOverflow, setTabRailHasOverflow] = useState(false);
  const [tabRailCanScrollBackward, setTabRailCanScrollBackward] = useState(false);
  const [tabRailCanScrollForward, setTabRailCanScrollForward] = useState(false);
  const [toastSafeTopPx, setToastSafeTopPx] = useState(96);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const pushToast = useCallback((toast: ToastMessage) => {
    setToasts((current) => {
      const next = current.filter((item) => item.id !== toast.id);
      next.unshift(toast);
      return next.slice(0, 3);
    });
    const existingTimer = toastTimers.current.get(toast.id);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
      toastTimers.current.delete(toast.id);
    }, 6000);
    toastTimers.current.set(toast.id, timer);
  }, []);

  const handleDismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
    const timer = toastTimers.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(toastId);
    }
  }, []);

  useEffect(() => {
    return () => {
      toastTimers.current.forEach((timer) => clearTimeout(timer));
      toastTimers.current.clear();
    };
  }, []);

  const persistSettings = useCallback((nextSettings: typeof settings) => {
    setSettings(nextSettings);
    setCoachmarksDismissed(nextSettings.coachmarksDismissed);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  }, []);

  const tabs = useMemo(() => TAB_DEFINITIONS, []);
  const [activeTab, setActiveTab] = useState<TabId>("career");
  const [focusedTab, setFocusedTab] = useState<TabId>("career");
  const [hasResolvedInitialTab, setHasResolvedInitialTab] = useState(false);
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());
  const tabSectionMemoryRef = useRef<Partial<Record<TabId, string>>>(
    initialNavigationState?.tabSectionMemory ?? {},
  );
  const lastNavigatedTabRef = useRef<TabId>("career");

  const handleTabRef = useCallback((tabId: TabId, node: HTMLButtonElement | null) => {
    if (!node) {
      tabRefs.current.delete(tabId);
      return;
    }
    tabRefs.current.set(tabId, node);
  }, []);

  const handleTabFocus = useCallback((tabId: TabId) => {
    if (isTestEnvironment()) return;
    setFocusedTab(tabId);
  }, []);

  const emitUxEvent = useCallback((eventName: string, detail: Record<string, unknown>) => {
    if (isTestEnvironment()) return;
    console.info(`[ux] ${eventName}`, detail);
  }, []);

  const getTabRailScrollNode = useCallback(
    () => primaryNavRef.current?.querySelector<HTMLDivElement>(".page-tab-rail__scroll") ?? null,
    [],
  );

  const updateTabRailOverflowState = useCallback(() => {
    const scrollNode = getTabRailScrollNode();
    if (!scrollNode) {
      setTabRailHasOverflow(false);
      setTabRailCanScrollBackward(false);
      setTabRailCanScrollForward(false);
      return;
    }
    const edgeTolerance = 2;
    const maxScrollLeft = Math.max(0, scrollNode.scrollWidth - scrollNode.clientWidth);
    const hasOverflow = maxScrollLeft > edgeTolerance;
    const canScrollBackward = hasOverflow && scrollNode.scrollLeft > edgeTolerance;
    const canScrollForward = hasOverflow && scrollNode.scrollLeft < maxScrollLeft - edgeTolerance;
    setTabRailHasOverflow(hasOverflow);
    setTabRailCanScrollBackward(canScrollBackward);
    setTabRailCanScrollForward(canScrollForward);
  }, [getTabRailScrollNode]);

  const updateToastSafeTopOffset = useCallback(() => {
    const navNode = primaryNavRef.current;
    if (!navNode) {
      setToastSafeTopPx(96);
      return;
    }
    const nextTop = Math.max(96, Math.ceil(navNode.getBoundingClientRect().bottom + 12));
    setToastSafeTopPx((current) => (Math.abs(current - nextTop) <= 1 ? current : nextTop));
  }, []);

  const focusTabById = useCallback((tabId: TabId) => {
    tabRefs.current.get(tabId)?.focus();
  }, []);

  const moveTabFocus = useCallback(
    (direction: -1 | 1) => {
      const visibleTabsList = visibleTabs;
      if (visibleTabsList.length === 0) return;
      const currentIndex = visibleTabsList.findIndex((tab) => tab.id === focusedTab);
      const nextIndex =
        (currentIndex + direction + visibleTabsList.length) % visibleTabsList.length;
      const nextId = visibleTabsList[nextIndex].id;
      setFocusedTab(nextId);
      focusTabById(nextId);
    },
    [focusedTab],
  );

  const focusEdgeTab = useCallback((edge: "first" | "last") => {
    const visibleTabsList = visibleTabs;
    if (visibleTabsList.length === 0) return;
    const nextId =
      edge === "first" ? visibleTabsList[0].id : visibleTabsList[visibleTabsList.length - 1].id;
    setFocusedTab(nextId);
    focusTabById(nextId);
  }, []);

  const scrollToSection = useCallback((targetId: string) => {
    if (typeof document === "undefined") return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (!target) return;
        target.scrollIntoView({ block: "start", behavior: "auto" });
      });
    });
  }, []);

  const persistNavigationState = useCallback((lastTabId: TabId) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      NAVIGATION_KEY,
      JSON.stringify({
        lastTabId,
        tabSectionMemory: tabSectionMemoryRef.current,
      }),
    );
  }, []);

  const activateTab = useCallback(
    (tabId: TabId, source: TabActivationSource = "system") => {
      setActiveTab(tabId);
      setFocusedTab(tabId);
      triggerTabSwitch();
      lastNavigatedTabRef.current = tabId;
      if (source !== "user") return;
      persistNavigationState(tabId);
    },
    [persistNavigationState, triggerTabSwitch],
  );

  const navigateTo = useCallback(
    (tabId: TabId, scrollTargetId?: string) => {
      activateTab(tabId, "system");
      const rememberedTargetId = scrollTargetId ?? tabSectionMemoryRef.current[tabId];
      if (!rememberedTargetId) return;
      tabSectionMemoryRef.current[tabId] = rememberedTargetId;
      emitUxEvent("navigate.tab", {
        tabId,
        targetId: rememberedTargetId,
        source: scrollTargetId ? "explicit" : "memory",
      });
      scrollToSection(rememberedTargetId);
      persistNavigationState(lastNavigatedTabRef.current);
    },
    [activateTab, emitUxEvent, persistNavigationState, scrollToSection],
  );

  const handleUserTabClick = useCallback(
    (tabId: TabId) => {
      activateTab(tabId, "user");
      const rememberedTargetId = tabSectionMemoryRef.current[tabId];
      if (!rememberedTargetId) return;
      emitUxEvent("navigate.restore-tab-section", { tabId, targetId: rememberedTargetId });
      scrollToSection(rememberedTargetId);
      persistNavigationState(lastNavigatedTabRef.current);
    },
    [activateTab, emitUxEvent, persistNavigationState, scrollToSection],
  );

  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (visibleTabs.length === 0) return;
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          moveTabFocus(-1);
          return;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          moveTabFocus(1);
          return;
        case "Home":
          event.preventDefault();
          focusEdgeTab("first");
          return;
        case "End":
          event.preventDefault();
          focusEdgeTab("last");
          return;
        case "Enter":
        case " ":
          event.preventDefault();
          activateTab(focusedTab, "user");
          return;
      }
    },
    [activateTab, focusedTab, moveTabFocus, focusEdgeTab],
  );

  const handlePurchase = useCallback(
    (nextState: GameState, meta?: { prestigeTier?: string }) => {
      if (nextState !== state) {
        const prestigeTier = meta?.prestigeTier as "workshop" | "maison" | "nostalgia" | undefined;
        const prestigeEvent = detectPrestigeEvent(state, nextState, nowMs, prestigeTier);
        if (prestigeEvent) setPrestigeOnboarding(prestigeEvent);
        setState(nextState);
        markSaveDirty();
        persistNow("purchase", nextState);
      }
    },
    [state, nowMs, setState, markSaveDirty, persistNow],
  );

  const handleToggleAutoBuy = useCallback(() => {
    setAutoBuyToggle((value) => !value);
  }, []);

  const handleInteract = useCallback((itemId: WatchItemId) => {
    const watchItems = getWatchItems();
    const item = watchItems.find((entry) => entry.id === itemId);
    if (!item) return;
    if (item.movement === "manual" || item.movement === "tourbillon") {
      setActiveInteraction({ kind: "winding", itemId });
    } else if (item.movement === "automatic") {
      setActiveInteraction({ kind: "automatic", itemId });
    } else if (item.movement === "quartz") {
      setActiveInteraction({ kind: "quartz", itemId });
    }
  }, []);

  const handleInteractionModeChange = useCallback(
    (kind: InteractionKind, mode: InteractionMiniGameMode) => {
      setInteractionModes((current) => {
        if (current[kind] === mode) return current;
        return { ...current, [kind]: mode };
      });
    },
    [],
  );

  const handleCraftBoost = useCallback((boostId: string) => {
    // Handled in AppTabs via onPurchase
  }, []);

  const handleUpdateAudioSettings = useCallback((nextSettings: typeof audioSettings) => {
    setAudioSettings(nextSettings);
    window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(nextSettings));
  }, []);

  const handleExport = useCallback(async () => {
    const { encodeSaveString } = await import("./game/persistence");
    const saveString = encodeSaveString(state);
    setImportText(saveString);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(saveString);
        setSaveStatus("Exported and copied to clipboard.");
        return;
      } catch {
        setSaveStatus("Exported. Copy the text manually.");
        return;
      }
    }
    setSaveStatus("Exported. Copy the text manually.");
  }, [state]);

  const handleImport = useCallback(async () => {
    const { decodeSaveString } = await import("./game/persistence");
    const trimmed = importText.trim();
    if (!trimmed) {
      setSaveStatus("Paste an exported save string to import.");
      return;
    }
    const decoded = decodeSaveString(trimmed);
    if (!decoded.ok) {
      setSaveStatus(`Import failed: ${decoded.error}`);
      return;
    }
    setState(decoded.save.state);
    resetSimulationClock(decoded.save.lastSimulatedAtMs);
    markSaveDirty();
    persistNow("import", decoded.save.state);
    const migrationLabel =
      decoded.migratedFromVersion !== undefined
        ? ` (migrated from v${decoded.migratedFromVersion})`
        : "";
    setSaveStatus(`Imported save from ${decoded.save.savedAt}${migrationLabel}.`);
  }, [importText, setState, resetSimulationClock, markSaveDirty, persistNow]);

  const handleImportFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        setSaveStatus("Select a file to import.");
        return;
      }
      try {
        const raw = await file.text();
        setImportText(raw);
        const { decodeSaveString } = await import("./game/persistence");
        const decoded = decodeSaveString(raw.trim());
        if (!decoded.ok) {
          setSaveStatus(`Import failed: ${decoded.error}`);
          return;
        }
        setState(decoded.save.state);
        resetSimulationClock(decoded.save.lastSimulatedAtMs);
        markSaveDirty();
        persistNow("import", decoded.save.state);
        const migrationLabel =
          decoded.migratedFromVersion !== undefined
            ? ` (migrated from v${decoded.migratedFromVersion})`
            : "";
        setSaveStatus(`Imported save from ${decoded.save.savedAt}${migrationLabel}.`);
      } catch (error) {
        setSaveStatus("Unable to read the selected file. Please try again.");
      }
    },
    [setState, resetSimulationClock, markSaveDirty, persistNow],
  );

  const handleClearSave = useCallback(async () => {
    if (typeof window === "undefined") return;
    const { bumpSaveClearEpoch, clearLocalStorageSave } = await import("./game/persistence");
    const { createInitialState } = await import("./game/state");
    const bumpEpochResult = bumpSaveClearEpoch();
    if (!bumpEpochResult.ok)
      console.warn(`Failed to update clear-save epoch. ${bumpEpochResult.error}`);
    const clearResult = clearLocalStorageSave();
    if (!clearResult.ok) console.warn(`Failed to clear save data. ${clearResult.error}`);
    window.localStorage.removeItem(NAVIGATION_KEY);
    const fresh = createInitialState();
    setState(fresh);
    resetSimulationClock();
    setImportText("");
    setSaveStatus("Cleared save. Starting fresh.");
    setActiveTab("career");
    setFocusedTab("career");
    focusTabById("career");
    window.localStorage.setItem(NAVIGATION_KEY, JSON.stringify({ lastTabId: "career" }));
    window.location.reload();
  }, [setState, resetSimulationClock, focusTabById]);

  const handleDismissShortcutHint = useCallback(() => {
    if (settings.coachmarksDismissed["keyboard-shortcuts"]) return;
    persistSettings({
      ...settings,
      coachmarksDismissed: { ...settings.coachmarksDismissed, "keyboard-shortcuts": true },
    });
  }, [settings, persistSettings]);

  const handleOpenHelp = useCallback(() => {
    emitTelemetryEvent(TELEMETRY_EVENTS.helpOpen, {
      source: "header-help-button",
      sectionId: helpSectionId ?? "intro",
    });
    setHelpOpen(true);
  }, [helpSectionId]);

  const handleDismissWindingTapHint = useCallback(() => {
    if (settings.coachmarksDismissed["winding:tap-hint"]) return;
    persistSettings({
      ...settings,
      coachmarksDismissed: { ...settings.coachmarksDismissed, "winding:tap-hint": true },
    });
  }, [settings, persistSettings]);

  const achievements = useMemo(() => getAchievements(), []);
  const events = useMemo(() => getEvents(), []);
  const milestones = useMemo(() => getMilestones(), []);
  const currentEventMultiplier = useMemo(
    () => getEventIncomeMultiplier(state, nowMs),
    [state, nowMs],
  );
  const interactionStreak = useMemo(() => getInteractionStreakDetail(state), [state]);

  const statsVisibilityRatio = useMemo(
    () => getAchievementProgressRatio(state, "first-drawer"),
    [state],
  );

  const guideLanes = useMemo(() => getGuideLanes(state, nowMs), [state, nowMs]);

  const hiddenTabsSet = useMemo<Set<TabId>>(
    () => new Set(settings.hiddenTabs),
    [settings.hiddenTabs],
  );

  const tabVisibility = useMemo(
    () => ({
      collection: true,
      career: true,
      upgrades: true,
      save: true,
      nostalgia:
        state.nostalgiaPoints > 0 || canNostalgiaPrestige(state) || state.nostalgiaResets > 0,
      catalog: true,
      stats: statsVisibilityRatio >= 0.8,
      workshop:
        canWorkshopPrestige(state) ||
        state.workshopPrestigeCount > 0 ||
        state.workshopBlueprints > 0,
      maison: canMaisonPrestige(state) || state.maisonHeritage > 0 || state.maisonReputation > 0,
    }),
    [state, statsVisibilityRatio],
  );

  const combinedTabVisibility = useMemo(
    () => ({
      collection: true,
      save: true,
      nostalgia: tabVisibility.nostalgia,
      career: tabVisibility.career && !hiddenTabsSet.has("career"),
      upgrades: tabVisibility.upgrades,
      catalog: tabVisibility.catalog && !hiddenTabsSet.has("catalog"),
      stats: tabVisibility.stats && !hiddenTabsSet.has("stats"),
      workshop: tabVisibility.workshop && !hiddenTabsSet.has("workshop"),
      maison: tabVisibility.maison && !hiddenTabsSet.has("maison"),
    }),
    [hiddenTabsSet, tabVisibility],
  );

  const visibleTabs = useMemo(
    () => tabs.filter((tab) => combinedTabVisibility[tab.id]),
    [tabs, combinedTabVisibility],
  );

  const visibleTabOptions = useMemo(
    () => tabs.filter((tab) => HIDEABLE_TAB_IDS.includes(tab.id) && tabVisibility[tab.id]),
    [tabs, tabVisibility],
  );

  const actionableHiddenTabIds = useMemo<TabId[]>(
    () =>
      settings.hiddenTabs.filter(
        (hiddenTabId: TabId) =>
          HIDEABLE_TAB_IDS.includes(hiddenTabId) && tabVisibility[hiddenTabId],
      ),
    [settings.hiddenTabs, tabVisibility],
  );
  const hiddenTabCount = actionableHiddenTabIds.length;

  const restoreAllHiddenTabs = useCallback(() => {
    if (actionableHiddenTabIds.length === 0) return;
    persistSettings({ ...settings, hiddenTabs: [] });
    emitUxEvent("settings.restore-hidden-tabs", { restoredCount: actionableHiddenTabIds.length });
  }, [actionableHiddenTabIds.length, emitUxEvent, persistSettings, settings]);

  const handleTabRailScroll = useCallback(
    (direction: -1 | 1) => {
      const scrollNode = getTabRailScrollNode();
      if (!scrollNode) return;
      const distance = Math.max(120, Math.floor(scrollNode.clientWidth * 0.72)) * direction;
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (typeof scrollNode.scrollBy === "function") {
        scrollNode.scrollBy({ left: distance, behavior: prefersReducedMotion ? "auto" : "smooth" });
        return;
      }
      scrollNode.scrollLeft += distance;
    },
    [getTabRailScrollNode],
  );

  const handleOpenHiddenTabRecovery = useCallback(() => {
    emitUxEvent("settings.hidden-tabs-recovery", { hiddenTabCount });
    navigateTo("save", "settings-visibility");
  }, [emitUxEvent, hiddenTabCount, navigateTo]);

  const nextActionMilestones = useMemo(() => getNextActionMilestones(state), [state]);

  const dismissNextAction = useCallback(
    (dismissKey?: string) => {
      if (!dismissKey || settings.coachmarksDismissed[dismissKey]) return;
      persistSettings({
        ...settings,
        coachmarksDismissed: { ...settings.coachmarksDismissed, [dismissKey]: true },
      });
    },
    [persistSettings, settings],
  );

  const nextActionChips = useMemo<NextActionChip[]>(() => {
    const chips: NextActionChip[] = [];
    if (
      nextActionMilestones.careerStarted &&
      !settings.coachmarksDismissed[NEXT_ACTION_DISMISS_KEYS.careerStarted]
    ) {
      chips.push({
        id: "career-started",
        title: "Career started",
        detail: "Nice start. Buy your first watch in Catalog to begin the collection loop.",
        ctaLabel: "Open Catalog",
        tabId: "catalog",
        scrollTargetId: "catalog-shop",
        dismissKey: NEXT_ACTION_DISMISS_KEYS.careerStarted,
      });
    }
    if (
      nextActionMilestones.firstPurchase &&
      !settings.coachmarksDismissed[NEXT_ACTION_DISMISS_KEYS.firstPurchase]
    ) {
      chips.push({
        id: "first-purchase",
        title: "First purchase complete",
        detail: "Great. Jump back to Career and run sessions to fund your next upgrades.",
        ctaLabel: "Open Career",
        tabId: "career",
        dismissKey: NEXT_ACTION_DISMISS_KEYS.firstPurchase,
      });
    }
    if (
      nextActionMilestones.prestigeWorkshop &&
      !settings.coachmarksDismissed[NEXT_ACTION_DISMISS_KEYS.prestigeWorkshop]
    ) {
      chips.push({
        id: "prestige-workshop",
        title: "Atelier prestige complete",
        detail: "Spend Blueprints now to accelerate your rebuild.",
        ctaLabel: "Open Atelier",
        tabId: "workshop",
        dismissKey: NEXT_ACTION_DISMISS_KEYS.prestigeWorkshop,
      });
    }
    if (
      nextActionMilestones.prestigeMaison &&
      !settings.coachmarksDismissed[NEXT_ACTION_DISMISS_KEYS.prestigeMaison]
    ) {
      chips.push({
        id: "prestige-maison",
        title: "Maison prestige complete",
        detail: "Use your legacy gains on Maison upgrades, then resume your collection rebuild.",
        ctaLabel: "Open Maison",
        tabId: "maison",
        dismissKey: NEXT_ACTION_DISMISS_KEYS.prestigeMaison,
      });
    }
    if (
      nextActionMilestones.prestigeNostalgia &&
      !settings.coachmarksDismissed[NEXT_ACTION_DISMISS_KEYS.prestigeNostalgia]
    ) {
      chips.push({
        id: "prestige-nostalgia",
        title: "Nostalgia prestige complete",
        detail: "Spend Nostalgia in unlocks early to speed up the next run.",
        ctaLabel: "Open Nostalgia",
        tabId: "nostalgia",
        dismissKey: NEXT_ACTION_DISMISS_KEYS.prestigeNostalgia,
      });
    }
    return chips;
  }, [nextActionMilestones, settings.coachmarksDismissed]);

  const handleDismissNextActionChip = useCallback(
    (chip: NextActionChip) => {
      dismissNextAction(chip.dismissKey);
    },
    [dismissNextAction],
  );

  const handleSelectNextActionChip = useCallback(
    (chip: NextActionChip) => {
      const destinationTab = combinedTabVisibility[chip.tabId] ? chip.tabId : "collection";
      navigateTo(destinationTab, chip.scrollTargetId);
      dismissNextAction(chip.dismissKey);
    },
    [combinedTabVisibility, dismissNextAction, navigateTo],
  );

  useLayoutEffect(() => {
    if (hasResolvedInitialTab) return;
    const isVisible = (tabId: TabId) => combinedTabVisibility[tabId];
    const hasSave =
      typeof window !== "undefined" && window.localStorage.getItem("emily-idle:save") !== null;
    const { tabId } = resolveLandingTab({
      search: typeof window !== "undefined" ? window.location.search : "",
      hasSave,
      navigationState: initialNavigationState,
      isVisible,
    });
    activateTab(tabId, "system");
    setHasResolvedInitialTab(true);
  }, [activateTab, combinedTabVisibility, hasResolvedInitialTab, initialNavigationState]);

  useEffect(() => {
    if (!combinedTabVisibility[activeTab] && activeTab !== "collection") {
      activateTab("collection", "system");
    }
  }, [activeTab, activateTab, combinedTabVisibility]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as Element | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "SELECT" ||
          tag === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable
        ) {
          return;
        }
      }
      if (helpOpen || nostalgiaModalOpen || activeInteraction || prestigeOnboarding) return;
      if (event.key === "?") {
        event.preventDefault();
        setShortcutModalOpen(true);
        return;
      }
      const match = /^Digit([1-8])$/.exec(event.code);
      if (!match) return;
      const index = Number(match[1]) - 1;
      const nextTab = visibleTabs[index];
      if (!nextTab) return;
      event.preventDefault();
      activateTab(nextTab.id, "user");
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [
    activateTab,
    visibleTabs,
    helpOpen,
    nostalgiaModalOpen,
    activeInteraction,
    prestigeOnboarding,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const runtimeWindow = window as Window & {
      render_game_to_text?: () => string;
      advanceTime?: (ms: number) => void;
    };
    runtimeWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: "UI state snapshot (no world coordinates); values are current frame.",
        tab: activeTab,
        mission: {
          urgency: guideLanes.urgency,
          primary: guideLanes.now.label,
          secondary: guideLanes.next.label,
          now: guideLanes.now.label,
          next: guideLanes.next.label,
          later: guideLanes.later.label,
        },
        currencies: {
          cashCents: state.currencyCents,
          enjoymentCents: state.enjoymentCents,
          memoriesCents: 0, // Placeholder
        },
        rates: {
          cashPerSecCents: 0, // Placeholder
          enjoymentPerSecCents: 0, // Placeholder
          eventMultiplier: currentEventMultiplier,
        },
        therapistCareer: {
          started: state.therapistCareer.careerStartId !== null,
          level: state.therapistCareer.level,
          xp: state.therapistCareer.xp,
          nextAvailableAtMs: state.therapistCareer.nextAvailableAtMs,
        },
        interactions: {
          runsTotal: state.interactionRunsTotal,
          perfectRuns: state.interactionPerfectRuns,
          perfectStreak: state.interactionPerfectStreak,
          bestPerfectStreak: state.interactionBestPerfectStreak,
        },
      });
    runtimeWindow.advanceTime = (ms: number) => {
      const totalMs = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
      if (totalMs <= 0) return;
      const chunkMs = 100;
      let advancedNowMs = nowMs;
      setState((currentState) => {
        let nextState = currentState;
        let elapsedMs = 0;
        let currentNowMs = nowMs;
        while (elapsedMs < totalMs) {
          const dtMs = Math.min(chunkMs, totalMs - elapsedMs);
          currentNowMs += dtMs;
          nextState = step(nextState, dtMs, currentNowMs);
          elapsedMs += dtMs;
        }
        advancedNowMs = currentNowMs;
        return nextState;
      });
      markSaveDirty();
      resetSimulationClock(advancedNowMs);
    };
    return () => {
      delete runtimeWindow.render_game_to_text;
      delete runtimeWindow.advanceTime;
    };
  }, [
    activeTab,
    currentEventMultiplier,
    guideLanes,
    markSaveDirty,
    nowMs,
    resetSimulationClock,
    setState,
    state,
  ]);

  const previousAchievementUnlocksRef = useRef<Set<string>>(new Set());
  const previousSessionReadyRef = useRef(false);
  const previousPrestigeReadyRef = useRef({ workshop: false, maison: false, nostalgia: false });
  const notificationsInitializedRef = useRef(false);

  useEffect(() => {
    const sessionReady = canPerformTherapistSession(state, nowMs);
    const prestigeReady = {
      workshop: canWorkshopPrestige(state),
      maison: canMaisonPrestige(state),
      nostalgia: canNostalgiaPrestige(state),
    };
    const achievementUnlocks = new Set(state.achievementUnlocks);

    if (!notificationsInitializedRef.current) {
      notificationsInitializedRef.current = true;
      previousAchievementUnlocksRef.current = achievementUnlocks;
      previousSessionReadyRef.current = sessionReady;
      previousPrestigeReadyRef.current = prestigeReady;
      return;
    }

    const preferences = settings.notificationPreferences;
    const achievementById = new Map(achievements.map((a) => [a.id, a]));

    if (preferences.achievements) {
      for (const achievementId of achievementUnlocks) {
        if (previousAchievementUnlocksRef.current.has(achievementId)) continue;
        const achievement = achievementById.get(achievementId);
        if (!achievement) continue;
        pushToast({
          id: `achievement-${achievement.id}`,
          title: "Achievement unlocked",
          message: achievement.name,
          detail: achievement.description,
        });
      }
    }

    if (preferences.sessionsReady && sessionReady && !previousSessionReadyRef.current) {
      pushToast({
        id: `session-ready-${state.therapistCareer.nextAvailableAtMs}`,
        title: "Session ready",
        message: "Therapist session is available again.",
        detail: "Head to Career to run your next session.",
      });
    }

    if (preferences.prestigeReady) {
      if (prestigeReady.workshop && !previousPrestigeReadyRef.current.workshop) {
        pushToast({
          id: `prestige-workshop-${state.workshopPrestigeCount}`,
          title: "Atelier ready",
          message: "Workshop prestige is now available.",
          detail: "Visit Workshop to convert enjoyment into blueprints.",
        });
      }
      if (prestigeReady.maison && !previousPrestigeReadyRef.current.maison) {
        pushToast({
          id: `prestige-maison-${state.maisonHeritage}-${state.maisonReputation}`,
          title: "Maison ready",
          message: "Maison prestige is available.",
          detail: "Visit Maison to claim Heritage and Reputation.",
        });
      }
      if (prestigeReady.nostalgia && !previousPrestigeReadyRef.current.nostalgia) {
        pushToast({
          id: `prestige-nostalgia-${state.nostalgiaResets}-${state.nostalgiaPoints}`,
          title: "Nostalgia ready",
          message: "Nostalgia prestige threshold reached.",
          detail: "Visit Nostalgia when you want to reset for permanent points.",
        });
      }
    }

    previousAchievementUnlocksRef.current = achievementUnlocks;
    previousSessionReadyRef.current = sessionReady;
    previousPrestigeReadyRef.current = prestigeReady;
  }, [achievements, nowMs, pushToast, settings.notificationPreferences, state]);

  useEffect(() => {
    if (state.nostalgiaLastGain > 0) {
      setNostalgiaResultsDismissed(false);
    }
  }, [state.nostalgiaLastGain]);

  useEffect(() => {
    if (isTestEnvironment()) return;
    if (!getAutoBuyEnabled(state)) {
      setAutoBuyToggle(false);
    }
  }, [state]);

  useEffect(() => {
    if (!autoBuyToggle) return;
    const watchModels = getWatchModels();
    const autoBuyTrigger = state.currencyCents + state.unlockedMilestones.length;
    if (autoBuyTrigger <= 0) return;

    setState((current) => {
      let nextState = current;
      for (const model of watchModels) {
        if (!model.id) continue;
        for (let i = 0; i < 10; i += 1) {
          const candidateState = buyWatchModel(nextState, model.id);
          if (candidateState === nextState) break;
          nextState = candidateState;
        }
      }
      if (nextState !== current) markSaveDirty();
      return nextState;
    });
  }, [autoBuyToggle, markSaveDirty, setState, state.currencyCents, state.unlockedMilestones]);

  const openHelpTo = useCallback(
    (sectionId: string) => {
      setHelpSectionId(sectionId);
      setHelpOpen(true);
    },
    [setHelpSectionId, setHelpOpen],
  );

  return (
    <AppProviders openHelpTo={openHelpTo}>
      <AppShell
        state={state}
        nowMs={nowMs}
        activeTab={activeTab}
        focusedTab={focusedTab}
        isTabSwitching={isTabSwitching}
        onUserTabClick={handleUserTabClick}
        onTabFocus={handleTabFocus}
        onTabKeyDown={handleTabKeyDown}
        onTabRef={handleTabRef}
        onNavigateTo={navigateTo}
        visibleTabs={visibleTabs}
        combinedTabVisibility={combinedTabVisibility}
        hiddenTabCount={hiddenTabCount}
        onTabRailScroll={handleTabRailScroll}
        onOpenHiddenTabRecovery={handleOpenHiddenTabRecovery}
        onOpenHelp={handleOpenHelp}
        onOpenShortcuts={() => setShortcutModalOpen(true)}
        onDismissShortcutHint={handleDismissShortcutHint}
        shortcutsHintDismissed={shortcutsHintDismissed}
        nextActionChips={nextActionChips}
        onDismissNextActionChip={handleDismissNextActionChip}
        onSelectNextActionChip={handleSelectNextActionChip}
        tabRailHasOverflow={tabRailHasOverflow}
        tabRailCanScrollBackward={tabRailCanScrollBackward}
        tabRailCanScrollForward={tabRailCanScrollForward}
        toasts={toasts}
        onDismissToast={handleDismissToast}
        toastSafeTopPx={toastSafeTopPx}
        currentEventMultiplier={currentEventMultiplier}
        themeMode={settings.themeMode}
        emitUxEvent={emitUxEvent}
      >
        <AppTabs
          state={state}
          nowMs={nowMs}
          activeTab={activeTab}
          onNavigateTo={navigateTo}
          onPurchase={handlePurchase}
          onInteract={handleInteract}
          onCraftBoost={handleCraftBoost}
          settings={settings}
          persistSettings={persistSettings}
          devSettings={runtime.devSettings}
          setDevSettings={runtime.setDevSettings}
          audioSettings={audioSettings}
          onUpdateAudioSettings={handleUpdateAudioSettings}
          importText={importText}
          setImportText={setImportText}
          saveStatus={saveStatus}
          setSaveStatus={setSaveStatus}
          onExport={handleExport}
          onImport={handleImport}
          onImportFile={handleImportFile}
          onClearSave={handleClearSave}
          visibleTabOptions={visibleTabOptions}
          hiddenTabsSet={hiddenTabsSet}
          hiddenTabCount={hiddenTabCount}
          onRestoreHiddenTabs={restoreAllHiddenTabs}
          autoBuyToggle={autoBuyToggle}
          onToggleAutoBuy={handleToggleAutoBuy}
          visibleTabs={visibleTabs}
          emitUxEvent={emitUxEvent}
        />
      </AppShell>

      <AppModals
        state={state}
        nowMs={nowMs}
        activeInteraction={activeInteraction}
        onSetActiveInteraction={setActiveInteraction}
        interactionModes={interactionModes}
        onInteractionModeChange={handleInteractionModeChange}
        interactionStreak={interactionStreak}
        helpOpen={helpOpen}
        onSetHelpOpen={setHelpOpen}
        helpSectionId={helpSectionId}
        onSetHelpSectionId={setHelpSectionId}
        shortcutModalOpen={shortcutModalOpen}
        onSetShortcutModalOpen={setShortcutModalOpen}
        prestigeOnboarding={prestigeOnboarding}
        onSetPrestigeOnboarding={setPrestigeOnboarding}
        onPurchase={handlePurchase}
        onActivateTab={(tabId: string, source: "user" | "deep-link" | "system") =>
          activateTab(tabId as TabId, source)
        }
        settings={settings}
        onDismissWindingTapHint={handleDismissWindingTapHint}
        watchItemLabels={useMemo(() => {
          const watchItems = getWatchItems();
          return new Map(watchItems.map((item) => [item.id, item.name]));
        }, [])}
      />
    </AppProviders>
  );
}
