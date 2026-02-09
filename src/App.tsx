import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { CareerTab } from "./ui/tabs/CareerTab";
import { CatalogTab } from "./ui/tabs/CatalogTab";
import { CollectionTab } from "./ui/tabs/CollectionTab";
import { MaisonTab } from "./ui/tabs/MaisonTab";
import { NostalgiaTab } from "./ui/tabs/NostalgiaTab";
import { SaveTab } from "./ui/tabs/SaveTab";
import { StatsTab } from "./ui/tabs/StatsTab";
import { UpgradesTab } from "./ui/tabs/UpgradesTab";
import { WorkshopTab } from "./ui/tabs/WorkshopTab";
import { HelpModal, loadHelpState, persistHelpState } from "./ui/help/HelpModal";
import { ExplainButton } from "./ui/help/ExplainButton";
import { HelpProvider } from "./ui/help/helpContext";
import { HELP_SECTION_IDS, HELP_SECTIONS } from "./ui/help/helpContent";
import { HelpIcon } from "./ui/icons/coreIcons";
import { PrestigeOnboardingModal } from "./ui/components/PrestigeOnboardingModal";
import { AutomaticMiniGameModal } from "./ui/components/AutomaticMiniGameModal";
import { QuartzMiniGameModal } from "./ui/components/QuartzMiniGameModal";
import { WindingMiniGameModal } from "./ui/components/WindingMiniGameModal";
import { StatsHeader } from "./ui/components/StatsHeader";
import { ToastStack, type ToastMessage } from "./ui/components/ToastStack";
import { detectPrestigeEvent, type PrestigeEvent } from "./ui/prestigeOnboarding";
import { resolveLandingTab, resolveTabAlias } from "./ui/navigation/landing";
import { PageTabRail } from "./ui/navigation/PageTabRail";
import { TabSwitchSkeleton } from "./ui/navigation/TabSwitchSkeleton";
import { getTabReadiness } from "./ui/navigation/tabReadiness";
import { TAB_DEFINITIONS, type TabId } from "./ui/navigation/tabMeta";

import { formatDurationFromMs, formatMoneyFromCents, formatSoftcapEfficiency } from "./game/format";
import {
  clearLocalStorageSave,
  decodeSaveString,
  encodeSaveString,
  loadSaveFromLocalStorage,
  persistSaveToLocalStorage,
} from "./game/persistence";
import { isTestEnvironment } from "./game/runtime/isTestEnvironment";
import { useGameRuntime, type OfflineProgressInfo } from "./game/runtime/useGameRuntime";
import {
  INTERACTION_BASE_COOLDOWN_MS,
  applyAutomaticReward,
  applyQuartzReward,
  applyWindingReward,
  buyWatchModel,
  canPerformTherapistSession,
  canMaisonPrestige,
  canWorkshopPrestige,
  canNostalgiaPrestige,
  createInitialState,
  getAchievementProgressRatio,
  getAchievements,
  getEffectiveCashRateCentsPerSec,
  getEnjoymentCents,
  getEnjoymentRateCentsPerSec,
  getSoftcapEfficiency,
  getCatalogDiscovery,
  getCatalogEntries,
  getCatalogTierBonuses,
  getCatalogTierDefinitions,
  getCatalogTierProgress,
  getCatalogTierUnlocks,
  getCraftedBoostCounts,
  getCraftedBoosts,
  getCraftingParts,
  getCraftingPartsPerWatch,
  getCraftingRecipes,
  craftBoost,
  canCraftBoost,
  getCraftedBoostIncomeMultiplier,
  getCraftedBoostCollectionMultiplier,
  getCraftedBoostPrestigeMultiplier,
  getWatchItems,
  getWatchModels,
  getUpgrades,
  getInteractionStreakDetail,
  getEvents,
  getMaisonUpgrades,
  getMaisonLines,
  getMaisonPrestigeGain,
  getMaisonPrestigeThresholdCents,
  getEventIncomeMultiplier,
  getAutoBuyEnabled,
  getMaisonReputationGain,
  getNostalgiaUnlockCost,
  getNostalgiaUnlockIds,
  getNostalgiaPrestigeGain,
  getNostalgiaPrestigeThresholdCents,
  getCollectionValueCents,
  getWatchModelOwnedCount,
  getWatchModelPriceCents,
  getWorkshopPrestigeGain,
  getWorkshopPrestigeThresholdCents,
  getWorkshopUpgrades,
  getMilestones,
  isEventActive,
  isItemUnlocked,
  isMaisonRevealReady,
  isWorkshopRevealReady,
} from "./game/state";
import { getCatalogEntryTags } from "./game/catalog";
import type { GameState, InteractionMiniGameMode, WatchItemId } from "./game/state";
import { step } from "./game/sim";

const AUDIO_SETTINGS_KEY = "emily-idle:audio";
const SETTINGS_KEY = "emily-idle:settings";
const NAVIGATION_KEY = "emily-idle:navigation";
type TabActivationSource = "user" | "deep-link" | "system";

type NavigationState = {
  lastTabId: TabId;
};

type PurchaseMeta = {
  prestigeTier?: PrestigeEvent["tier"];
};

type InteractionKind = "winding" | "automatic" | "quartz";

type AudioSettings = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
};

type ThemeMode = "system" | "light" | "dark";
const HIDEABLE_TAB_IDS: TabId[] = ["career", "catalog", "workshop", "maison", "stats"];

type NotificationPreferences = {
  sessionsReady: boolean;
  prestigeReady: boolean;
  achievements: boolean;
  events: boolean;
};

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  hiddenTabs: TabId[];
  coachmarksDismissed: Record<string, boolean>;
  confirmNostalgiaUnlocks: boolean;
  notificationPreferences: NotificationPreferences;
};

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  sfxEnabled: false,
  bgmEnabled: false,
};

const DEFAULT_SETTINGS: Settings = {
  themeMode: "system",
  hideCompletedAchievements: false,
  hiddenTabs: [],
  coachmarksDismissed: {},
  confirmNostalgiaUnlocks: true,
  notificationPreferences: {
    sessionsReady: true,
    prestigeReady: true,
    achievements: true,
    events: true,
  },
};

const loadNavigationState = (): NavigationState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(NAVIGATION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const lastTabId = (parsed as NavigationState).lastTabId;
    if (typeof lastTabId !== "string") {
      return null;
    }

    const resolvedTabId = resolveTabAlias(lastTabId);
    if (!resolvedTabId) {
      return null;
    }

    return { lastTabId: resolvedTabId };
  } catch {
    return null;
  }
};

const loadAudioSettings = (): AudioSettings => {
  if (typeof window === "undefined") {
    return DEFAULT_AUDIO_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_AUDIO_SETTINGS;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_AUDIO_SETTINGS;
    }

    const sfxEnabled = typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : false;
    const bgmEnabled = typeof parsed.bgmEnabled === "boolean" ? parsed.bgmEnabled : false;

    return { sfxEnabled, bgmEnabled };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
};

const loadSettings = (): Settings => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_SETTINGS;
    }

    const themeMode: ThemeMode =
      parsed.themeMode === "light" || parsed.themeMode === "dark" || parsed.themeMode === "system"
        ? parsed.themeMode
        : "system";
    const hideCompletedAchievements =
      typeof parsed.hideCompletedAchievements === "boolean"
        ? parsed.hideCompletedAchievements
        : false;
    const hiddenTabsRaw: unknown[] = Array.isArray(parsed.hiddenTabs) ? parsed.hiddenTabs : [];
    const hiddenTabs = hiddenTabsRaw.reduce((acc: TabId[], value: unknown) => {
      if (typeof value !== "string") {
        return acc;
      }

      const isHideable = HIDEABLE_TAB_IDS.includes(value as TabId);
      if (isHideable && !acc.includes(value as TabId)) {
        acc.push(value as TabId);
      }

      return acc;
    }, []);
    const coachmarksDismissedBase =
      parsed.coachmarksDismissed && typeof parsed.coachmarksDismissed === "object"
        ? parsed.coachmarksDismissed
        : {};
    const coachmarksDismissed = Object.entries(coachmarksDismissedBase).reduce<
      Record<string, boolean>
    >((acc, [key, value]) => {
      if (typeof value === "boolean") {
        acc[key] = value;
      }
      return acc;
    }, {});
    const confirmNostalgiaUnlocks =
      typeof parsed.confirmNostalgiaUnlocks === "boolean" ? parsed.confirmNostalgiaUnlocks : true;
    const notificationPreferencesRaw =
      parsed.notificationPreferences && typeof parsed.notificationPreferences === "object"
        ? parsed.notificationPreferences
        : {};
    const notificationPreferences: NotificationPreferences = {
      sessionsReady:
        typeof notificationPreferencesRaw.sessionsReady === "boolean"
          ? notificationPreferencesRaw.sessionsReady
          : DEFAULT_SETTINGS.notificationPreferences.sessionsReady,
      prestigeReady:
        typeof notificationPreferencesRaw.prestigeReady === "boolean"
          ? notificationPreferencesRaw.prestigeReady
          : DEFAULT_SETTINGS.notificationPreferences.prestigeReady,
      achievements:
        typeof notificationPreferencesRaw.achievements === "boolean"
          ? notificationPreferencesRaw.achievements
          : DEFAULT_SETTINGS.notificationPreferences.achievements,
      events:
        typeof notificationPreferencesRaw.events === "boolean"
          ? notificationPreferencesRaw.events
          : DEFAULT_SETTINGS.notificationPreferences.events,
    };

    return {
      themeMode,
      hideCompletedAchievements,
      hiddenTabs,
      coachmarksDismissed,
      confirmNostalgiaUnlocks,
      notificationPreferences,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export default function App() {
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

  const [saveStatus, setSaveStatus] = useState("");
  const [importText, setImportText] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogBrand, setCatalogBrand] = useState("All");
  const [catalogStyle, setCatalogStyle] = useState<"all" | "womens">("all");
  const [catalogSort, setCatalogSort] = useState<"default" | "brand" | "year" | "tier">("default");
  const [catalogEra, setCatalogEra] = useState<
    "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown"
  >("all");
  const [catalogType, setCatalogType] = useState<"all" | "gmt" | "chronograph" | "dress" | "diver">(
    "all",
  );
  const [catalogTab, setCatalogTab] = useState<"unowned" | "owned">("unowned");
  const [workshopResetArmed, setWorkshopResetArmed] = useState(false);
  const [maisonResetArmed, setMaisonResetArmed] = useState(false);
  const [nostalgiaModalOpen, setNostalgiaModalOpen] = useState(false);
  const [nostalgiaResultsDismissed, setNostalgiaResultsDismissed] = useState(false);
  const [nostalgiaUnlockPending, setNostalgiaUnlockPending] = useState<WatchItemId | null>(null);
  const [prestigeOnboarding, setPrestigeOnboarding] = useState<PrestigeEvent | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpSectionId, setHelpSectionId] = useState<string | null>(null);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const tabSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerTabSwitch = useCallback(() => {
    setIsTabSwitching(true);
    if (tabSwitchTimerRef.current) {
      clearTimeout(tabSwitchTimerRef.current);
    }
    tabSwitchTimerRef.current = setTimeout(() => {
      setIsTabSwitching(false);
      tabSwitchTimerRef.current = null;
    }, 260);
  }, []);

  useEffect(() => {
    return () => {
      if (tabSwitchTimerRef.current) {
        clearTimeout(tabSwitchTimerRef.current);
      }
    };
  }, []);

  const [autoBuyToggle, setAutoBuyToggle] = useState(true);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => loadAudioSettings());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [devSettings, setDevSettings] = useState(() => ({
    enabled: false,
    speedMultiplier: 1,
  }));
  const [coachmarksDismissed, setCoachmarksDismissed] = useState<Record<string, boolean>>(
    () => settings.coachmarksDismissed,
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pushToast = useCallback((toast: ToastMessage) => {
    setToasts((current) => {
      const next = current.filter((item) => item.id !== toast.id);
      next.unshift(toast);
      return next.slice(0, 3);
    });

    const existingTimer = toastTimers.current.get(toast.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
      toastTimers.current.delete(toast.id);
    }, 6000);

    toastTimers.current.set(toast.id, timer);
  }, []);

  const handleOfflineProgress = useCallback(
    (info: OfflineProgressInfo) => {
      if (info.appliedMs <= 0) {
        return;
      }

      const elapsedLabel = formatDurationFromMs(info.elapsedMs);
      const appliedLabel = formatDurationFromMs(info.appliedMs);
      const currencyLabel = `${info.gainedCurrencyCents >= 0 ? "+" : ""}${formatMoneyFromCents(
        info.gainedCurrencyCents,
      )}`;
      const enjoymentSign = info.gainedEnjoymentCents >= 0 ? "+" : "";
      const enjoymentLabel = `${enjoymentSign}${Math.round(info.gainedEnjoymentCents).toLocaleString()} enjoyment`;

      pushToast({
        id: `offline-${Date.now()}`,
        title: "Offline progress",
        message: `Away for ${elapsedLabel} (applied ${appliedLabel}).`,
        detail: `${currencyLabel} cash · ${enjoymentLabel}`,
      });
    },
    [pushToast],
  );
  const handlePersistError = useCallback((message: string) => {
    setSaveStatus(message);
  }, []);

  const { state, setState, persistNow, markSaveDirty, resetSimulationClock } = useGameRuntime({
    initialState: createInitialState,
    step,
    loadSave: loadSaveFromLocalStorage,
    clearSave: clearLocalStorageSave,
    persistSave: persistSaveToLocalStorage,
    devSettings,
    onPersistError: handlePersistError,
    onOfflineProgress: handleOfflineProgress,
  });
  const lastNostalgiaToastRef = useRef(state.nostalgiaLastGain);
  const notificationsInitializedRef = useRef(false);
  const previousAchievementUnlocksRef = useRef<Set<string>>(new Set());
  const previousSessionReadyRef = useRef(false);
  const previousPrestigeReadyRef = useRef({
    workshop: false,
    maison: false,
    nostalgia: false,
  });
  const previousEventActiveRef = useRef<Record<string, boolean>>({});

  const persistSettings = (nextSettings: Settings) => {
    setSettings(nextSettings);
    setCoachmarksDismissed(nextSettings.coachmarksDismissed);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  };

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
      toastTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      toastTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    if (state.nostalgiaLastGain > 0 && lastNostalgiaToastRef.current !== state.nostalgiaLastGain) {
      lastNostalgiaToastRef.current = state.nostalgiaLastGain;
      pushToast({
        id: `nostalgia-${state.nostalgiaLastGain}-${Date.now()}`,
        title: "Nostalgia prestige",
        message: `+${state.nostalgiaLastGain.toLocaleString()} Nostalgia`,
        detail: `Resets ${state.nostalgiaResets} · Total ${state.nostalgiaPoints.toLocaleString()} Nostalgia`,
      });
      return;
    }

    if (state.nostalgiaLastGain === 0) {
      lastNostalgiaToastRef.current = 0;
    }
  }, [pushToast, state.nostalgiaLastGain, state.nostalgiaPoints, state.nostalgiaResets]);

  const handleDismissWindingTapHint = () => {
    if (settings.coachmarksDismissed["winding:tap-hint"]) {
      return;
    }

    persistSettings({
      ...settings,
      coachmarksDismissed: {
        ...settings.coachmarksDismissed,
        "winding:tap-hint": true,
      },
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const enabled = params.has("dev");
    setDevSettings((current) => ({
      ...current,
      enabled,
    }));
  }, []);

  const tabs = useMemo(() => TAB_DEFINITIONS, []);
  const [activeTab, setActiveTab] = useState<TabId>("collection");
  const [focusedTab, setFocusedTab] = useState<TabId>("collection");
  const [hasResolvedInitialTab, setHasResolvedInitialTab] = useState(false);
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());
  const handleTabRef = useCallback((tabId: TabId, node: HTMLButtonElement | null) => {
    if (!node) {
      tabRefs.current.delete(tabId);
      return;
    }

    tabRefs.current.set(tabId, node);
  }, []);
  const handleTabFocus = useCallback((tabId: TabId) => {
    if (isTestEnvironment()) {
      return;
    }

    setFocusedTab(tabId);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", settings.themeMode);
  }, [settings.themeMode]);

  const focusTabById = (tabId: TabId) => {
    tabRefs.current.get(tabId)?.focus();
  };

  const moveTabFocus = (direction: -1 | 1) => {
    if (visibleTabs.length === 0) {
      return;
    }

    const currentIndex = visibleTabs.findIndex((tab) => tab.id === focusedTab);
    const nextIndex = (currentIndex + direction + visibleTabs.length) % visibleTabs.length;
    const nextId = visibleTabs[nextIndex].id;
    setFocusedTab(nextId);
    focusTabById(nextId);
  };

  const focusEdgeTab = (edge: "first" | "last") => {
    if (visibleTabs.length === 0) {
      return;
    }

    const nextId = edge === "first" ? visibleTabs[0].id : visibleTabs[visibleTabs.length - 1].id;
    setFocusedTab(nextId);
    focusTabById(nextId);
  };

  const activateTab = useCallback(
    (tabId: TabId, source: TabActivationSource = "system") => {
      setActiveTab(tabId);
      setFocusedTab(tabId);
      triggerTabSwitch();

      if (source !== "user" || typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(NAVIGATION_KEY, JSON.stringify({ lastTabId: tabId }));
    },
    [triggerTabSwitch],
  );

  const navigateTo = (tabId: TabId, scrollTargetId?: string) => {
    activateTab(tabId, "system");

    if (!scrollTargetId || typeof document === "undefined") {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(scrollTargetId);
        if (!target) {
          return;
        }

        if (scrollTargetId === "catalog-shop") {
          const buyButton = target.querySelector('[data-testid^="catalog-buy-"]');
          if (buyButton instanceof HTMLElement) {
            buyButton.scrollIntoView({ block: "start", behavior: "auto" });
            return;
          }
        }

        target.scrollIntoView({ block: "start", behavior: "auto" });
      });
    });
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (visibleTabs.length === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault();
        moveTabFocus(-1);
        return;
      }
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault();
        moveTabFocus(1);
        return;
      }
      case "Home": {
        event.preventDefault();
        focusEdgeTab("first");
        return;
      }
      case "End": {
        event.preventDefault();
        focusEdgeTab("last");
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        activateTab(focusedTab, "user");
        return;
      }
      default:
        return;
    }
  };

  const handlePurchase = (nextState: GameState, meta?: PurchaseMeta) => {
    if (nextState !== state) {
      const nowMs = Date.now();
      const prestigeEvent = detectPrestigeEvent(state, nextState, nowMs, meta?.prestigeTier);
      if (prestigeEvent) {
        setPrestigeOnboarding(prestigeEvent);
      }

      setState(nextState);
      markSaveDirty();
      persistNow("purchase", nextState);
    }
  };

  const handleToggleAutoBuy = () => {
    setAutoBuyToggle((value) => !value);
  };

  const handleInteract = (itemId: WatchItemId) => {
    const item = getWatchItems().find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    if (item.movement === "manual") {
      setActiveInteraction({ kind: "winding", itemId });
      return;
    }

    if (item.movement === "automatic") {
      setActiveInteraction({ kind: "automatic", itemId });
      return;
    }

    if (item.movement === "quartz") {
      setActiveInteraction({ kind: "quartz", itemId });
    }
  };

  const handleInteractionModeChange = useCallback(
    (kind: InteractionKind, mode: InteractionMiniGameMode) => {
      setInteractionModes((current) => {
        if (current[kind] === mode) {
          return current;
        }
        return { ...current, [kind]: mode };
      });
    },
    [],
  );

  const handleCraftBoost = (boostId: (typeof craftedBoosts)[number]["id"]) => {
    handlePurchase(craftBoost(state, boostId));
  };

  const handleUpdateAudioSettings = (nextSettings: AudioSettings) => {
    setAudioSettings(nextSettings);
    window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(nextSettings));
  };

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
    setHelpSectionId(nextId);
    setHelpOpen(true);
  };

  const handleHelpKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Tab" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (visibleTabs.length === 0) {
      return;
    }

    const preferredTabId = visibleTabs.find((tab) => tab.id === "collection")?.id;
    const nextTabId = preferredTabId ?? visibleTabs[0].id;
    const nextTab = tabRefs.current.get(nextTabId);
    if (nextTab) {
      nextTab.focus();
    }
    setFocusedTab(nextTabId);
  };

  const handleSelectHelpSection = (nextId: string) => {
    setHelpSectionId(nextId);
    persistHelpState({ lastSectionId: nextId });
  };

  const openHelpTo = (sectionId: string) => {
    const nextId = resolveHelpSectionId(sectionId);
    setHelpSectionId(nextId);
    if (nextId) {
      persistHelpState({ lastSectionId: nextId });
    }
    setHelpOpen(true);
  };

  const handleExport = async () => {
    const saveString = encodeSaveString(state, Date.now());
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
  };

  const applyImportedSave = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setSaveStatus("Paste an exported save string to import.");
      return;
    }

    const decoded = decodeSaveString(trimmed);
    if (!decoded.ok) {
      console.warn(`Import failed. ${decoded.error}`);
      setSaveStatus(`Import failed: ${decoded.error}`);
      return;
    }

    setState(decoded.save.state);
    resetSimulationClock();
    markSaveDirty();
    persistNow("import", decoded.save.state);
    const migrationLabel =
      decoded.migratedFromVersion !== undefined
        ? ` (migrated from v${decoded.migratedFromVersion})`
        : "";
    setSaveStatus(`Imported save from ${decoded.save.savedAt}${migrationLabel}.`);
  };

  const handleImport = () => {
    applyImportedSave(importText);
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) {
      setSaveStatus("Select a file to import.");
      return;
    }

    try {
      const raw = await file.text();
      applyImportedSave(raw);
    } catch (error) {
      console.error("Failed to read save file", error);
      setSaveStatus("Unable to read the selected file. Please try again.");
    }
  };

  const handleClearSave = () => {
    if (typeof window === "undefined") {
      return;
    }

    clearLocalStorageSave();
    window.localStorage.removeItem(NAVIGATION_KEY);

    const fresh = createInitialState();
    setState(fresh);
    resetSimulationClock();
    persistNow("clear-save", fresh);

    setImportText("");
    setSaveStatus("Cleared save. Starting fresh.");

    setActiveTab("career");
    setFocusedTab("career");
    focusTabById("career");
    window.localStorage.setItem(NAVIGATION_KEY, JSON.stringify({ lastTabId: "career" }));
  };

  const stats = useMemo(() => {
    const nowMs = Date.now();
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
  }, [state]);

  const watchItems = useMemo(() => getWatchItems(), []);
  const watchModelDefaults = useMemo(() => {
    const defaults = new Map<WatchItemId, string>();
    for (const model of getWatchModels()) {
      if (!defaults.has(model.tierId)) {
        defaults.set(model.tierId, model.id);
      }
    }
    return defaults;
  }, []);
  const watchItemsById = useMemo(
    () => new Map(watchItems.map((item) => [item.id, item])),
    [watchItems],
  );
  const watchItemLabels = useMemo(
    () => new Map(watchItems.map((item) => [item.id, item.name])),
    [watchItems],
  );
  const nostalgiaUnlockIds = useMemo(() => getNostalgiaUnlockIds(), []);
  const milestones = useMemo(() => getMilestones(), []);
  const upgrades = useMemo(() => getUpgrades(), []);
  const achievements = useMemo(() => getAchievements(), []);
  const achievementById = useMemo(
    () => new Map(achievements.map((achievement) => [achievement.id, achievement])),
    [achievements],
  );
  const events = useMemo(() => getEvents(), []);
  const workshopUpgrades = useMemo(() => getWorkshopUpgrades(), []);
  const maisonUpgrades = useMemo(() => getMaisonUpgrades(), []);
  const catalogEntries = useMemo(() => getCatalogEntries(), []);
  const discoveredCatalogIds = useMemo(() => getCatalogDiscovery(state), [state]);
  const workshopPrestigeGain = useMemo(() => getWorkshopPrestigeGain(state), [state]);
  const maisonPrestigeGain = useMemo(() => getMaisonPrestigeGain(state), [state]);
  const nostalgiaPrestigeGain = useMemo(() => getNostalgiaPrestigeGain(state), [state]);
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
  const showNostalgiaSection = showNostalgiaPanel || showNostalgiaTeaser;
  const workshopRevealProgress = Math.min(
    1,
    state.enjoymentCents / getWorkshopPrestigeThresholdCents(),
  );
  const maisonRevealProgress = Math.min(
    1,
    state.enjoymentCents / getMaisonPrestigeThresholdCents(),
  );
  const nowMs = Date.now();
  const currentEventMultiplier = useMemo(
    () => getEventIncomeMultiplier(state, nowMs),
    [state, nowMs],
  );
  const interactionStreak = useMemo(() => getInteractionStreakDetail(state), [state]);
  const systemStats = {
    atelierResets: state.workshopPrestigeCount,
    maisonHeritage: state.maisonHeritage,
    maisonReputation: state.maisonReputation,
    eventMultiplier: currentEventMultiplier,
  };
  const tabReadiness = useMemo(() => getTabReadiness(state, nowMs), [state, nowMs]);
  const catalogBrands = useMemo(() => {
    return ["All", ...new Set(catalogEntries.map((entry) => entry.brand))];
  }, [catalogEntries]);
  const statsVisibilityRatio = useMemo(
    () => getAchievementProgressRatio(state, "first-drawer"),
    [state],
  );
  const tabVisibility = useMemo(
    () => ({
      collection: true,
      career: true,
      upgrades: true,
      save: true,
      nostalgia: showNostalgiaSection,
      catalog: true,
      stats: statsVisibilityRatio >= 0.8,
      workshop: showWorkshopSection,
      maison: showMaisonSection,
    }),
    [statsVisibilityRatio, showWorkshopSection, showMaisonSection, showNostalgiaSection],
  );
  const hiddenTabsSet = useMemo(() => new Set(settings.hiddenTabs), [settings.hiddenTabs]);
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

  useEffect(() => {
    const sessionReady = canPerformTherapistSession(state, nowMs);
    const prestigeReady = {
      workshop: canPrestigeWorkshop,
      maison: canPrestigeMaison,
      nostalgia: canPrestigeNostalgia,
    };
    const achievementUnlocks = new Set(state.achievementUnlocks);
    const eventActiveMap = events.reduce<Record<string, boolean>>((acc, event) => {
      acc[event.id] = isEventActive(state, event.id, nowMs);
      return acc;
    }, {});

    if (!notificationsInitializedRef.current) {
      notificationsInitializedRef.current = true;
      previousAchievementUnlocksRef.current = achievementUnlocks;
      previousSessionReadyRef.current = sessionReady;
      previousPrestigeReadyRef.current = prestigeReady;
      previousEventActiveRef.current = eventActiveMap;
      return;
    }

    const preferences = settings.notificationPreferences;

    if (preferences.achievements) {
      for (const achievementId of achievementUnlocks) {
        if (previousAchievementUnlocksRef.current.has(achievementId)) {
          continue;
        }
        const achievement = achievementById.get(achievementId);
        if (!achievement) {
          continue;
        }

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

    if (preferences.events) {
      for (const event of events) {
        const wasActive = previousEventActiveRef.current[event.id] ?? false;
        const isActiveNow = eventActiveMap[event.id] ?? false;

        if (!wasActive && isActiveNow) {
          pushToast({
            id: `event-start-${event.id}-${state.eventStates[event.id]?.activeUntilMs ?? nowMs}`,
            title: "Event started",
            message: event.name,
            detail: `Income x${event.incomeMultiplier.toFixed(2)} while active.`,
          });
          continue;
        }

        if (wasActive && !isActiveNow) {
          pushToast({
            id: `event-end-${event.id}-${nowMs}`,
            title: "Event ended",
            message: event.name,
            detail: "Event bonus expired.",
          });
        }
      }
    }

    previousAchievementUnlocksRef.current = achievementUnlocks;
    previousSessionReadyRef.current = sessionReady;
    previousPrestigeReadyRef.current = prestigeReady;
    previousEventActiveRef.current = eventActiveMap;
  }, [
    achievementById,
    canPrestigeMaison,
    canPrestigeNostalgia,
    canPrestigeWorkshop,
    events,
    nowMs,
    pushToast,
    settings.notificationPreferences,
    state,
  ]);

  const resolveInitialTabSelection = useCallback((): {
    tabId: TabId;
    source: TabActivationSource;
  } => {
    const isVisible = (tabId: TabId) => combinedTabVisibility[tabId];

    if (typeof window === "undefined") {
      return { tabId: "collection", source: "system" };
    }

    const navigationState = loadNavigationState();
    const hasSave = window.localStorage.getItem("emily-idle:save") !== null;

    const { tabId, source } = resolveLandingTab({
      search: window.location.search,
      hasSave,
      navigationState,
      isVisible,
    });

    return { tabId, source };
  }, [combinedTabVisibility]);

  useLayoutEffect(() => {
    if (hasResolvedInitialTab) {
      return;
    }

    const { tabId, source } = resolveInitialTabSelection();
    activateTab(tabId, source);
    setHasResolvedInitialTab(true);
  }, [activateTab, hasResolvedInitialTab, resolveInitialTabSelection]);

  useEffect(() => {
    if (combinedTabVisibility[activeTab]) {
      return;
    }

    if (activeTab !== "collection") {
      activateTab("collection", "system");
    }
  }, [activeTab, activateTab, combinedTabVisibility]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const match = /^Digit([1-8])$/.exec(event.code);
      if (!match) {
        return;
      }

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

      if (helpOpen || nostalgiaModalOpen || activeInteraction || prestigeOnboarding) {
        return;
      }

      const index = Number(match[1]) - 1;
      const nextTab = visibleTabs[index];
      if (!nextTab) {
        return;
      }

      event.preventDefault();
      activateTab(nextTab.id, "user");
    };

    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, [
    activateTab,
    visibleTabs,
    helpOpen,
    nostalgiaModalOpen,
    activeInteraction,
    prestigeOnboarding,
  ]);

  const visibleTabOptions = useMemo(
    () => tabs.filter((tab) => HIDEABLE_TAB_IDS.includes(tab.id) && tabVisibility[tab.id]),
    [tabs, tabVisibility],
  );
  const coachmarks = useMemo(
    () => [
      {
        id: "vault-basics",
        title: "Collection basics",
        text: "Start in Career to begin earning cash, then buy watches in Catalog for enjoyment and memories. Interact to trigger special moments.",
      },
      {
        id: "catalog-archive",
        title: "Catalog archive",
        text: "Track discovered references to unlock tier bonuses and archive upgrades.",
      },
      {
        id: "atelier-reset",
        title: "Atelier reset",
        text: "Prestige the atelier to convert enjoyment into blueprints.",
      },
      {
        id: "maison-legacy",
        title: "Maison legacy",
        text: "Prestige further to earn Heritage and Reputation, powering long-term boosts.",
      },
      {
        id: "set-bonuses",
        title: "Set bonuses",
        text: "Complete sets to stack permanent income multipliers.",
      },
      {
        id: "crafting-workshop",
        title: "Crafting workshop",
        text: "Dismantle watches into parts, then craft permanent boosts.",
      },
    ],
    [],
  );
  const activeCoachmarks = coachmarks.filter((mark) => !coachmarksDismissed[mark.id]);
  const hasOwnedCatalogTiers = Object.values(state.watchModels).some((count) => count > 0);
  const archiveCuratorMilestone = milestones.find(
    (milestone) => milestone.id === "archive-curator",
  );
  const archiveCuratorThreshold =
    archiveCuratorMilestone?.requirement.type === "catalogDiscovery"
      ? archiveCuratorMilestone.requirement.threshold
      : 0;
  const archiveCuratorProgress = Math.min(discoveredCatalogIds.length, archiveCuratorThreshold);
  const archiveCuratorUnlocked = state.unlockedMilestones.includes("archive-curator");

  const filteredCatalogEntries = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const filteredByOwnership = catalogEntries.filter((entry) => {
      if (catalogTab !== "owned") {
        return true;
      }

      return getWatchModelOwnedCount(state, entry.id) > 0;
    });

    const filteredByFilters = filteredByOwnership.filter((entry) => {
      const matchesBrand = catalogBrand === "All" || entry.brand === catalogBrand;
      const entryTags = getCatalogEntryTags(entry);
      const matchesStyle = catalogStyle === "all" || entryTags.includes("womens");

      const year = entry.year === "Unknown" ? null : Number(entry.year);
      const matchesEra = (() => {
        if (catalogEra === "all") {
          return true;
        }
        if (catalogEra === "unknown") {
          return year === null;
        }
        if (year === null) {
          return false;
        }
        if (catalogEra === "pre-1970") {
          return year < 1970;
        }
        if (catalogEra === "1970-1999") {
          return year >= 1970 && year <= 1999;
        }
        return year >= 2000;
      })();

      const matchesType =
        catalogType === "all" || entryTags.some((tag) => tag.toLowerCase() === catalogType);

      const tags = entryTags.join(" ");
      const matchesQuery =
        query.length === 0 ||
        `${entry.brand} ${entry.model} ${entry.description} ${entry.year} ${tags}`
          .toLowerCase()
          .includes(query);

      return matchesBrand && matchesStyle && matchesEra && matchesType && matchesQuery;
    });

    const sortByTierRank = (entry: (typeof catalogEntries)[number]) => {
      const tags = getCatalogEntryTags(entry);
      if (tags.includes("starter")) {
        return 0;
      }
      if (tags.includes("classic")) {
        return 1;
      }
      if (tags.includes("chronograph")) {
        return 2;
      }
      if (tags.includes("tourbillon")) {
        return 3;
      }
      return 999;
    };

    const sorted = (() => {
      if (catalogSort === "default") {
        const pricedEntries = filteredByFilters.map((entry) => ({
          entry,
          price: getWatchModelPriceCents(state, entry.id),
        }));

        return pricedEntries
          .sort((a, b) => {
            if (a.price !== b.price) {
              return a.price - b.price;
            }

            const brandDelta = a.entry.brand.localeCompare(b.entry.brand);
            if (brandDelta !== 0) {
              return brandDelta;
            }

            return a.entry.model.localeCompare(b.entry.model);
          })
          .map(({ entry }) => entry);
      }

      const copy = filteredByFilters.slice();

      if (catalogSort === "brand") {
        return copy.sort((a, b) => a.brand.localeCompare(b.brand));
      }

      if (catalogSort === "year") {
        return copy.sort((a, b) => {
          const ay = a.year === "Unknown" ? null : Number(a.year);
          const by = b.year === "Unknown" ? null : Number(b.year);

          if (ay === null && by === null) {
            return 0;
          }
          if (ay === null) {
            return 1;
          }
          if (by === null) {
            return -1;
          }

          return by - ay;
        });
      }

      return copy.sort((a, b) => sortByTierRank(a) - sortByTierRank(b));
    })();

    return sorted;
  }, [
    catalogBrand,
    catalogEntries,
    catalogEra,
    catalogSearch,
    catalogSort,
    catalogStyle,
    catalogTab,
    catalogType,
    state,
  ]);

  const discoveredCatalogEntries = useMemo(() => {
    if (discoveredCatalogIds.length === 0) {
      return [];
    }
    const discovered = new Set(discoveredCatalogIds);
    return catalogEntries.filter((entry) => discovered.has(entry.id));
  }, [catalogEntries, discoveredCatalogIds]);

  const autoBuyUnlocked = useMemo(() => getAutoBuyEnabled(state), [state]);
  const autoBuyEnabled = autoBuyUnlocked && autoBuyToggle;
  const maisonLines = useMemo(() => getMaisonLines(), []);
  const maisonReputationGain = useMemo(() => getMaisonReputationGain(state), [state]);
  const catalogTierDefinitions = useMemo(() => getCatalogTierDefinitions(), []);
  const catalogTierProgress = useMemo(() => getCatalogTierProgress(state), [state]);
  const catalogTierUnlocks = useMemo(() => getCatalogTierUnlocks(state), [state]);
  const catalogTierBonuses = useMemo(() => getCatalogTierBonuses(state), [state]);
  const catalogTierBonusMultiplier = useMemo(
    () => catalogTierBonuses.reduce((total, bonus) => total * bonus.incomeMultiplier, 1),
    [catalogTierBonuses],
  );
  const craftingParts = useMemo(() => getCraftingParts(state), [state]);
  const craftingRecipes = useMemo(() => getCraftingRecipes(), []);
  const craftedBoosts = useMemo(() => getCraftedBoosts(), []);
  const craftedBoostCounts = useMemo(() => getCraftedBoostCounts(state), [state]);
  const craftingPartsPerWatch = useMemo(() => getCraftingPartsPerWatch(), []);
  const craftedIncomeMultiplier = useMemo(() => getCraftedBoostIncomeMultiplier(state), [state]);
  const craftedCollectionMultiplier = useMemo(
    () => getCraftedBoostCollectionMultiplier(state),
    [state],
  );
  const craftedPrestigeMultiplier = useMemo(
    () => getCraftedBoostPrestigeMultiplier(state),
    [state],
  );
  const pendingNostalgiaUnlock = nostalgiaUnlockPending
    ? (watchItemsById.get(nostalgiaUnlockPending) ?? null)
    : null;
  const pendingNostalgiaUnlockCost = nostalgiaUnlockPending
    ? getNostalgiaUnlockCost(nostalgiaUnlockPending)
    : 0;

  const showMaisonLines = useMemo(
    () => state.maisonHeritage > 0 || state.maisonReputation > 0 || canPrestigeMaison,
    [state.maisonHeritage, state.maisonReputation, canPrestigeMaison],
  );

  useEffect(() => {
    if (isTestEnvironment()) {
      return;
    }

    if (!autoBuyUnlocked) {
      setAutoBuyToggle(false);
    }
  }, [autoBuyUnlocked]);

  useEffect(() => {
    if (!autoBuyEnabled) {
      return;
    }

    const autoBuyTrigger = state.currencyCents + state.unlockedMilestones.length;
    if (autoBuyTrigger <= 0) {
      return;
    }

    setState((current) => {
      let nextState = current;

      for (const item of watchItems) {
        if (!isItemUnlocked(nextState, item.id)) {
          continue;
        }

        const modelId = watchModelDefaults.get(item.id);
        if (!modelId) {
          continue;
        }

        for (let i = 0; i < 10; i += 1) {
          const candidateState = buyWatchModel(nextState, modelId);
          if (candidateState === nextState) {
            break;
          }
          nextState = candidateState;
        }
      }

      if (nextState !== current) {
        markSaveDirty();
      }
      return nextState;
    });
  }, [
    autoBuyEnabled,
    markSaveDirty,
    setState,
    state.currencyCents,
    state.unlockedMilestones,
    watchItems,
    watchModelDefaults,
  ]);

  useEffect(() => {
    if (state.nostalgiaLastGain > 0) {
      setNostalgiaResultsDismissed(false);
    }
  }, [state.nostalgiaLastGain]);

  const renderCraftingRecipes = (testId: string) => (
    <div className="card-stack" data-testid={testId}>
      {craftingRecipes.map((recipe) => {
        const owned = craftedBoostCounts[recipe.id] ?? 0;
        const canCraft = canCraftBoost(state, recipe.id);
        return (
          <div className="card" key={recipe.id}>
            <div className="card-header">
              <div>
                <h4>{recipe.name}</h4>
                <p>{recipe.description}</p>
              </div>
              <div>{owned} crafted</div>
            </div>
            <p>Cost: {recipe.partsCost} parts</p>
            <div className="card-actions">
              <button
                type="button"
                className="secondary"
                disabled={!canCraft}
                onClick={() => handleCraftBoost(recipe.id)}
              >
                Craft
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCraftingBoosts = (testId: string) => (
    <div className="card-stack" data-testid={testId}>
      {craftedBoosts.map((boost) => (
        <div className="card" key={boost.id}>
          <h4>{boost.name}</h4>
          <p>{boost.description}</p>
          <p className="muted">
            {boost.id === "polished-tools" && `Income x${craftedIncomeMultiplier.toFixed(2)}`}
            {boost.id === "heritage-springs" &&
              `Collection x${craftedCollectionMultiplier.toFixed(2)}`}
            {boost.id === "artisan-jig" && `Prestige x${craftedPrestigeMultiplier.toFixed(2)}`}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <HelpProvider value={{ openHelpTo }}>
      <div id="app-shell">
        <main className="container">
          <header className="hero">
            <div>
              <p className="eyebrow">Collection loop</p>
              <h1>Emily Idle</h1>
              <p className="muted">Build your collection, unlock new lines, and stack bonuses.</p>
              <nav className="page-nav" aria-label="Primary navigation">
                <div className="page-tab-rail__wrapper">
                  <PageTabRail
                    tabs={visibleTabs}
                    activeTabId={activeTab}
                    focusedTabId={focusedTab}
                    onTabClick={(tabId) => activateTab(tabId, "user")}
                    onTabFocus={handleTabFocus}
                    onTabKeyDown={handleTabKeyDown}
                    onTabRef={handleTabRef}
                    tabReadiness={tabReadiness}
                  />
                  <TabSwitchSkeleton visible={isTabSwitching} />
                </div>
                <button
                  type="button"
                  className="help-open-button"
                  aria-label="Open help"
                  data-testid="help-open"
                  onClick={handleOpenHelp}
                  onKeyDown={handleHelpKeyDown}
                >
                  <HelpIcon size={18} />
                </button>
              </nav>
            </div>
            <StatsHeader stats={stats} systemStats={systemStats} />
          </header>

          <CollectionTab
            isActive={activeTab === "collection"}
            state={state}
            onNavigate={navigateTo}
            watchItemLabels={watchItemLabels}
            autoBuyUnlocked={autoBuyUnlocked}
            autoBuyEnabled={autoBuyEnabled}
            onToggleAutoBuy={handleToggleAutoBuy}
            catalogTierUnlocks={catalogTierUnlocks}
            catalogTierDefinitions={catalogTierDefinitions}
            catalogTierProgress={catalogTierProgress}
            catalogTierBonuses={catalogTierBonuses}
            catalogTierBonusMultiplier={catalogTierBonusMultiplier}
            archiveCuratorMilestone={archiveCuratorMilestone}
            archiveCuratorProgress={archiveCuratorProgress}
            archiveCuratorThreshold={archiveCuratorThreshold}
            archiveCuratorUnlocked={archiveCuratorUnlocked}
            showMaisonLines={showMaisonLines}
            maisonLines={maisonLines}
            craftingParts={craftingParts}
            renderCraftingRecipes={renderCraftingRecipes}
            renderCraftingBoosts={renderCraftingBoosts}
            activeCoachmarks={activeCoachmarks}
            settings={settings}
            persistSettings={persistSettings}
            milestones={milestones}
            achievements={achievements}
            events={events}
            currentEventMultiplier={currentEventMultiplier}
            nowMs={nowMs}
            onPurchase={handlePurchase}
          />

          <CatalogTab
            isActive={activeTab === "catalog"}
            state={state}
            onNavigate={navigateTo}
            catalogSearch={catalogSearch}
            onCatalogSearchChange={setCatalogSearch}
            catalogBrand={catalogBrand}
            onCatalogBrandChange={setCatalogBrand}
            catalogStyle={catalogStyle}
            onCatalogStyleChange={setCatalogStyle}
            catalogSort={catalogSort}
            onCatalogSortChange={setCatalogSort}
            catalogEra={catalogEra}
            onCatalogEraChange={setCatalogEra}
            catalogType={catalogType}
            onCatalogTypeChange={setCatalogType}
            catalogTab={catalogTab}
            onCatalogTabChange={setCatalogTab}
            catalogBrands={catalogBrands}
            filteredCatalogEntries={filteredCatalogEntries}
            discoveredCatalogEntries={discoveredCatalogEntries}
            discoveredCatalogIds={discoveredCatalogIds}
            catalogEntries={catalogEntries}
            hasOwnedCatalogTiers={hasOwnedCatalogTiers}
            onPurchase={handlePurchase}
            nowMs={nowMs}
            currentEventMultiplier={currentEventMultiplier}
            onInteract={handleInteract}
            atelierUnlocked={showWorkshopPanel}
          />

          <CareerTab
            isActive={activeTab === "career"}
            state={state}
            nowMs={nowMs}
            onNavigate={navigateTo}
            onPurchase={handlePurchase}
          />

          <UpgradesTab
            isActive={activeTab === "upgrades"}
            state={state}
            currentEventMultiplier={currentEventMultiplier}
            nowMs={nowMs}
            upgrades={upgrades}
            workshopUpgrades={workshopUpgrades}
            maisonUpgrades={maisonUpgrades}
            onPurchase={handlePurchase}
          />

          <WorkshopTab
            isActive={activeTab === "workshop"}
            state={state}
            showWorkshopSection={showWorkshopSection}
            showWorkshopPanel={showWorkshopPanel}
            onNavigate={navigateTo}
            workshopPrestigeGain={workshopPrestigeGain}
            workshopRevealProgress={workshopRevealProgress}
            workshopResetArmed={workshopResetArmed}
            onToggleWorkshopResetArmed={(next) => setWorkshopResetArmed(next)}
            canPrestigeWorkshop={canPrestigeWorkshop}
            onPurchase={handlePurchase}
            workshopUpgrades={workshopUpgrades}
            craftingParts={craftingParts}
            watchItems={watchItems}
            craftingPartsPerWatch={craftingPartsPerWatch}
            renderCraftingRecipes={renderCraftingRecipes}
            renderCraftingBoosts={renderCraftingBoosts}
          />

          <MaisonTab
            isActive={activeTab === "maison"}
            state={state}
            showMaisonSection={showMaisonSection}
            showMaisonPanel={showMaisonPanel}
            onNavigate={navigateTo}
            maisonPrestigeGain={maisonPrestigeGain}
            maisonReputationGain={maisonReputationGain}
            maisonRevealProgress={maisonRevealProgress}
            maisonResetArmed={maisonResetArmed}
            onToggleMaisonResetArmed={(next) => setMaisonResetArmed(next)}
            canPrestigeMaison={canPrestigeMaison}
            onPurchase={handlePurchase}
            maisonUpgrades={maisonUpgrades}
          />

          <NostalgiaTab
            isActive={activeTab === "nostalgia"}
            state={state}
            showNostalgiaSection={showNostalgiaSection}
            showNostalgiaPanel={showNostalgiaPanel}
            onNavigate={navigateTo}
            nostalgiaResultsDismissed={nostalgiaResultsDismissed}
            onDismissResults={() => setNostalgiaResultsDismissed(true)}
            nostalgiaProgress={nostalgiaProgress}
            nostalgiaEarned={nostalgiaEarned}
            nostalgiaPrestigeThreshold={nostalgiaPrestigeThreshold}
            nostalgiaPrestigeGain={nostalgiaPrestigeGain}
            canPrestigeNostalgia={canPrestigeNostalgia}
            nostalgiaUnlockIds={nostalgiaUnlockIds}
            watchItemsById={watchItemsById}
            nostalgiaModalOpen={nostalgiaModalOpen}
            onToggleNostalgiaModal={(open) => setNostalgiaModalOpen(open)}
            nostalgiaUnlockPending={nostalgiaUnlockPending}
            pendingNostalgiaUnlock={pendingNostalgiaUnlock}
            pendingNostalgiaUnlockCost={pendingNostalgiaUnlockCost}
            onSetNostalgiaUnlockPending={(next) => setNostalgiaUnlockPending(next)}
            settings={settings}
            persistSettings={persistSettings}
            onPurchase={handlePurchase}
          />

          <StatsTab
            isActive={activeTab === "stats"}
            state={state}
            stats={stats}
            currentEventMultiplier={currentEventMultiplier}
            onNavigate={navigateTo}
          />

          <WindingMiniGameModal
            open={activeInteraction?.kind === "winding"}
            itemId={
              activeInteraction?.kind === "winding" ? activeInteraction.itemId : "chronograph"
            }
            itemLabel={
              activeInteraction?.kind === "winding"
                ? (watchItemLabels.get(activeInteraction.itemId) ?? "")
                : ""
            }
            mode={interactionModes.winding}
            onModeChange={(mode) => handleInteractionModeChange("winding", mode)}
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
            onComplete={(outcome) => {
              if (activeInteraction?.kind !== "winding") {
                return;
              }
              handlePurchase(
                applyWindingReward(state, activeInteraction.itemId, Date.now(), outcome.tier, {
                  mode: interactionModes.winding,
                }),
              );
            }}
            showTapHint={!settings.coachmarksDismissed["winding:tap-hint"]}
            onTapHintDismiss={handleDismissWindingTapHint}
            onClose={() => setActiveInteraction(null)}
          />

          <AutomaticMiniGameModal
            open={activeInteraction?.kind === "automatic"}
            itemId={activeInteraction?.kind === "automatic" ? activeInteraction.itemId : "classic"}
            itemLabel={
              activeInteraction?.kind === "automatic"
                ? (watchItemLabels.get(activeInteraction.itemId) ?? "")
                : ""
            }
            mode={interactionModes.automatic}
            onModeChange={(mode) => handleInteractionModeChange("automatic", mode)}
            currentPerfectStreak={interactionStreak.currentStreak}
            helpAction={
              <ExplainButton
                sectionId={HELP_SECTION_IDS.interactions}
                label="Explain interactions"
                className="help-open-button"
              />
            }
            onComplete={(outcome) => {
              if (activeInteraction?.kind !== "automatic") {
                return;
              }
              handlePurchase(
                applyAutomaticReward(state, activeInteraction.itemId, Date.now(), outcome.tier, {
                  mode: interactionModes.automatic,
                }),
              );
            }}
            onClose={() => setActiveInteraction(null)}
          />

          <QuartzMiniGameModal
            open={activeInteraction?.kind === "quartz"}
            itemId={activeInteraction?.kind === "quartz" ? activeInteraction.itemId : "starter"}
            itemLabel={
              activeInteraction?.kind === "quartz"
                ? (watchItemLabels.get(activeInteraction.itemId) ?? "")
                : ""
            }
            mode={interactionModes.quartz}
            onModeChange={(mode) => handleInteractionModeChange("quartz", mode)}
            currentPerfectStreak={interactionStreak.currentStreak}
            rewardRangeLabel={`${formatMoneyFromCents(100)} - ${formatMoneyFromCents(500)}`}
            helpAction={
              <ExplainButton
                sectionId={HELP_SECTION_IDS.interactions}
                label="Explain interactions"
                className="help-open-button"
              />
            }
            onComplete={(outcome) => {
              if (activeInteraction?.kind !== "quartz") {
                return;
              }
              handlePurchase(
                applyQuartzReward(state, activeInteraction.itemId, Date.now(), outcome.tier, {
                  mode: interactionModes.quartz,
                }),
              );
            }}
            onClose={() => setActiveInteraction(null)}
          />

          <SaveTab
            isActive={activeTab === "save"}
            state={state}
            watchItems={watchItems}
            audioSettings={audioSettings}
            onUpdateAudioSettings={handleUpdateAudioSettings}
            settings={settings}
            persistSettings={persistSettings}
            visibleTabOptions={visibleTabOptions}
            hiddenTabsSet={hiddenTabsSet}
            devSettings={devSettings}
            setDevSettings={setDevSettings}
            onPurchase={handlePurchase}
            importText={importText}
            onImportTextChange={setImportText}
            onExport={handleExport}
            onImport={handleImport}
            onImportFile={handleImportFile}
            saveStatus={saveStatus}
            onClearSave={handleClearSave}
          />

          {prestigeOnboarding && (
            <PrestigeOnboardingModal
              event={prestigeOnboarding}
              onClose={() => setPrestigeOnboarding(null)}
              onRecommendedAction={(tabId) => {
                activateTab(tabId, "system");
                setPrestigeOnboarding(null);
              }}
            />
          )}
        </main>
        <ToastStack toasts={toasts} onDismiss={handleDismissToast} />
      </div>
      <HelpModal
        open={helpOpen}
        sections={helpSections}
        activeSectionId={helpSectionId}
        onSelectSectionId={handleSelectHelpSection}
        onClose={() => setHelpOpen(false)}
      />
    </HelpProvider>
  );
}
