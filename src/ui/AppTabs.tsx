import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";

import { CareerTab } from "./tabs/CareerTab";
import { CatalogTab } from "./tabs/CatalogTab";
import { CollectionTab } from "./tabs/CollectionTab";
import { MaisonTab } from "./tabs/MaisonTab";
import { NostalgiaTab } from "./tabs/NostalgiaTab";
import { SaveTab } from "./tabs/SaveTab";
import { StatsTab } from "./tabs/StatsTab";
import { UpgradesTab } from "./tabs/UpgradesTab";
import { WorkshopTab } from "./tabs/WorkshopTab";
import { type NextActionChip } from "./components/NextActionChips";
import { TAB_DEFINITIONS, type TabId } from "./navigation/tabMeta";
import { isTestEnvironment } from "../game/runtime/isTestEnvironment";
import { formatMoneyFromCents, formatSoftcapEfficiency } from "../game/format";
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
  getAutoBuyEnabled,
  getCatalogTierProgress,
  getCatalogTierUnlocks,
  getCatalogTierBonuses,
  getCatalogTierDefinitions,
  getCraftingParts,
  getCraftingRecipes,
  getCraftedBoosts,
  getCraftedBoostCounts,
  getCraftingPartsPerWatch,
  getCraftedBoostIncomeMultiplier,
  getCraftedBoostCollectionMultiplier,
  getCraftedBoostPrestigeMultiplier,
  getWatchItems,
  getWatchModels,
  getUpgrades,
  getAchievements,
  getEvents,
  getWorkshopUpgrades,
  getMaisonUpgrades,
  getMaisonLines,
  getMilestones,
  getNostalgiaUnlockIds,
  getNostalgiaUnlockCost,
  getCatalogEntries,
  getWatchModelOwnedCount,
  getWatchModelPriceCents,
  getWatchModelTierId,
  isCatalogTierUnlocked,
  isItemUnlocked,
  buyWatchModel,
  canCraftBoost,
  craftBoost,
  getAchievementProgressRatio,
  getSoftcapEfficiency,
} from "../game/state";
import { getCatalogEntryTags } from "../game/catalog";
import type { GameState, WatchItemId, InteractionMiniGameMode } from "../game/state";

type CatalogViewMode = "novice" | "expert";

type CatalogFilterState = {
  search: string;
  brand: string;
  style: "all" | "womens";
  sort: "default" | "brand" | "year" | "tier";
  era: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  type: "all" | "gmt" | "manual" | "dress" | "diver";
  tab: "unowned" | "owned";
  viewMode: CatalogViewMode;
};

const CATALOG_FILTERS_KEY = "emily-idle:catalog-filters";

function loadCatalogFilters(): Partial<CatalogFilterState> | null {
  if (typeof window === "undefined" || isTestEnvironment()) return null;
  try {
    const raw = window.localStorage.getItem(CATALOG_FILTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const result: Partial<CatalogFilterState> = {};
    if (typeof parsed.search === "string") result.search = parsed.search;
    if (typeof parsed.brand === "string") result.brand = parsed.brand;
    if (parsed.style === "all" || parsed.style === "womens") result.style = parsed.style;
    if (
      parsed.sort === "default" ||
      parsed.sort === "brand" ||
      parsed.sort === "year" ||
      parsed.sort === "tier"
    )
      result.sort = parsed.sort;
    if (
      parsed.era === "all" ||
      parsed.era === "pre-1970" ||
      parsed.era === "1970-1999" ||
      parsed.era === "2000+" ||
      parsed.era === "unknown"
    )
      result.era = parsed.era;
    if (
      parsed.type === "all" ||
      parsed.type === "gmt" ||
      parsed.type === "manual" ||
      parsed.type === "dress" ||
      parsed.type === "diver"
    )
      result.type = parsed.type;
    if (parsed.tab === "unowned" || parsed.tab === "owned") result.tab = parsed.tab;
    if (parsed.viewMode === "novice" || parsed.viewMode === "expert")
      result.viewMode = parsed.viewMode;
    return result;
  } catch {
    return null;
  }
}

function persistCatalogFilters(filters: CatalogFilterState) {
  if (typeof window === "undefined" || isTestEnvironment()) return;
  try {
    window.localStorage.setItem(CATALOG_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // Ignore persistence errors
  }
}

type AudioSettings = {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
};

type ThemeMode = "system" | "light" | "dark";

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

type DevSettings = {
  enabled: boolean;
  speedMultiplier: number;
};

type AppTabsProps = {
  state: GameState;
  nowMs: number;
  activeTab: TabId;
  onNavigateTo: (tabId: TabId, scrollTargetId?: string) => void;
  onPurchase: (nextState: GameState, meta?: { prestigeTier?: string }) => void;
  onInteract: (itemId: WatchItemId) => void;
  onCraftBoost: (boostId: string) => void;
  settings: Settings;
  persistSettings: (nextSettings: Settings) => void;
  devSettings: DevSettings;
  setDevSettings: React.Dispatch<React.SetStateAction<DevSettings>>;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (nextSettings: AudioSettings) => void;
  importText: string;
  setImportText: (text: string) => void;
  saveStatus: string;
  setSaveStatus: (status: string) => void;
  onExport: () => Promise<void>;
  onImport: () => void;
  onImportFile: (file: File | null) => Promise<void>;
  onClearSave: () => void;
  visibleTabOptions: typeof TAB_DEFINITIONS;
  hiddenTabsSet: Set<TabId>;
  hiddenTabCount: number;
  onRestoreHiddenTabs: () => void;
  autoBuyToggle: boolean;
  onToggleAutoBuy: () => void;
  visibleTabs: typeof TAB_DEFINITIONS;
  emitUxEvent: (eventName: string, detail: Record<string, unknown>) => void;
};

export function AppTabs({
  state,
  nowMs,
  activeTab,
  onNavigateTo,
  onPurchase,
  onInteract,
  onCraftBoost,
  settings,
  persistSettings,
  devSettings,
  setDevSettings,
  audioSettings,
  onUpdateAudioSettings,
  importText,
  setImportText,
  saveStatus,
  setSaveStatus,
  onExport,
  onImport,
  onImportFile,
  onClearSave,
  visibleTabOptions,
  hiddenTabsSet,
  hiddenTabCount,
  onRestoreHiddenTabs,
  autoBuyToggle,
  onToggleAutoBuy,
  visibleTabs,
  emitUxEvent,
}: AppTabsProps) {
  const initialCatalogFilters = useMemo(() => loadCatalogFilters(), []);

  const [catalogSearch, setCatalogSearch] = useState(initialCatalogFilters?.search ?? "");
  const [catalogBrand, setCatalogBrand] = useState(initialCatalogFilters?.brand ?? "All");
  const [catalogStyle, setCatalogStyle] = useState<"all" | "womens">(
    initialCatalogFilters?.style ?? "all",
  );
  const [catalogSort, setCatalogSort] = useState<"default" | "brand" | "year" | "tier">(
    initialCatalogFilters?.sort ?? "default",
  );
  const [catalogEra, setCatalogEra] = useState<
    "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown"
  >(initialCatalogFilters?.era ?? "all");
  const [catalogType, setCatalogType] = useState<"all" | "gmt" | "manual" | "dress" | "diver">(
    initialCatalogFilters?.type ?? "all",
  );
  const [catalogTab, setCatalogTab] = useState<"unowned" | "owned">(
    initialCatalogFilters?.tab ?? "unowned",
  );
  const [catalogViewMode, setCatalogViewMode] = useState<CatalogViewMode>(
    initialCatalogFilters?.viewMode ?? "novice",
  );
  const [workshopResetArmed, setWorkshopResetArmed] = useState(false);
  const [maisonResetArmed, setMaisonResetArmed] = useState(false);
  const [nostalgiaModalOpen, setNostalgiaModalOpen] = useState(false);
  const [nostalgiaResultsDismissed, setNostalgiaResultsDismissed] = useState(false);
  const [nostalgiaUnlockPending, setNostalgiaUnlockPending] = useState<WatchItemId | null>(null);

  // Persist catalog filters when they change
  useEffect(() => {
    persistCatalogFilters({
      search: catalogSearch,
      brand: catalogBrand,
      style: catalogStyle,
      sort: catalogSort,
      era: catalogEra,
      type: catalogType,
      tab: catalogTab,
      viewMode: catalogViewMode,
    });
  }, [
    catalogSearch,
    catalogBrand,
    catalogStyle,
    catalogSort,
    catalogEra,
    catalogType,
    catalogTab,
    catalogViewMode,
  ]);

  const watchItems = useMemo(() => getWatchItems(), []);
  const watchModels = useMemo(() => getWatchModels(), []);
  const milestones = useMemo(() => getMilestones(), []);
  const upgrades = useMemo(() => getUpgrades(), []);
  const achievements = useMemo(() => getAchievements(), []);
  const events = useMemo(() => getEvents(), []);
  const workshopUpgrades = useMemo(() => getWorkshopUpgrades(), []);
  const maisonUpgrades = useMemo(() => getMaisonUpgrades(), []);
  const catalogEntries = useMemo(() => getCatalogEntries(), []);
  const maisonLines = useMemo(() => getMaisonLines(), []);
  const catalogTierDefinitions = useMemo(() => getCatalogTierDefinitions(), []);
  const catalogTierProgress = useMemo(() => getCatalogTierProgress(state), [state]);
  const catalogTierUnlocks = useMemo(() => getCatalogTierUnlocks(state), [state]);
  const catalogTierBonuses = useMemo(() => getCatalogTierBonuses(state), [state]);
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
  const nostalgiaUnlockIds = useMemo(() => getNostalgiaUnlockIds(), []);

  const currentEventMultiplier = useMemo(
    () => getEventIncomeMultiplier(state, nowMs),
    [state, nowMs],
  );

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

  const activeCoachmarks = useMemo(
    () => coachmarks.filter((mark) => !settings.coachmarksDismissed[mark.id]),
    [coachmarks, settings.coachmarksDismissed],
  );

  const workshopRevealProgress = Math.min(
    1,
    state.enjoymentCents / getWorkshopPrestigeThresholdCents(),
  );
  const maisonRevealProgress = Math.min(
    1,
    state.enjoymentCents / getMaisonPrestigeThresholdCents(),
  );

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

  const hiddenTabsSetMemo = useMemo(() => new Set(settings.hiddenTabs), [settings.hiddenTabs]);

  const HIDEABLE_TAB_IDS: TabId[] = ["career", "catalog", "workshop", "maison", "stats"];

  const combinedTabVisibility = useMemo(
    () => ({
      collection: true,
      save: true,
      nostalgia: tabVisibility.nostalgia,
      career: tabVisibility.career && !hiddenTabsSetMemo.has("career"),
      upgrades: tabVisibility.upgrades,
      catalog: tabVisibility.catalog && !hiddenTabsSetMemo.has("catalog"),
      stats: tabVisibility.stats && !hiddenTabsSetMemo.has("stats"),
      workshop: tabVisibility.workshop && !hiddenTabsSetMemo.has("workshop"),
      maison: tabVisibility.maison && !hiddenTabsSetMemo.has("maison"),
    }),
    [hiddenTabsSetMemo, tabVisibility],
  );

  const watchModelDefaults = useMemo(() => {
    const defaults = new Map<WatchItemId, string>();
    for (const model of watchModels) {
      if (!defaults.has(model.tierId)) {
        defaults.set(model.tierId, model.id);
      }
    }
    return defaults;
  }, [watchModels]);

  const watchItemsById = useMemo(
    () => new Map(watchItems.map((item) => [item.id, item])),
    [watchItems],
  );

  const watchItemLabels = useMemo(
    () => new Map(watchItems.map((item) => [item.id, item.name])),
    [watchItems],
  );

  const catalogBrands = useMemo(() => {
    return ["All", ...new Set(catalogEntries.map((entry) => entry.brand))];
  }, [catalogEntries]);

  const hasOwnedCatalogTiers = Object.values(state.watchModels).some((count) => count > 0);

  const archiveCuratorMilestone = milestones.find(
    (milestone) => milestone.id === "archive-curator",
  );
  const archiveCuratorThreshold =
    archiveCuratorMilestone?.requirement.type === "catalogDiscovery"
      ? archiveCuratorMilestone.requirement.threshold
      : 0;
  const archiveCuratorProgress = Math.min(0, archiveCuratorThreshold);
  const archiveCuratorUnlocked = state.unlockedMilestones.includes("archive-curator");

  const filteredCatalogEntries = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const filteredByOwnership = catalogEntries.filter((entry) => {
      if (catalogTab === "owned") {
        return getWatchModelOwnedCount(state, entry.id) > 0;
      }
      const tierId = getWatchModelTierId(entry.id);
      return isCatalogTierUnlocked(state, tierId);
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
      if (tags.includes("quartz")) {
        return 0;
      }
      if (tags.includes("automatic")) {
        return 1;
      }
      if (tags.includes("manual")) {
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

  const autoBuyUnlocked = useMemo(() => getAutoBuyEnabled(state), [state]);
  const autoBuyEnabled = autoBuyUnlocked && autoBuyToggle;

  const showMaisonLines = useMemo(
    () => state.maisonHeritage > 0 || state.maisonReputation > 0 || canPrestigeMaison,
    [state.maisonHeritage, state.maisonReputation, canPrestigeMaison],
  );

  const showSetBonusesSection = true;

  const showCraftingSection = useMemo(
    () => (craftingParts ?? 0) > 0 || showWorkshopSection,
    [craftingParts, showWorkshopSection],
  );

  const showMilestonesSection = useMemo(
    () => milestones.some((m) => getAchievementProgressRatio(state, m.id as any) > 0),
    [state, milestones],
  );

  const showAchievementsSection = useMemo(
    () => achievements.some((a) => getAchievementProgressRatio(state, a.id) > 0),
    [state, achievements],
  );

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
                onClick={() => onCraftBoost(recipe.id)}
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

  const maisonReputationGain = useMemo(() => getMaisonReputationGain(state), [state]);

  const pendingNostalgiaUnlock = nostalgiaUnlockPending
    ? (watchItemsById.get(nostalgiaUnlockPending) ?? null)
    : null;
  const pendingNostalgiaUnlockCost = nostalgiaUnlockPending
    ? getNostalgiaUnlockCost(nostalgiaUnlockPending)
    : 0;

  const catalogTierBonusMultiplier = useMemo(
    () => catalogTierBonuses.reduce((total, bonus) => total * bonus.incomeMultiplier, 1),
    [catalogTierBonuses],
  );

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

  const prestigeComparisonInfo = {
    atelier: {
      visible: showWorkshopSection,
      ratio: workshopRevealProgress,
      gain: workshopPrestigeGain,
      thresholdCents: getWorkshopPrestigeThresholdCents(),
      resetsWhat: ["Current run cash and enjoyment", "Owned watches", "Run momentum"],
      carriesWhat: ["Atelier upgrades", "Crafting progress", "Maison & Nostalgia"],
    },
    maison: {
      visible: showMaisonSection,
      ratio: maisonRevealProgress,
      gain: maisonPrestigeGain,
      thresholdCents: getMaisonPrestigeThresholdCents(),
      resetsWhat: ["Everything Atelier resets", "Atelier upgrades", "Blueprints"],
      carriesWhat: ["Maison heritage", "Maison reputation", "Nostalgia progress"],
    },
    nostalgia: {
      visible: showNostalgiaSection,
      ratio: nostalgiaProgress,
      gain: nostalgiaPrestigeGain,
      thresholdCents: nostalgiaPrestigeThreshold,
      resetsWhat: ["Everything Maison resets", "Maison bonuses", "Deep progression"],
      carriesWhat: ["Nostalgia unlocks", "Permanent bonuses"],
    },
  };

  return (
    <>
      <CollectionTab
        isActive={activeTab === "collection"}
        state={state}
        onNavigate={onNavigateTo}
        watchItemLabels={watchItemLabels}
        autoBuyUnlocked={autoBuyUnlocked}
        autoBuyEnabled={autoBuyEnabled}
        onToggleAutoBuy={onToggleAutoBuy}
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
        onPurchase={onPurchase}
        showSetBonusesSection={showSetBonusesSection}
        showCraftingSection={showCraftingSection}
        showMilestonesSection={showMilestonesSection}
        showAchievementsSection={showAchievementsSection}
        showEventsSection={false}
        prestigeComparisonInfo={prestigeComparisonInfo}
      />

      <CatalogTab
        isActive={activeTab === "catalog"}
        state={state}
        onNavigate={onNavigateTo}
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
        catalogViewMode={catalogViewMode}
        onCatalogViewModeChange={setCatalogViewMode}
        catalogBrands={catalogBrands}
        filteredCatalogEntries={filteredCatalogEntries}
        catalogEntries={catalogEntries}
        hasOwnedCatalogTiers={hasOwnedCatalogTiers}
        onPurchase={onPurchase}
        nowMs={nowMs}
        currentEventMultiplier={currentEventMultiplier}
        onInteract={onInteract}
        atelierUnlocked={showWorkshopPanel}
      />

      <CareerTab
        isActive={activeTab === "career"}
        state={state}
        nowMs={nowMs}
        onNavigate={onNavigateTo}
        onPurchase={onPurchase}
      />

      <UpgradesTab
        isActive={activeTab === "upgrades"}
        state={state}
        currentEventMultiplier={currentEventMultiplier}
        nowMs={nowMs}
        upgrades={upgrades}
        workshopUpgrades={workshopUpgrades}
        maisonUpgrades={maisonUpgrades}
        onPurchase={onPurchase}
      />

      <WorkshopTab
        isActive={activeTab === "workshop"}
        state={state}
        showWorkshopSection={showWorkshopSection}
        showWorkshopPanel={showWorkshopPanel}
        onNavigate={onNavigateTo}
        workshopPrestigeGain={workshopPrestigeGain}
        workshopRevealProgress={workshopRevealProgress}
        workshopResetArmed={workshopResetArmed}
        onToggleWorkshopResetArmed={(next) => setWorkshopResetArmed(next)}
        canPrestigeWorkshop={canPrestigeWorkshop}
        onPurchase={onPurchase}
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
        onNavigate={onNavigateTo}
        maisonPrestigeGain={maisonPrestigeGain}
        maisonReputationGain={maisonReputationGain}
        maisonRevealProgress={maisonRevealProgress}
        maisonResetArmed={maisonResetArmed}
        onToggleMaisonResetArmed={(next) => setMaisonResetArmed(next)}
        canPrestigeMaison={canPrestigeMaison}
        onPurchase={onPurchase}
        maisonUpgrades={maisonUpgrades}
      />

      <NostalgiaTab
        isActive={activeTab === "nostalgia"}
        state={state}
        showNostalgiaSection={showNostalgiaSection}
        showNostalgiaPanel={showNostalgiaPanel}
        onNavigate={onNavigateTo}
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
        onPurchase={onPurchase}
      />

      <StatsTab
        isActive={activeTab === "stats"}
        state={state}
        stats={stats}
        currentEventMultiplier={currentEventMultiplier}
        onNavigate={onNavigateTo}
      />

      <SaveTab
        isActive={activeTab === "save"}
        state={state}
        watchItems={watchItems}
        audioSettings={audioSettings}
        onUpdateAudioSettings={onUpdateAudioSettings}
        settings={settings}
        persistSettings={persistSettings}
        visibleTabOptions={visibleTabOptions}
        hiddenTabsSet={hiddenTabsSet}
        hiddenTabCount={hiddenTabCount}
        onRestoreHiddenTabs={onRestoreHiddenTabs}
        devSettings={devSettings}
        setDevSettings={setDevSettings}
        onPurchase={onPurchase}
        importText={importText}
        onImportTextChange={setImportText}
        onExport={onExport}
        onImport={onImport}
        onImportFile={onImportFile}
        saveStatus={saveStatus}
        onClearSave={onClearSave}
      />
    </>
  );
}
