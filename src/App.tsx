import React, { useEffect, useMemo, useRef, useState } from "react";

import { CatalogTab } from "./ui/tabs/CatalogTab";
import { CareerTab } from "./ui/tabs/CareerTab";
import { CollectionTab } from "./ui/tabs/CollectionTab";
import { MaisonTab } from "./ui/tabs/MaisonTab";
import { NostalgiaTab } from "./ui/tabs/NostalgiaTab";
import { SaveTab } from "./ui/tabs/SaveTab";
import { StatsTab } from "./ui/tabs/StatsTab";
import { WorkshopTab } from "./ui/tabs/WorkshopTab";
import { HelpModal, loadHelpState, persistHelpState } from "./ui/help/HelpModal";
import { HELP_SECTIONS } from "./ui/help/helpContent";
import { HelpIcon } from "./ui/icons/coreIcons";

import {
  formatMoneyFromCents,
  formatRateFromCentsPerSec,
  formatSoftcapEfficiency,
} from "./game/format";
import {
  clearLocalStorageSave,
  decodeSaveString,
  encodeSaveString,
  loadSaveFromLocalStorage,
  persistSaveToLocalStorage,
} from "./game/persistence";
import { isTestEnvironment } from "./game/runtime/isTestEnvironment";
import { useGameRuntime } from "./game/runtime/useGameRuntime";
import {
  applyWindSessionRewards,
  buyItem,
  canMaisonPrestige,
  canWorkshopPrestige,
  canNostalgiaPrestige,
  createInitialState,
  getAchievementProgressRatio,
  getAchievements,
  getTotalCashRateCentsPerSec,
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
  getUnlockVisibilityRatio,
  craftBoost,
  canCraftBoost,
  getCraftedBoostIncomeMultiplier,
  getCraftedBoostCollectionMultiplier,
  getCraftedBoostPrestigeMultiplier,
  getWatchItems,
  getUpgrades,
  getSetBonuses,
  getEvents,
  getMaisonUpgrades,
  getMaisonLines,
  getMaisonPrestigeGain,
  getMaisonPrestigeThresholdCents,
  getEventIncomeMultiplier,
  getItemCount,
  getAutoBuyEnabled,
  getMaisonReputationGain,
  getMaxAffordableItemCount,
  getNostalgiaUnlockCost,
  getNostalgiaUnlockIds,
  getNostalgiaPrestigeGain,
  getNostalgiaPrestigeThresholdCents,
  getCollectionValueCents,
  getWorkshopPrestigeGain,
  getWorkshopPrestigeThresholdCents,
  getWorkshopUpgrades,
  getMilestones,
  isItemUnlocked,
  isMaisonRevealReady,
  isWorkshopRevealReady,
} from "./game/state";
import { getCatalogEntryTags } from "./game/catalog";
import type { GameState, WatchItemId } from "./game/state";
import { step } from "./game/sim";

const AUDIO_SETTINGS_KEY = "emily-idle:audio";
const SETTINGS_KEY = "emily-idle:settings";
const TAB_DEFINITIONS = [
  { id: "collection", label: "Vault" },
  { id: "career", label: "Career" },
  { id: "workshop", label: "Atelier" },
  { id: "maison", label: "Maison" },
  { id: "nostalgia", label: "Nostalgia" },
  { id: "catalog", label: "Catalog" },
  { id: "stats", label: "Stats" },
  { id: "save", label: "Save" },
] as const;

type TabId = (typeof TAB_DEFINITIONS)[number]["id"];

type AudioSettings = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
};

type ThemeMode = "system" | "light" | "dark";
const HIDEABLE_TAB_IDS: TabId[] = ["workshop", "maison", "catalog", "stats"];

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  hiddenTabs: TabId[];
  coachmarksDismissed: Record<string, boolean>;
  confirmNostalgiaUnlocks: boolean;
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

    return {
      themeMode,
      hideCompletedAchievements,
      hiddenTabs,
      coachmarksDismissed,
      confirmNostalgiaUnlocks,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export default function App() {
  const [windActiveItemId, setWindActiveItemId] = useState<null | WatchItemId>(null);
  const [windRound, setWindRound] = useState(0);
  const [windTension, setWindTension] = useState(0);
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpSectionId, setHelpSectionId] = useState<string | null>(null);
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
  const { state, setState, persistNow, markSaveDirty, resetSimulationClock } = useGameRuntime({
    initialState: createInitialState,
    step,
    loadSave: loadSaveFromLocalStorage,
    clearSave: clearLocalStorageSave,
    persistSave: persistSaveToLocalStorage,
    devSettings,
    onPersistError: (message) => setSaveStatus(message),
  });

  const persistSettings = (nextSettings: Settings) => {
    setSettings(nextSettings);
    setCoachmarksDismissed(nextSettings.coachmarksDismissed);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
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
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

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

  const activateTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setFocusedTab(tabId);
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
        activateTab(focusedTab);
        return;
      }
      default:
        return;
    }
  };

  const handlePurchase = (nextState: GameState) => {
    if (nextState !== state) {
      setState(nextState);
      markSaveDirty();
      persistNow("purchase", nextState);
    }
  };

  const handleToggleAutoBuy = () => {
    setAutoBuyToggle((value) => !value);
  };

  const handleInteract = (itemId: WatchItemId) => {
    setWindActiveItemId(itemId);
    setWindRound(0);
    setWindTension(0);
  };

  const closeWindModal = () => {
    setWindActiveItemId(null);
    setWindRound(0);
    setWindTension(0);
  };

  const resolveWindRound = (nextRound: number, nextTension: number) => {
    if (!windActiveItemId) {
      return;
    }

    if (nextRound < 5) {
      setWindRound(nextRound);
      setWindTension(nextTension);
      return;
    }

    handlePurchase(applyWindSessionRewards(state, windActiveItemId, nextTension, Date.now()));
    closeWindModal();
  };

  const handleWindSteady = () => {
    resolveWindRound(windRound + 1, Math.min(10, windTension + 1));
  };

  const handleWindPush = () => {
    const succeeded = Math.random() < 0.6;
    if (!succeeded) {
      resolveWindRound(5, windTension);
      return;
    }

    resolveWindRound(windRound + 1, Math.min(10, windTension + 2));
  };

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

  const handleSelectHelpSection = (nextId: string) => {
    setHelpSectionId(nextId);
    persistHelpState({ lastSectionId: nextId });
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

  const handleImport = () => {
    const raw = importText.trim();
    if (!raw) {
      setSaveStatus("Paste an exported save string to import.");
      return;
    }

    const decoded = decodeSaveString(raw);
    if (!decoded.ok) {
      console.warn(`Import failed. ${decoded.error}`);
      setSaveStatus(`Import failed: ${decoded.error}`);
      return;
    }

    setState(decoded.save.state);
    resetSimulationClock();
    markSaveDirty();
    persistNow("import", decoded.save.state);
    setSaveStatus(`Imported save from ${decoded.save.savedAt}.`);
  };

  const stats = useMemo(() => {
    const nowMs = Date.now();
    const eventMultiplier = getEventIncomeMultiplier(state, nowMs);
    const cashRate = getTotalCashRateCentsPerSec(state, eventMultiplier);
    const enjoymentRate = getEnjoymentRateCentsPerSec(state);

    return {
      cash: formatMoneyFromCents(state.currencyCents),
      cashRate: formatRateFromCentsPerSec(cashRate),
      enjoyment: formatMoneyFromCents(getEnjoymentCents(state)),
      enjoymentRate: formatRateFromCentsPerSec(enjoymentRate),
      sentimentalValue: formatMoneyFromCents(getCollectionValueCents(state)),
      softcap: formatSoftcapEfficiency(getSoftcapEfficiency(state)),
    };
  }, [state]);

  const watchItems = useMemo(() => getWatchItems(), []);
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
  const setBonuses = useMemo(() => getSetBonuses(), []);
  const achievements = useMemo(() => getAchievements(), []);
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
  const catalogBrands = useMemo(() => {
    return ["All", ...new Set(catalogEntries.map((entry) => entry.brand))];
  }, [catalogEntries]);
  const showcaseVisibilityRatio = useMemo(
    () => getUnlockVisibilityRatio(state, "showcase"),
    [state],
  );
  const statsVisibilityRatio = useMemo(
    () => getAchievementProgressRatio(state, "first-drawer"),
    [state],
  );
  const tabVisibility = useMemo(
    () => ({
      collection: true,
      career: state.unlockedMilestones.includes("collector-shelf"),
      save: true,
      nostalgia: showNostalgiaSection,
      catalog: showcaseVisibilityRatio >= 0.8,
      stats: statsVisibilityRatio >= 0.8,
      workshop: showWorkshopSection,
      maison: showMaisonSection,
    }),
    [
      showcaseVisibilityRatio,
      statsVisibilityRatio,
      showWorkshopSection,
      showMaisonSection,
      showNostalgiaSection,
      state.unlockedMilestones,
    ],
  );
  const hiddenTabsSet = useMemo(() => new Set(settings.hiddenTabs), [settings.hiddenTabs]);
  const combinedTabVisibility = useMemo(
    () => ({
      collection: true,
      save: true,
      nostalgia: tabVisibility.nostalgia,
      career: tabVisibility.career && !hiddenTabsSet.has("career"),
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
    if (combinedTabVisibility[activeTab]) {
      return;
    }

    const nextTab = "collection";
    if (activeTab !== nextTab) {
      setActiveTab(nextTab);
      setFocusedTab(nextTab);
    }
  }, [activeTab, combinedTabVisibility]);

  const visibleTabOptions = useMemo(
    () => tabs.filter((tab) => HIDEABLE_TAB_IDS.includes(tab.id) && tabVisibility[tab.id]),
    [tabs, tabVisibility],
  );
  const coachmarks = useMemo(
    () => [
      {
        id: "vault-basics",
        title: "Vault basics",
        text: "Buy watches to earn enjoyment and cash. Interact to trigger special moments.",
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
  const ownedCatalogTiers = useMemo(() => {
    return watchItems.filter((item) => getItemCount(state, item.id) > 0).map((item) => item.id);
  }, [state, watchItems]);
  const hasOwnedCatalogTiers = ownedCatalogTiers.length > 0;
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
    const ownedTierSet = new Set(ownedCatalogTiers);

    const filteredByOwnership = catalogEntries.filter((entry) => {
      const tags = getCatalogEntryTags(entry);
      const tierTag = tags.find((tag) =>
        ownedTierSet.has(tag as (typeof ownedCatalogTiers)[number]),
      );
      const isOwned = Boolean(tierTag);
      return catalogTab === "owned" ? isOwned : !isOwned;
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
        return filteredByFilters;
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
    ownedCatalogTiers,
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

        const maxAffordable = getMaxAffordableItemCount(nextState, item.id);
        if (maxAffordable <= 0) {
          continue;
        }

        const purchaseQty = Math.min(10, maxAffordable);
        const candidateState = buyItem(nextState, item.id, purchaseQty);
        if (candidateState === nextState) {
          continue;
        }

        nextState = candidateState;
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
    <main className="container">
      <header className="hero">
        <div>
          <p className="eyebrow">Collection loop</p>
          <h1>Emily Idle</h1>
          <p className="muted">Build your vault, unlock new lines, and stack bonuses.</p>
          <nav className="page-nav" aria-label="Primary navigation">
            <div role="tablist" aria-label="Primary navigation" className="page-nav-tabs">
              {visibleTabs.map((tab) => {
                const selected = tab.id === activeTab;
                const focusable = tab.id === focusedTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className="page-nav-link"
                    role="tab"
                    id={`${tab.id}-tab`}
                    aria-selected={selected}
                    aria-controls={tab.id}
                    tabIndex={focusable ? 0 : -1}
                    data-testid={tab.id === "nostalgia" ? "nostalgia-tab" : undefined}
                    onClick={() => activateTab(tab.id)}
                    onFocus={() => {
                      if (isTestEnvironment()) {
                        return;
                      }
                      setFocusedTab(tab.id);
                    }}
                    onKeyDown={handleTabKeyDown}
                    ref={(node) => {
                      if (!node) {
                        tabRefs.current.delete(tab.id);
                        return;
                      }
                      tabRefs.current.set(tab.id, node);
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="page-nav-link help-open-button"
              aria-label="Open help"
              data-testid="help-open"
              onClick={handleOpenHelp}
            >
              <HelpIcon size={18} />
            </button>
          </nav>
        </div>
        <section className="stats" aria-labelledby="vault-stats-title">
          <h2 id="vault-stats-title" className="visually-hidden">
            Vault stats
          </h2>
          <dl>
            <div>
              <dt>Vault enjoyment</dt>
              <dd id="enjoyment">{stats.enjoyment}</dd>
            </div>
            <div>
              <dt>Enjoyment / sec</dt>
              <dd id="enjoyment-rate">{stats.enjoymentRate}</dd>
            </div>
            <div>
              <dt>Vault dollars</dt>
              <dd id="currency">{stats.cash}</dd>
            </div>
            <div>
              <dt>Dollars / sec</dt>
              <dd id="income">{stats.cashRate}</dd>
            </div>
            <div>
              <dt>Memories</dt>
              <dd id="collection-value">{stats.sentimentalValue}</dd>
            </div>
            <div>
              <dt>Softcap</dt>
              <dd id="softcap">{stats.softcap}</dd>
            </div>
          </dl>
        </section>
      </header>

      <CollectionTab
        isActive={activeTab === "collection"}
        state={state}
        watchItems={watchItems}
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
        craftingPartsPerWatch={craftingPartsPerWatch}
        activeCoachmarks={activeCoachmarks}
        settings={settings}
        persistSettings={persistSettings}
        upgrades={upgrades}
        milestones={milestones}
        achievements={achievements}
        events={events}
        setBonuses={setBonuses}
        currentEventMultiplier={currentEventMultiplier}
        nowMs={nowMs}
        onPurchase={handlePurchase}
        onInteract={handleInteract}
      />

      <CareerTab
        isActive={activeTab === "career"}
        state={state}
        nowMs={nowMs}
        onPurchase={handlePurchase}
      />

      <WorkshopTab
        isActive={activeTab === "workshop"}
        state={state}
        showWorkshopSection={showWorkshopSection}
        showWorkshopPanel={showWorkshopPanel}
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

      <CatalogTab
        isActive={activeTab === "catalog"}
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
      />

      <StatsTab
        isActive={activeTab === "stats"}
        state={state}
        stats={stats}
        currentEventMultiplier={currentEventMultiplier}
      />

      {windActiveItemId && (
        <div role="dialog" aria-modal="true" className="panel">
          <header className="panel-header">
            <div>
              <h2>Wind session</h2>
              <p className="muted">Choose your pace. Finish 5 rounds to trigger a boost.</p>
            </div>
            <button
              type="button"
              className="secondary"
              data-testid="wind-close"
              onClick={closeWindModal}
            >
              Close
            </button>
          </header>
          <p data-testid="wind-progress">
            Round {windRound} / 5 · Tension {windTension} / 10
          </p>
          <div className="card-actions">
            <button type="button" data-testid="wind-steady" onClick={handleWindSteady}>
              Steady wind
            </button>
            <button
              type="button"
              className="secondary"
              data-testid="wind-push"
              onClick={handleWindPush}
            >
              Push it
            </button>
          </div>
        </div>
      )}

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
        saveStatus={saveStatus}
      />

      <HelpModal
        open={helpOpen}
        sections={helpSections}
        activeSectionId={helpSectionId}
        onSelectSectionId={handleSelectHelpSection}
        onClose={() => setHelpOpen(false)}
      />
    </main>
  );
}
