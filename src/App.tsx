import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import {
  activateManualEvent,
  buyItem,
  buyMaisonLine,
  buyMaisonUpgrade,
  buyUpgrade,
  buyWorkshopUpgrade,
  canBuyItem,
  canBuyMaisonLine,
  canBuyMaisonUpgrade,
  canBuyUpgrade,
  canBuyWorkshopUpgrade,
  canMaisonPrestige,
  canWorkshopPrestige,
  createInitialState,
  getAchievementProgressRatio,
  getAchievements,
  getEffectiveIncomeRateCentsPerSec,
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
  dismantleItem,
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
  getItemPriceCents,
  getMilestoneRequirementLabel,
  getUpgradePriceCents,
  getEventStatusLabel,
  getEnjoymentThresholdLabel,
  getCollectionValueCents,
  getWorkshopPrestigeGain,
  getWorkshopPrestigeThresholdCents,
  getWorkshopUpgrades,
  getMilestones,
  isEventActive,
  isItemUnlocked,
  isMaisonRevealReady,
  isUpgradeUnlocked,
  isWorkshopRevealReady,
  prestigeMaison,
  prestigeWorkshop,
  shouldShowUnlockTag,
} from "./game/state";
import { getCatalogEntryTags, getCatalogImageUrl } from "./game/catalog";
import type { GameState } from "./game/state";
import { SIM_TICK_MS, step } from "./game/sim";

const MAX_FRAME_DELTA_MS = 250;
const AUTO_SAVE_INTERVAL_MS = 2_000;
const AUDIO_SETTINGS_KEY = "emily-idle:audio";
const SETTINGS_KEY = "emily-idle:settings";

const isTestEnvironment = () =>
  import.meta.env.MODE === "test" ||
  import.meta.env.VITEST ||
  (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) ||
  (typeof globalThis !== "undefined" && "__vitest_worker__" in globalThis);

type AudioSettings = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
};

type ThemeMode = "system" | "light" | "dark";

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  tabVisibility: Record<
    "collection" | "workshop" | "maison" | "catalog" | "stats" | "save",
    boolean
  >;
  coachmarksDismissed: Record<string, boolean>;
};

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  sfxEnabled: false,
  bgmEnabled: false,
};

const DEFAULT_SETTINGS: Settings = {
  themeMode: "system",
  hideCompletedAchievements: false,
  tabVisibility: {
    collection: true,
    workshop: true,
    maison: true,
    catalog: true,
    stats: true,
    save: true,
  },
  coachmarksDismissed: {},
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
    const tabVisibilityBase =
      parsed.tabVisibility && typeof parsed.tabVisibility === "object" ? parsed.tabVisibility : {};
    const tabVisibility = {
      collection: true,
      workshop: typeof tabVisibilityBase.workshop === "boolean" ? tabVisibilityBase.workshop : true,
      maison: typeof tabVisibilityBase.maison === "boolean" ? tabVisibilityBase.maison : true,
      catalog: typeof tabVisibilityBase.catalog === "boolean" ? tabVisibilityBase.catalog : true,
      stats: typeof tabVisibilityBase.stats === "boolean" ? tabVisibilityBase.stats : true,
      save: true,
    };
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

    return {
      themeMode,
      hideCompletedAchievements,
      tabVisibility: {
        ...DEFAULT_SETTINGS.tabVisibility,
        ...tabVisibility,
      },
      coachmarksDismissed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [windActiveItemId, setWindActiveItemId] = useState<null | string>(null);
  const [windProgress, setWindProgress] = useState(0);
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

  const tabs = useMemo(
    () =>
      [
        { id: "collection", label: "Vault" },
        { id: "workshop", label: "Atelier" },
        { id: "maison", label: "Maison" },
        { id: "catalog", label: "Catalog" },
        { id: "stats", label: "Stats" },
        { id: "save", label: "Save" },
      ] as const,
    [],
  );
  type TabId = (typeof tabs)[number]["id"];
  const [activeTab, setActiveTab] = useState<TabId>("collection");
  const [focusedTab, setFocusedTab] = useState<TabId>("collection");
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (settings.themeMode === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", settings.themeMode);
    }
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

  const saveDirtyRef = useRef(false);
  const lastSavedAtMsRef = useRef(0);
  const lastFrameAtMsRef = useRef<number | null>(null);
  const accumulatorMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    const loadResult = loadSaveFromLocalStorage();
    if (loadResult.ok) {
      setState(loadResult.save.state);
      console.info(
        `Loaded save v${loadResult.save.version} from ${loadResult.save.savedAt} (last simulated at ${new Date(loadResult.save.lastSimulatedAtMs).toISOString()})`,
      );
      return;
    }

    if ("empty" in loadResult) {
      console.info("No save found; starting new game.");
      return;
    }

    console.warn(`Save was invalid; resetting state. ${loadResult.error}`);
    const clearResult = clearLocalStorageSave();
    if (!clearResult.ok) {
      console.warn(`Failed to clear invalid save. ${clearResult.error}`);
    }
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persistNow = useCallback(
    (reason: string, snapshot: GameState = stateRef.current) => {
      const nowMs = Date.now();
      const result = persistSaveToLocalStorage(snapshot, nowMs);

      if (!result.ok) {
        console.warn(`Autosave failed (${reason}). ${result.error}`);
        setSaveStatus(`Save failed: ${result.error}`);
        return;
      }

      lastSavedAtMsRef.current = nowMs;
      saveDirtyRef.current = false;
    },
    [],
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && saveDirtyRef.current) {
        persistNow("visibilitychange:hidden");
      }
    };

    const onPageHide = () => {
      if (saveDirtyRef.current) {
        persistNow("pagehide");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [persistNow]);

  useEffect(() => {
    if (isTestEnvironment()) {
      return;
    }

    const frame = (nowMs: number) => {
      let stepped = false;

      if (lastFrameAtMsRef.current !== null) {
        const rawElapsedMs = nowMs - lastFrameAtMsRef.current;
        const elapsedMs = Math.max(0, Math.min(rawElapsedMs, MAX_FRAME_DELTA_MS));

        accumulatorMsRef.current += elapsedMs;

        while (accumulatorMsRef.current >= SIM_TICK_MS) {
          stepped = true;
          setState((current: GameState) => {
            const nextState = step(current, SIM_TICK_MS);
            stateRef.current = nextState;
            return nextState;
          });
          accumulatorMsRef.current -= SIM_TICK_MS;
        }
      }

      lastFrameAtMsRef.current = nowMs;

      if (stepped) {
        saveDirtyRef.current = true;
      }

      if (devSettings.enabled && devSettings.speedMultiplier !== 1) {
        if (devSettings.speedMultiplier > 1) {
          accumulatorMsRef.current += SIM_TICK_MS * (devSettings.speedMultiplier - 1);
        }
      }

      if (saveDirtyRef.current && Date.now() - lastSavedAtMsRef.current >= AUTO_SAVE_INTERVAL_MS) {
        persistNow("interval");
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [devSettings.enabled, devSettings.speedMultiplier, persistNow]);

  const handlePurchase = (nextState: GameState) => {
    if (nextState !== state) {
      setState(nextState);
      saveDirtyRef.current = true;
      persistNow("purchase", nextState);
    }
  };

  const closeWindModal = () => {
    setWindActiveItemId(null);
    setWindProgress(0);
  };

  const handleWindClick = () => {
    const next = windProgress + 1;
    if (next >= 10) {
      handlePurchase(activateManualEvent(state, "wind-up", Date.now()));
      closeWindModal();
      return;
    }
    setWindProgress(next);
  };

  const handleDismantle = (itemId: (typeof watchItems)[number]["id"]) => {
    handlePurchase(dismantleItem(state, itemId, 1));
  };

  const handleCraftBoost = (boostId: (typeof craftedBoosts)[number]["id"]) => {
    handlePurchase(craftBoost(state, boostId));
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
    lastFrameAtMsRef.current = null;
    accumulatorMsRef.current = 0;

    saveDirtyRef.current = true;
    persistNow("import", decoded.save.state);
    setSaveStatus(`Imported save from ${decoded.save.savedAt}.`);
  };

  const stats = useMemo(() => {
    const cashRate = getEffectiveIncomeRateCentsPerSec(state);
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
  const watchItemLabels = useMemo(
    () => new Map(watchItems.map((item) => [item.id, item.name])),
    [watchItems],
  );
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
  const canPrestigeWorkshop = useMemo(() => canWorkshopPrestige(state), [state]);
  const canPrestigeMaison = useMemo(() => canMaisonPrestige(state), [state]);
  const showWorkshopPanel =
    canPrestigeWorkshop || state.workshopPrestigeCount > 0 || state.workshopBlueprints > 0;
  const showWorkshopTeaser = !showWorkshopPanel && isWorkshopRevealReady(state);
  const showWorkshopSection = showWorkshopPanel || showWorkshopTeaser;
  const showMaisonPanel =
    canPrestigeMaison || state.maisonHeritage > 0 || state.maisonReputation > 0;
  const showMaisonTeaser = !showMaisonPanel && isMaisonRevealReady(state);
  const showMaisonSection = showMaisonPanel || showMaisonTeaser;
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
      save: true,
      catalog: showcaseVisibilityRatio >= 0.8,
      stats: statsVisibilityRatio >= 0.8,
      workshop: showWorkshopSection,
      maison: showMaisonSection,
    }),
    [showcaseVisibilityRatio, statsVisibilityRatio, showWorkshopSection, showMaisonSection],
  );
  const userTabVisibility = useMemo(
    () => ({
      ...settings.tabVisibility,
      collection: true,
      save: true,
    }),
    [settings.tabVisibility],
  );
  const combinedTabVisibility = useMemo(
    () => ({
      collection: true,
      save: true,
      catalog: tabVisibility.catalog && userTabVisibility.catalog,
      stats: tabVisibility.stats && userTabVisibility.stats,
      workshop: tabVisibility.workshop && userTabVisibility.workshop,
      maison: tabVisibility.maison && userTabVisibility.maison,
    }),
    [tabVisibility, userTabVisibility],
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
    () =>
      tabs.filter((tab) => tab.id !== "collection" && tab.id !== "save" && tabVisibility[tab.id]),
    [tabs, tabVisibility],
  );
  const coachmarks = useMemo(
    () => [
      {
        id: "vault-basics",
        title: "Vault basics",
        text: "Buy watches to earn cash and enjoyment. Interact to trigger special moments.",
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
        saveDirtyRef.current = true;
      }

      if (nextState !== current) {
        stateRef.current = nextState;
      }
      return nextState;
    });
  }, [autoBuyEnabled, state.currencyCents, state.unlockedMilestones, watchItems]);

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
            <div role="tablist" aria-label="Primary navigation">
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
          </nav>
        </div>
        <section className="stats" aria-labelledby="vault-stats-title">
          <h2 id="vault-stats-title" className="visually-hidden">
            Vault stats
          </h2>
          <dl>
            <div>
              <dt>Vault cash</dt>
              <dd id="currency">{stats.cash}</dd>
            </div>
            <div>
              <dt>Cash / sec</dt>
              <dd id="income">{stats.cashRate}</dd>
            </div>
            <div>
              <dt>Enjoyment</dt>
              <dd id="enjoyment">{stats.enjoyment}</dd>
            </div>
            <div>
              <dt>Enjoyment / sec</dt>
              <dd id="enjoyment-rate">{stats.enjoymentRate}</dd>
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

      <section
        className="collection"
        id="collection"
        role="tabpanel"
        aria-labelledby="collection-tab"
        hidden={activeTab !== "collection"}
      >
        {activeTab === "collection" && (
          <>
            <div>
              <h2>Collection</h2>
              <p className="muted">Acquire pieces to grow cash and enjoyment.</p>
              <div className="collection-setup" data-testid="collection-setup">
                <fieldset className="automation-toggle" data-testid="automation-controls">
                  <legend className="automation-label">Automation controls</legend>
                  {autoBuyUnlocked ? (
                    <button
                      type="button"
                      className={autoBuyEnabled ? "" : "secondary"}
                      onClick={() => setAutoBuyToggle((value) => !value)}
                    >
                      {autoBuyEnabled ? "Auto-buy on" : "Auto-buy off"}
                    </button>
                  ) : (
                    <p className="muted">Unlock automation with Atelier blueprints.</p>
                  )}
                </fieldset>
                <div className="panel catalog-tier-panel" data-testid="catalog-tier-panel">
                  <header className="panel-header">
                    <div>
                      <p className="eyebrow">Catalog bonuses</p>
                      <h3>Tier bonuses</h3>
                      <p className="muted">Unlock archive tiers by discovering references.</p>
                    </div>
                    <div className="results-count" data-testid="catalog-tier-count">
                      {catalogTierUnlocks.length} / {catalogTierDefinitions.length} unlocked
                    </div>
                  </header>
                  {archiveCuratorMilestone && (
                    <div className="catalog-tier-curator" data-testid="catalog-curator-hint">
                      <p className="muted">
                        Archive curator {archiveCuratorProgress} / {archiveCuratorThreshold} ·
                        Unlock Archive guides to boost vault income.
                      </p>
                      <p className="catalog-tier-curator-status">
                        {archiveCuratorUnlocked
                          ? "Archive guides are available in Upgrades."
                          : `Next milestone: ${archiveCuratorMilestone.name}.`}
                      </p>
                    </div>
                  )}
                  <div className="card-stack" data-testid="catalog-tier-list">
                    {catalogTierDefinitions.map((tier) => {
                      const unlocked = catalogTierUnlocks.includes(tier.id);
                      const progress = catalogTierProgress[tier.id];
                      return (
                        <div
                          className={`card catalog-tier-card ${unlocked ? "catalog-tier-unlocked" : ""}`}
                          key={tier.id}
                          data-testid="catalog-tier-card"
                        >
                          <div className="card-header">
                            <div>
                              <h4>{tier.name}</h4>
                              <p>{tier.description}</p>
                            </div>
                            <div>
                              {unlocked ? "Unlocked" : `${progress} / ${tier.requiredCount}`}
                            </div>
                          </div>
                          <p className="muted">Income x{tier.incomeMultiplier.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="muted" aria-live="polite" data-testid="catalog-tier-status">
                    {catalogTierBonuses.length > 0
                      ? `Active bonus x${catalogTierBonusMultiplier.toFixed(2)}`
                      : "Discover references to unlock tier bonuses."}
                  </p>
                </div>
              </div>
              {showMaisonLines && (
                <div className="panel maison-lines" data-testid="maison-lines">
                  <header className="panel-header">
                    <div>
                      <p className="eyebrow">Maison expansion</p>
                      <h3>Maison lines</h3>
                      <p className="muted">Invest Heritage or Reputation to expand your house.</p>
                    </div>
                    <div className="results-count" data-testid="maison-lines-count">
                      {Object.values(state.maisonLines).filter(Boolean).length} /{" "}
                      {maisonLines.length} active
                    </div>
                  </header>
                  <div className="card-stack" data-testid="maison-lines-list">
                    {maisonLines.map((line) => {
                      const owned = state.maisonLines[line.id] ?? false;
                      const canAfford = canBuyMaisonLine(state, line.id);
                      const costLabel =
                        line.currency === "heritage"
                          ? `${line.cost} Heritage`
                          : `${line.cost} Reputation`;
                      const effectLabel = (() => {
                        if (line.incomeMultiplier) {
                          return `+${Math.round((line.incomeMultiplier - 1) * 100)}% cash`;
                        }
                        if (line.collectionBonusMultiplier) {
                          return `+${Math.round((line.collectionBonusMultiplier - 1) * 100)}% enjoyment`;
                        }
                        if (line.workshopBlueprintBonus) {
                          return `+${line.workshopBlueprintBonus} Atelier blueprint per reset`;
                        }
                        return "Maison line";
                      })();

                      return (
                        <div className="card" key={line.id} data-testid="maison-line-card">
                          <div className="card-header">
                            <div>
                              <h4>{line.name}</h4>
                              <p>{line.description}</p>
                            </div>
                            <div>{owned ? "Active" : costLabel}</div>
                          </div>
                          <p>{effectLabel}</p>
                          <div className="card-actions">
                            <button
                              type="button"
                              className="secondary"
                              disabled={owned || !canAfford}
                              onClick={() => handlePurchase(buyMaisonLine(state, line.id))}
                            >
                              {owned ? "Live" : `Activate (${costLabel})`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div id="collection-list" className="card-stack">
                {watchItems.map((item) => {
                  const owned = state.items[item.id] ?? 0;
                  const price = getItemPriceCents(state, item.id, 1);
                  const maxAffordable = getMaxAffordableItemCount(state, item.id);
                  const bulkQty = Math.min(10, Math.max(1, maxAffordable));
                  const bulkPrice = getItemPriceCents(state, item.id, bulkQty);
                  const unlocked = isItemUnlocked(state, item.id);
                  const partsPerWatch = craftingPartsPerWatch[item.id] ?? 0;

                  return (
                    <div className="card" key={item.id}>
                      <div className="card-header">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.description}</p>
                        </div>
                        <div>{owned} owned</div>
                      </div>
                      <p>
                        {formatRateFromCentsPerSec(item.incomeCentsPerSec)} cash each · Memories{" "}
                        {formatMoneyFromCents(item.collectionValueCents)}
                      </p>
                      <p className="muted">Dismantle value: {partsPerWatch} parts</p>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="secondary"
                          disabled={owned <= 0}
                          onClick={() => {
                            setWindActiveItemId(item.id);
                            setWindProgress(0);
                          }}
                        >
                          Interact
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          disabled={owned <= 0 || partsPerWatch <= 0}
                          onClick={() => handleDismantle(item.id)}
                        >
                          Dismantle
                        </button>
                        <button
                          type="button"
                          disabled={!canBuyItem(state, item.id, 1) || !unlocked}
                          onClick={() => handlePurchase(buyItem(state, item.id, 1))}
                        >
                          Buy ({formatMoneyFromCents(price)})
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          disabled={
                            bulkQty <= 1 || !canBuyItem(state, item.id, bulkQty) || !unlocked
                          }
                          onClick={() => handlePurchase(buyItem(state, item.id, bulkQty))}
                        >
                          Buy {bulkQty} ({formatMoneyFromCents(bulkPrice)})
                        </button>
                        {!unlocked &&
                          item.unlockMilestoneId &&
                          shouldShowUnlockTag(state, item.unlockMilestoneId) && (
                            <div className="unlock-tag">
                              Unlocking soon ·{" "}
                              {getMilestoneRequirementLabel(item.unlockMilestoneId)}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="side-panel">
              {activeCoachmarks.length > 0 && (
                <div className="panel" data-testid="coachmarks">
                  <h3>Coachmarks</h3>
                  <div className="card-stack">
                    {activeCoachmarks.map((mark) => (
                      <div className="card" key={mark.id} data-testid="coachmark">
                        <div className="card-header">
                          <div>
                            <h4>{mark.title}</h4>
                            <p>{mark.text}</p>
                          </div>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              const nextDismissed = {
                                ...coachmarksDismissed,
                                [mark.id]: true,
                              };
                              persistSettings({
                                ...settings,
                                coachmarksDismissed: nextDismissed,
                              });
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="panel">
                <h3>Upgrades</h3>
                <div id="upgrade-list" className="card-stack">
                  {upgrades.map((upgrade) => {
                    const level = state.upgrades[upgrade.id] ?? 0;
                    const price = getUpgradePriceCents(state, upgrade.id, 1);
                    const unlocked = isUpgradeUnlocked(state, upgrade.id);

                    return (
                      <div className="card" key={upgrade.id}>
                        <div className="card-header">
                          <div>
                            <h3>{upgrade.name}</h3>
                            <p>{upgrade.description}</p>
                          </div>
                          <div>Level {level}</div>
                        </div>
                        <p>+{Math.round(upgrade.incomeMultiplierPerLevel * 100)}% cash per level</p>
                        <div className="card-actions">
                          <button
                            type="button"
                            disabled={!canBuyUpgrade(state, upgrade.id, 1) || !unlocked}
                            onClick={() => handlePurchase(buyUpgrade(state, upgrade.id))}
                          >
                            Upgrade ({formatMoneyFromCents(price)})
                          </button>
                          {!unlocked &&
                            upgrade.unlockMilestoneId &&
                            shouldShowUnlockTag(state, upgrade.unlockMilestoneId) && (
                              <div className="unlock-tag">
                                Unlocking soon ·{" "}
                                {getMilestoneRequirementLabel(upgrade.unlockMilestoneId)}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="panel">
                <h3>Milestones</h3>
                <div id="milestone-list" className="card-stack">
                  {milestones.map((milestone) => {
                    const unlocked = state.unlockedMilestones.includes(milestone.id);
                    return (
                      <div className="card" key={milestone.id}>
                        <h3>{milestone.name}</h3>
                        <p>{milestone.description}</p>
                        <p className="muted">{getMilestoneRequirementLabel(milestone.id)}</p>
                        <p>{unlocked ? "Unlocked" : "Locked"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="panel">
                <h3>Achievements</h3>
                <p className="muted">Permanent proof of your vault milestones.</p>
                <div className="card-stack">
                  {achievements
                    .filter((achievement) => {
                      if (!settings.hideCompletedAchievements) {
                        return true;
                      }
                      return !state.achievementUnlocks.includes(achievement.id);
                    })
                    .map((achievement) => {
                      const unlocked = state.achievementUnlocks.includes(achievement.id);
                      return (
                        <div className="card" key={achievement.id}>
                          <h3>{achievement.name}</h3>
                          <p>{achievement.description}</p>
                          <p className="muted" aria-live="polite">
                            {unlocked ? "Unlocked" : "Locked"}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="panel">
                <h3>Events</h3>
                <p className="muted">
                  Live boosts cycle in and out. Current multiplier x
                  {currentEventMultiplier.toFixed(2)}.
                </p>
                <div className="card-stack">
                  {events.map((event) => {
                    const active = isEventActive(state, event.id, nowMs);
                    const statusLabel = getEventStatusLabel(state, event.id, nowMs);
                    return (
                      <div className="card" key={event.id}>
                        <div className="card-header">
                          <div>
                            <h3>{event.name}</h3>
                            <p>{event.description}</p>
                          </div>
                          <div>{active ? "Live" : "Idle"}</div>
                        </div>
                        <p>Income x{event.incomeMultiplier.toFixed(2)}</p>
                        <p className="muted" aria-live="polite">
                          {statusLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="panel">
                <h3>Set bonuses</h3>
                <div id="set-bonus-list" className="card-stack" data-testid="set-bonus-list">
                  {setBonuses.map((bonus) => {
                    const requirements = Object.entries(bonus.requirements) as Array<
                      [keyof GameState["items"], number]
                    >;
                    const progress = requirements.map(([itemId, required]) => {
                      const requiredCount = required ?? 0;
                      const currentCount = state.items[itemId] ?? 0;
                      return {
                        itemId,
                        label: watchItemLabels.get(itemId) ?? itemId,
                        currentCount,
                        requiredCount,
                        met: currentCount >= requiredCount,
                      };
                    });
                    const active = progress.every((entry) => entry.met);
                    const bonusPercent = Math.round((bonus.incomeMultiplier - 1) * 100);
                    return (
                      <div
                        className="card"
                        key={bonus.id}
                        data-testid="set-bonus-card"
                        data-bonus-id={bonus.id}
                      >
                        <div className="card-header">
                          <div>
                            <h3>{bonus.name}</h3>
                            <p>{bonus.description}</p>
                          </div>
                          <div>{active ? "Active" : "Inactive"}</div>
                        </div>
                        <div className="set-bonus-progress">
                          {progress.map((entry) => (
                            <p className={entry.met ? "" : "muted"} key={entry.itemId}>
                              {entry.label} {entry.currentCount} / {entry.requiredCount}
                            </p>
                          ))}
                        </div>
                        <p className="muted">Income +{bonusPercent}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="panel" data-testid="crafting-panel">
                <h3>Crafting workshop</h3>
                <p className="muted">
                  Break down watches into parts, then craft permanent vault boosts.
                </p>
                <div className="results-count" data-testid="crafting-parts">
                  {craftingParts} parts
                </div>
                {renderCraftingRecipes("crafting-recipes")}
                {renderCraftingBoosts("crafting-boosts")}
              </div>
            </aside>
          </>
        )}
      </section>

      <section
        id="workshop"
        role="tabpanel"
        aria-labelledby="workshop-tab"
        hidden={activeTab !== "workshop"}
      >
        {activeTab === "workshop" && (
          <div className="workshop-layout">
            {showWorkshopSection && (
              <section
                className={`panel workshop-panel ${showWorkshopPanel ? "" : "panel-teaser"}`}
                data-testid="workshop-panel"
                aria-labelledby="workshop-title"
              >
                {showWorkshopPanel ? (
                  <>
                    <header className="panel-header">
                      <div>
                        <p className="eyebrow">Reset loop</p>
                        <h3 id="workshop-title">Atelier</h3>
                        <p className="muted">
                          Trade enjoyment for Blueprints and permanent boosts.
                        </p>
                      </div>
                      <div className="results-count" data-testid="workshop-balance">
                        {state.workshopBlueprints.toLocaleString()} Blueprints
                      </div>
                    </header>
                    <div className="workshop-reset" data-testid="workshop-reset">
                      <div>
                        <p className="workshop-label">Reset threshold</p>
                        <p className="workshop-value">
                          {getEnjoymentThresholdLabel(getWorkshopPrestigeThresholdCents())}
                        </p>
                      </div>
                      <div>
                        <p className="workshop-label">Current gain</p>
                        <p className="workshop-value">+{workshopPrestigeGain} Blueprints</p>
                      </div>
                    </div>
                    <fieldset className="workshop-cta">
                      <legend className="visually-hidden">Reset atelier</legend>
                      {workshopResetArmed ? (
                        <div className="workshop-confirm">
                          <button
                            type="button"
                            disabled={!canPrestigeWorkshop}
                            onClick={() => {
                              if (!canPrestigeWorkshop) {
                                return;
                              }
                              handlePurchase(prestigeWorkshop(state, workshopPrestigeGain));
                              setWorkshopResetArmed(false);
                            }}
                          >
                            Confirm reset
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => setWorkshopResetArmed(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="secondary"
                          disabled={!canPrestigeWorkshop}
                          onClick={() => setWorkshopResetArmed(true)}
                        >
                          Reset atelier
                        </button>
                      )}
                      <p className="muted" aria-live="polite">
                        {workshopResetArmed
                          ? "Confirming will reset progress and grant Blueprints."
                          : canPrestigeWorkshop
                            ? "Resetting trades your enjoyment for Blueprints and permanent boosts."
                            : "Requires reaching the enjoyment threshold."}
                      </p>
                    </fieldset>
                    <div className="workshop-upgrades">
                      <h4>Upgrades</h4>
                      <div className="card-stack">
                        {workshopUpgrades.map((upgrade) => {
                          const owned = state.workshopUpgrades[upgrade.id] ?? false;
                          const canAfford = canBuyWorkshopUpgrade(state, upgrade.id);
                          const effectLabel = (() => {
                            if (upgrade.incomeMultiplier) {
                              return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% cash`;
                            }
                            if (upgrade.softcapMultiplier) {
                              return `+${Math.round((upgrade.softcapMultiplier - 1) * 100)}% softcap`;
                            }
                            if (upgrade.softcapExponentBonus) {
                              return `Softcap exponent +${upgrade.softcapExponentBonus}`;
                            }
                            if (upgrade.unlocks?.autoBuyEnabled) {
                              return "Unlocks automation";
                            }
                            return "Permanent upgrade";
                          })();

                          return (
                            <div
                              className="card workshop-upgrade-card"
                              key={upgrade.id}
                              data-testid="workshop-upgrade-card"
                            >
                              <div className="card-header">
                                <div>
                                  <h3>{upgrade.name}</h3>
                                  <p>{upgrade.description}</p>
                                </div>
                                <div>{owned ? "Owned" : `${upgrade.blueprintCost} Blueprints`}</div>
                              </div>
                              <p>{effectLabel}</p>
                              <div className="card-actions">
                                <button
                                  type="button"
                                  className="secondary"
                                  disabled={owned || !canAfford}
                                  onClick={() =>
                                    handlePurchase(buyWorkshopUpgrade(state, upgrade.id))
                                  }
                                >
                                  {owned
                                    ? "Installed"
                                    : `Buy (${upgrade.blueprintCost} Blueprints)`}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="panel-teaser-content" data-testid="workshop-teaser">
                    <p className="eyebrow">Reset loop</p>
                    <h3>Atelier</h3>
                    <p className="muted">Your vault is close to yielding Blueprints.</p>
                    <div className="teaser-progress">
                      <div className="teaser-track">
                        <div
                          className="teaser-fill"
                          style={{ width: `${Math.round(workshopRevealProgress * 100)}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(workshopRevealProgress * 100)}% to first reset</span>
                    </div>
                  </div>
                )}
              </section>
            )}
            <section className="panel workshop-crafting" data-testid="workshop-crafting">
              <h3>Crafting workshop</h3>
              <p className="muted">
                Break down watches into parts, then craft permanent vault boosts.
              </p>
              <div className="results-count" data-testid="workshop-crafting-parts">
                {craftingParts} parts
              </div>
              <div className="workshop-crafting-section" data-testid="workshop-dismantle">
                <p className="workshop-label">Dismantle watches</p>
                <p className="muted">Convert owned watches into parts for recipes.</p>
                <div className="card-stack" data-testid="workshop-dismantle-list">
                  {watchItems.map((item) => {
                    const owned = getItemCount(state, item.id);
                    const partsPerWatch = craftingPartsPerWatch[item.id] ?? 0;
                    const canDismantle = owned > 0 && partsPerWatch > 0;
                    return (
                      <div
                        className="card"
                        key={item.id}
                        data-testid="workshop-dismantle-card"
                        data-item-id={item.id}
                      >
                        <div className="card-header">
                          <div>
                            <h4>{item.name}</h4>
                            <p>{partsPerWatch} parts per watch</p>
                          </div>
                          <div>{owned} owned</div>
                        </div>
                        <div className="card-actions">
                          <button
                            type="button"
                            className="secondary"
                            disabled={!canDismantle}
                            onClick={() => handleDismantle(item.id)}
                          >
                            Dismantle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="workshop-crafting-section">
                <p className="workshop-label">Recipes</p>
                {renderCraftingRecipes("workshop-crafting-recipes")}
              </div>
              <div className="workshop-crafting-section">
                <p className="workshop-label">Active boosts</p>
                {renderCraftingBoosts("workshop-crafting-boosts")}
              </div>
            </section>
          </div>
        )}
      </section>

      <section
        id="maison"
        role="tabpanel"
        aria-labelledby="maison-tab"
        hidden={activeTab !== "maison"}
      >
        {activeTab === "maison" && (
          <>
            {showMaisonSection && (
              <section
                className={`panel maison-panel ${showMaisonPanel ? "" : "panel-teaser"}`}
                data-testid="maison-panel"
                aria-labelledby="maison-title"
              >
                {showMaisonPanel ? (
                  <>
                    <header className="panel-header">
                      <div>
                        <p className="eyebrow">Meta progression</p>
                        <h3 id="maison-title">Maison</h3>
                        <p className="muted">
                          Prestige the atelier to earn Heritage and strengthen long-term enjoyment.
                        </p>
                      </div>
                      <div className="results-count" data-testid="maison-balance">
                        {state.maisonHeritage.toLocaleString()} Heritage ·{" "}
                        {state.maisonReputation.toLocaleString()} Reputation
                      </div>
                    </header>
                    <div className="workshop-reset maison-reset" data-testid="maison-reset">
                      <div>
                        <p className="workshop-label">Reset threshold</p>
                        <p className="workshop-value">
                          {getEnjoymentThresholdLabel(getMaisonPrestigeThresholdCents())}
                        </p>
                      </div>
                      <div>
                        <p className="workshop-label">Current gain</p>
                        <p className="workshop-value">+{maisonPrestigeGain} Heritage</p>
                      </div>
                      <div>
                        <p className="workshop-label">Legacy credit</p>
                        <p className="workshop-value">+{maisonReputationGain} Reputation</p>
                      </div>
                    </div>
                    <p className="muted maison-reset-detail">
                      Resets Collection + Atelier progress. Maison lines remain active.
                    </p>
                    <fieldset className="workshop-cta">
                      <legend className="visually-hidden">Reset atelier</legend>
                      {maisonResetArmed ? (
                        <div className="workshop-confirm">
                          <button
                            type="button"
                            disabled={!canPrestigeMaison}
                            onClick={() => {
                              if (!canPrestigeMaison) {
                                return;
                              }
                              handlePurchase(prestigeMaison(state));
                              setMaisonResetArmed(false);
                            }}
                          >
                            Confirm prestige
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => setMaisonResetArmed(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="secondary"
                          disabled={!canPrestigeMaison}
                          onClick={() => setMaisonResetArmed(true)}
                        >
                          Prestige atelier
                        </button>
                      )}
                      <p className="muted" aria-live="polite">
                        {maisonResetArmed
                          ? "Confirming resets Collection + Atelier and grants Heritage & Reputation."
                          : canPrestigeMaison
                            ? "Prestiging converts your enjoyment engine into Maison legacy."
                            : "Requires reaching the enjoyment threshold."}
                      </p>
                    </fieldset>
                    <div className="workshop-upgrades">
                      <h4>Maison upgrades</h4>
                      <div className="card-stack">
                        {maisonUpgrades.map((upgrade) => {
                          const owned = state.maisonUpgrades[upgrade.id] ?? false;
                          const canAfford = canBuyMaisonUpgrade(state, upgrade.id);
                          const costLabel =
                            upgrade.currency === "heritage"
                              ? `${upgrade.cost} Heritage`
                              : `${upgrade.cost} Reputation`;
                          const effectLabel = (() => {
                            if (upgrade.incomeMultiplier) {
                              return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% cash`;
                            }
                            if (upgrade.collectionBonusMultiplier) {
                              return `+${Math.round((upgrade.collectionBonusMultiplier - 1) * 100)}% enjoyment`;
                            }
                            if (upgrade.softcapMultiplier) {
                              return `+${Math.round((upgrade.softcapMultiplier - 1) * 100)}% softcap`;
                            }
                            return "Permanent upgrade";
                          })();

                          return (
                            <div
                              className="card workshop-upgrade-card"
                              key={upgrade.id}
                              data-testid="maison-upgrade-card"
                            >
                              <div className="card-header">
                                <div>
                                  <h3>{upgrade.name}</h3>
                                  <p>{upgrade.description}</p>
                                </div>
                                <div>{owned ? "Owned" : costLabel}</div>
                              </div>
                              <p>{effectLabel}</p>
                              <div className="card-actions">
                                <button
                                  type="button"
                                  className="secondary"
                                  disabled={owned || !canAfford}
                                  onClick={() =>
                                    handlePurchase(buyMaisonUpgrade(state, upgrade.id))
                                  }
                                >
                                  {owned ? "Installed" : `Buy (${costLabel})`}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="panel-teaser-content" data-testid="maison-teaser">
                    <p className="eyebrow">Meta progression</p>
                    <h3>Maison</h3>
                    <p className="muted">Your maison is almost ready for legacy prestige.</p>
                    <div className="teaser-progress">
                      <div className="teaser-track">
                        <div
                          className="teaser-fill"
                          style={{ width: `${Math.round(maisonRevealProgress * 100)}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(maisonRevealProgress * 100)}% to Maison reset</span>
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>

      <section
        className="panel catalog-panel"
        id="catalog"
        role="tabpanel"
        aria-labelledby="catalog-tab"
        hidden={activeTab !== "catalog"}
      >
        {activeTab === "catalog" && (
          <>
            <header className="panel-header">
              <div>
                <p className="eyebrow">Archive</p>
                <h2>Catalog</h2>
                <p className="muted">Explore reference pieces and track licensing sources.</p>
              </div>
              <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
                {filteredCatalogEntries.length} results · {discoveredCatalogEntries.length}{" "}
                discovered
              </div>
            </header>
            <form
              className="catalog-filters"
              data-testid="catalog-filters"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="filter-field">
                <label htmlFor="catalog-search">Search</label>
                <input
                  id="catalog-search"
                  data-testid="catalog-search"
                  type="search"
                  placeholder="Search by model, year, tags"
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="catalog-brand">Brand</label>
                <select
                  id="catalog-brand"
                  data-testid="catalog-brand"
                  value={catalogBrand}
                  onChange={(event) => setCatalogBrand(event.target.value)}
                >
                  {catalogBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="catalog-style">Style</label>
                <select
                  id="catalog-style"
                  data-testid="catalog-style"
                  value={catalogStyle}
                  onChange={(event) => setCatalogStyle(event.target.value as typeof catalogStyle)}
                >
                  <option value="all">All</option>
                  <option value="womens">Womens</option>
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="catalog-sort">Sort</label>
                <select
                  id="catalog-sort"
                  data-testid="catalog-sort"
                  value={catalogSort}
                  onChange={(event) => setCatalogSort(event.target.value as typeof catalogSort)}
                >
                  <option value="default">Default</option>
                  <option value="brand">Brand (A→Z)</option>
                  <option value="year">Year (newest→oldest)</option>
                  <option value="tier">Tier (starter→tourbillon)</option>
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="catalog-era">Era</label>
                <select
                  id="catalog-era"
                  data-testid="catalog-era"
                  value={catalogEra}
                  onChange={(event) => setCatalogEra(event.target.value as typeof catalogEra)}
                >
                  <option value="all">All</option>
                  <option value="pre-1970">Pre-1970</option>
                  <option value="1970-1999">1970-1999</option>
                  <option value="2000+">2000+</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="catalog-type">Type</label>
                <select
                  id="catalog-type"
                  data-testid="catalog-type"
                  value={catalogType}
                  onChange={(event) => setCatalogType(event.target.value as typeof catalogType)}
                >
                  <option value="all">All</option>
                  <option value="gmt">GMT</option>
                  <option value="chronograph">Chronograph</option>
                  <option value="dress">Dress</option>
                  <option value="diver">Diver</option>
                </select>
              </div>
              <div className="filter-field" data-testid="catalog-owned-tabs">
                <span className="filter-label">View</span>
                <div className="catalog-tablist" role="tablist" aria-label="Catalog ownership">
                  {(
                    [
                      { id: "unowned", label: "Unowned" },
                      { id: "owned", label: "Owned" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      className={`catalog-tab ${catalogTab === tab.id ? "catalog-tab-active" : ""}`}
                      aria-selected={catalogTab === tab.id}
                      aria-controls={`catalog-${tab.id}`}
                      id={`catalog-${tab.id}-tab`}
                      tabIndex={catalogTab === tab.id ? 0 : -1}
                      onClick={() => setCatalogTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
            <section className="catalog-collection" aria-labelledby="catalog-collection-title">
              <header className="panel-header">
                <div>
                  <p className="eyebrow">Collection book</p>
                  <h3 id="catalog-collection-title">Archive shelf</h3>
                  <p className="muted">Discovered references appear here for quick review.</p>
                </div>
                <div className="results-count" data-testid="catalog-discovered-count">
                  {discoveredCatalogEntries.length} / {catalogEntries.length} discovered
                </div>
              </header>
              {discoveredCatalogEntries.length > 0 ? (
                <div className="catalog-grid" data-testid="catalog-discovered-grid">
                  {discoveredCatalogEntries.map((entry) => {
                    const tags = getCatalogEntryTags(entry);
                    return (
                      <article
                        key={entry.id}
                        className="catalog-card catalog-discovered"
                        data-testid="catalog-card"
                      >
                        <div className="catalog-media">
                          <img
                            src={getCatalogImageUrl(entry)}
                            alt={`${entry.brand} ${entry.model}`}
                            loading="lazy"
                            onError={(event) => {
                              const target = event.currentTarget;
                              const placeholder =
                                "data:image/svg+xml;utf8," +
                                encodeURIComponent(
                                  `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                    `<rect width='100%' height='100%' fill='#131720'/>` +
                                    `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                    `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                    `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                    `</svg>`,
                                );

                              if (target.dataset.fallback !== "true") {
                                target.dataset.fallback = "true";
                                target.src = placeholder;
                              }
                            }}
                          />
                        </div>
                        <div className="catalog-content">
                          <div className="catalog-title">
                            <div>
                              <p className="catalog-brand">{entry.brand}</p>
                              <h3>{entry.model}</h3>
                            </div>
                            <p className="catalog-year">{entry.year}</p>
                          </div>
                          <p>{entry.description}</p>
                          <p className="catalog-tags">{tags.join(" · ")}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="catalog-empty" data-testid="catalog-discovered-empty">
                  No discoveries yet. Track down references in the archive to fill this shelf.
                </p>
              )}
            </section>
            <section
              id="catalog-unowned"
              role="tabpanel"
              aria-labelledby="catalog-unowned-tab"
              hidden={catalogTab !== "unowned"}
            >
              {catalogTab === "unowned" && (
                <div className="catalog-grid" data-testid="catalog-grid">
                  {filteredCatalogEntries.map((entry) => {
                    const discovered = discoveredCatalogIds.includes(entry.id);
                    const tags = getCatalogEntryTags(entry);
                    return (
                      <article
                        key={entry.id}
                        className={`catalog-card ${discovered ? "catalog-discovered" : "catalog-locked"}`}
                        data-testid="catalog-card"
                      >
                        <div className="catalog-media">
                          <img
                            src={getCatalogImageUrl(entry)}
                            alt={`${entry.brand} ${entry.model}`}
                            loading="lazy"
                            onError={(event) => {
                              const target = event.currentTarget;
                              const placeholder =
                                "data:image/svg+xml;utf8," +
                                encodeURIComponent(
                                  `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                    `<rect width='100%' height='100%' fill='#131720'/>` +
                                    `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                    `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                    `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                    `</svg>`,
                                );

                              if (target.dataset.fallback !== "true") {
                                target.dataset.fallback = "true";
                                target.src = placeholder;
                              }
                            }}
                          />
                          {!discovered && <span className="catalog-badge">Undiscovered</span>}
                        </div>
                        <div className="catalog-content">
                          <div className="catalog-title">
                            <div>
                              <p className="catalog-brand">{entry.brand}</p>
                              <h3>{entry.model}</h3>
                            </div>
                            <p className="catalog-year">{entry.year}</p>
                          </div>
                          <p>{entry.description}</p>
                          <p className="catalog-tags">{tags.join(" · ")}</p>
                          <p className="catalog-attribution">{entry.image.attribution}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            <section
              id="catalog-owned"
              role="tabpanel"
              aria-labelledby="catalog-owned-tab"
              hidden={catalogTab !== "owned"}
            >
              {catalogTab === "owned" && (
                <>
                  {!hasOwnedCatalogTiers ? (
                    <p className="catalog-empty" data-testid="catalog-owned-empty">
                      No owned tiers yet—add pieces to your vault to start the archive.
                    </p>
                  ) : (
                    <div className="catalog-grid" data-testid="catalog-grid">
                      {filteredCatalogEntries.map((entry) => {
                        const discovered = discoveredCatalogIds.includes(entry.id);
                        const tags = getCatalogEntryTags(entry);
                        return (
                          <article
                            key={entry.id}
                            className={`catalog-card ${discovered ? "catalog-discovered" : "catalog-locked"}`}
                            data-testid="catalog-card"
                          >
                            <div className="catalog-media">
                              <img
                                src={getCatalogImageUrl(entry)}
                                alt={`${entry.brand} ${entry.model}`}
                                loading="lazy"
                                onError={(event) => {
                                  const target = event.currentTarget;
                                  const placeholder =
                                    "data:image/svg+xml;utf8," +
                                    encodeURIComponent(
                                      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                        `<rect width='100%' height='100%' fill='#131720'/>` +
                                        `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                        `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                        `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                        `</svg>`,
                                    );

                                  if (target.dataset.fallback !== "true") {
                                    target.dataset.fallback = "true";
                                    target.src = placeholder;
                                  }
                                }}
                              />
                              {!discovered && <span className="catalog-badge">Undiscovered</span>}
                            </div>
                            <div className="catalog-content">
                              <div className="catalog-title">
                                <div>
                                  <p className="catalog-brand">{entry.brand}</p>
                                  <h3>{entry.model}</h3>
                                </div>
                                <p className="catalog-year">{entry.year}</p>
                              </div>
                              <p>{entry.description}</p>
                              {entry.facts && entry.facts.length > 0 && (
                                <details className="catalog-facts" data-testid="catalog-facts">
                                  <summary>Collector notes</summary>
                                  <ul>
                                    {entry.facts.map((fact) => (
                                      <li key={fact}>{fact}</li>
                                    ))}
                                  </ul>
                                </details>
                              )}
                              <p className="catalog-tags">{tags.join(" · ")}</p>
                              <p className="catalog-attribution">{entry.image.attribution}</p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="panel catalog-sources" data-testid="catalog-sources">
              <h2>Sources &amp; Licenses</h2>
              <p className="muted">
                Every image in the archive lists its original source and license for compliance.
              </p>

              <ul className="sources-list" data-testid="sources-list">
                {catalogEntries.map((entry) => (
                  <li key={entry.id} data-testid="source-item">
                    <strong className="source-title">
                      {entry.brand} {entry.model}
                    </strong>
                    <span className="muted">{entry.image.attribution}</span>
                    <div className="source-links" data-testid="source-links">
                      <a href={entry.image.sourceUrl} target="_blank" rel="noreferrer">
                        Source
                      </a>
                      {entry.image.licenseUrl ? (
                        <a href={entry.image.licenseUrl} target="_blank" rel="noreferrer">
                          {entry.image.licenseName}
                        </a>
                      ) : (
                        <span>{entry.image.licenseName}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="panel catalog-dealers" data-testid="catalog-dealers">
                <h3>Trusted dealers (external)</h3>
                <p className="muted">
                  Dealer names are provided for reference only; no affiliation or endorsement is
                  implied.
                </p>
                <ul className="card-stack" data-testid="dealer-list">
                  {["Hodinkee", "Crown & Caliber", "WatchBox", "Bob's Watches", "Tourneau"].map(
                    (dealer) => (
                      <li key={dealer}>{dealer}</li>
                    ),
                  )}
                </ul>
              </div>
            </section>
          </>
        )}
      </section>

      <section
        id="stats"
        role="tabpanel"
        aria-labelledby="stats-tab"
        hidden={activeTab !== "stats"}
      >
        {activeTab === "stats" && (
          <div className="panel">
            <h2>Stats</h2>
            <p className="muted">Derived metrics from your current state.</p>
            <dl className="stats-grid" data-testid="stats-metrics">
              <div>
                <dt>Vault cash</dt>
                <dd data-testid="stats-cash">{stats.cash}</dd>
              </div>
              <div>
                <dt>Cash / sec</dt>
                <dd data-testid="stats-cash-rate">{stats.cashRate}</dd>
              </div>
              <div>
                <dt>Enjoyment</dt>
                <dd data-testid="stats-enjoyment">{stats.enjoyment}</dd>
              </div>
              <div>
                <dt>Enjoyment / sec</dt>
                <dd data-testid="stats-enjoyment-rate">{stats.enjoymentRate}</dd>
              </div>
              <div>
                <dt>Memories</dt>
                <dd data-testid="stats-memories">{stats.sentimentalValue}</dd>
              </div>
              <div>
                <dt>Atelier resets</dt>
                <dd data-testid="stats-workshop-prestige">{state.workshopPrestigeCount}</dd>
              </div>
              <div>
                <dt>Maison heritage</dt>
                <dd data-testid="stats-maison-heritage">{state.maisonHeritage}</dd>
              </div>
              <div>
                <dt>Maison reputation</dt>
                <dd data-testid="stats-maison-reputation">{state.maisonReputation}</dd>
              </div>
              <div>
                <dt>Event multiplier</dt>
                <dd data-testid="stats-event-multiplier">x{currentEventMultiplier.toFixed(2)}</dd>
              </div>
            </dl>

            <section className="panel stats-journal" data-testid="stats-journal">
              <h3>Journal</h3>
              <div className="card-stack" data-testid="lore-chapters">
                {(
                  [
                    {
                      id: "collector-shelf",
                      title: "First arrivals",
                      text: "The first pieces find their way into the vault, still warm from wrists and stories. You learn their rhythms, their quirks, and the quiet pull of the next addition.",
                    },
                    {
                      id: "showcase",
                      title: "The cabinet grows",
                      text: "The vault starts to feel curated instead of accidental. A pattern emerges: what you seek, what you keep, and what you let go as the collection takes shape.",
                    },
                    {
                      id: "atelier",
                      title: "Atelier nights",
                      text: "Late hours in the atelier turn maintenance into ritual. Tools, patience, and a little obsession sharpen your eye—and the vault responds in kind.",
                    },
                  ] as const
                )
                  .filter((chapter) => state.unlockedMilestones.includes(chapter.id))
                  .map((chapter) => (
                    <article className="card" key={chapter.id} data-testid="lore-chapter">
                      <h4>{chapter.title}</h4>
                      <p>{chapter.text}</p>
                    </article>
                  ))}
              </div>
            </section>
          </div>
        )}
      </section>

      {windActiveItemId && (
        <div role="dialog" aria-modal="true" className="panel">
          <header className="panel-header">
            <div>
              <h2>Wind the watch</h2>
              <p className="muted">Wind 10 times to trigger a short boost.</p>
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
          <p data-testid="wind-progress">{windProgress} / 10</p>
          <div className="card-actions">
            <button type="button" data-testid="wind-button" onClick={handleWindClick}>
              Wind
            </button>
          </div>
        </div>
      )}

      <section
        className="panel"
        id="save"
        role="tabpanel"
        aria-labelledby="save-tab"
        hidden={activeTab !== "save"}
      >
        {activeTab === "save" && (
          <>
            <h2>Save</h2>
            <div className="controls">
              <button type="button" onClick={handleExport}>
                Export
              </button>
            </div>

            <fieldset className="controls" data-testid="audio-controls">
              <legend>Audio settings</legend>
              <label>
                <input
                  type="checkbox"
                  data-testid="audio-sfx-toggle"
                  checked={audioSettings.sfxEnabled}
                  onChange={(event) => {
                    const nextSettings = {
                      ...audioSettings,
                      sfxEnabled: event.target.checked,
                    };
                    setAudioSettings(nextSettings);
                    window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(nextSettings));
                  }}
                />
                Enable SFX
              </label>
              <label>
                <input
                  type="checkbox"
                  data-testid="audio-bgm-toggle"
                  checked={audioSettings.bgmEnabled}
                  onChange={(event) => {
                    const nextSettings = {
                      ...audioSettings,
                      bgmEnabled: event.target.checked,
                    };
                    setAudioSettings(nextSettings);
                    window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(nextSettings));
                  }}
                />
                Enable BGM
              </label>
            </fieldset>

            <fieldset className="controls" data-testid="settings-controls">
              <legend>Preferences</legend>
              <label>
                Theme mode
                <select
                  data-testid="settings-theme"
                  value={settings.themeMode}
                  onChange={(event) => {
                    persistSettings({
                      ...settings,
                      themeMode: event.target.value as ThemeMode,
                    });
                  }}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  data-testid="settings-hide-achievements"
                  checked={settings.hideCompletedAchievements}
                  onChange={(event) => {
                    persistSettings({
                      ...settings,
                      hideCompletedAchievements: event.target.checked,
                    });
                  }}
                />
                Hide completed achievements
              </label>
              <div className="controls">
                <span className="muted">Visible tabs</span>
                {visibleTabOptions.map((tab) => (
                  <label key={tab.id}>
                    <input
                      type="checkbox"
                      data-testid={`tab-visibility-${tab.id}`}
                      checked={settings.tabVisibility[tab.id]}
                      onChange={(event) => {
                        persistSettings({
                          ...settings,
                          tabVisibility: {
                            ...settings.tabVisibility,
                            [tab.id]: event.target.checked,
                          },
                        });
                      }}
                    />
                    {tab.label}
                  </label>
                ))}
              </div>
              {devSettings.enabled && (
                <div className="controls" data-testid="dev-controls">
                  <span className="muted">Dev mode</span>
                  <label>
                    Speed
                    <select
                      value={String(devSettings.speedMultiplier)}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDevSettings((current) => ({
                          ...current,
                          speedMultiplier: Number.isFinite(value) ? value : 1,
                        }));
                      }}
                    >
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                      <option value="4">4x</option>
                    </select>
                  </label>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        handlePurchase({
                          ...state,
                          currencyCents: state.currencyCents + 500_000,
                        })
                      }
                    >
                      Grant $500k
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        const boostedItems = watchItems.reduce<Record<string, number>>(
                          (acc, item) => {
                            acc[item.id] = Math.max(state.items[item.id] ?? 0, 10);
                            return acc;
                          },
                          {},
                        );
                        handlePurchase({
                          ...state,
                          items: {
                            ...state.items,
                            ...boostedItems,
                          },
                          unlockedMilestones: getMilestones().map((milestone) => milestone.id),
                        });
                      }}
                    >
                      Unlock watches
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        handlePurchase(createInitialState());
                      }}
                    >
                      Reset save
                    </button>
                  </div>
                </div>
              )}
            </fieldset>

            <div className="controls">
              <label htmlFor="import-save-text">Import data</label>
              <textarea
                id="import-save-text"
                rows={3}
                placeholder="Paste exported data here"
                aria-describedby="save-status"
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
              ></textarea>
              <button type="button" onClick={handleImport}>
                Import
              </button>
            </div>

            <output id="save-status" aria-live="polite">
              {saveStatus}
            </output>
          </>
        )}
      </section>
    </main>
  );
}
