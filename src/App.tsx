import React, { useEffect, useMemo, useRef, useState } from "react";

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
  buyItem,
  buyMaisonUpgrade,
  buyUpgrade,
  buyWorkshopUpgrade,
  canBuyItem,
  canBuyMaisonUpgrade,
  canBuyUpgrade,
  canBuyWorkshopUpgrade,
  canWorkshopPrestige,
  createInitialState,
  getAchievements,
  getActiveSetBonuses,
  getCatalogEntries,
  getAutoBuyEnabled,
  getCollectionValueCents,
  getEffectiveIncomeRateCentsPerSec,
  getEventIncomeMultiplier,
  getEventStatusLabel,
  getEvents,
  getItemPriceCents,
  getMaisonPrestigeGain,
  getMaisonUpgrades,
  getMaxAffordableItemCount,
  getMilestoneRequirementLabel,
  getMilestones,
  getSetBonuses,
  getSoftcapEfficiency,
  getUpgrades,
  getUpgradePriceCents,
  getWatchItems,
  getWorkshopPrestigeGain,
  getWorkshopUpgrades,
  isEventActive,
  isItemUnlocked,
  isUpgradeUnlocked,
  prestigeMaison,
  prestigeWorkshop,
} from "./game/state";
import type { GameState } from "./game/state";
import { SIM_TICK_MS, step } from "./game/sim";

const MAX_FRAME_DELTA_MS = 250;
const AUTO_SAVE_INTERVAL_MS = 2_000;

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [saveStatus, setSaveStatus] = useState("");
  const [importText, setImportText] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogBrand, setCatalogBrand] = useState("All");
  const [workshopResetArmed, setWorkshopResetArmed] = useState(false);
  const [maisonResetArmed, setMaisonResetArmed] = useState(false);
  const [autoBuyToggle, setAutoBuyToggle] = useState(true);
  const saveDirtyRef = useRef(false);
  const lastSavedAtMsRef = useRef(0);
  const lastFrameAtMsRef = useRef<number | null>(null);
  const accumulatorMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);

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
  }, []);

  useEffect(() => {
    const frame = (nowMs: number) => {
      let stepped = false;

      if (lastFrameAtMsRef.current !== null) {
        const rawElapsedMs = nowMs - lastFrameAtMsRef.current;
        const elapsedMs = Math.max(0, Math.min(rawElapsedMs, MAX_FRAME_DELTA_MS));

        accumulatorMsRef.current += elapsedMs;

        while (accumulatorMsRef.current >= SIM_TICK_MS) {
          stepped = true;
          setState((current: GameState) => step(current, SIM_TICK_MS));
          accumulatorMsRef.current -= SIM_TICK_MS;
        }
      }

      lastFrameAtMsRef.current = nowMs;

      if (stepped) {
        saveDirtyRef.current = true;
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
  }, []);

  const persistNow = (reason: string) => {
    const nowMs = Date.now();
    const result = persistSaveToLocalStorage(state, nowMs);

    if (!result.ok) {
      console.warn(`Autosave failed (${reason}). ${result.error}`);
      setSaveStatus(`Save failed: ${result.error}`);
      return;
    }

    lastSavedAtMsRef.current = nowMs;
    saveDirtyRef.current = false;
  };

  const handlePurchase = (nextState: GameState) => {
    if (nextState !== state) {
      setState(nextState);
      saveDirtyRef.current = true;
      persistNow("purchase");
    }
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
    persistNow("import");
    setSaveStatus(`Imported save from ${decoded.save.savedAt}.`);
  };

  const stats = useMemo(() => {
    return {
      currency: formatMoneyFromCents(state.currencyCents),
      income: formatRateFromCentsPerSec(getEffectiveIncomeRateCentsPerSec(state)),
      collectionValue: formatMoneyFromCents(getCollectionValueCents(state)),
      softcap: formatSoftcapEfficiency(getSoftcapEfficiency(state)),
    };
  }, [state]);

  const watchItems = useMemo(() => getWatchItems(), []);
  const milestones = useMemo(() => getMilestones(), []);
  const upgrades = useMemo(() => getUpgrades(), []);
  const setBonuses = useMemo(() => getSetBonuses(), []);
  const achievements = useMemo(() => getAchievements(), []);
  const events = useMemo(() => getEvents(), []);
  const workshopUpgrades = useMemo(() => getWorkshopUpgrades(), []);
  const maisonUpgrades = useMemo(() => getMaisonUpgrades(), []);
  const catalogEntries = useMemo(() => getCatalogEntries(), []);
  const activeBonuses = useMemo(() => getActiveSetBonuses(state), [state]);
  const workshopPrestigeGain = useMemo(() => getWorkshopPrestigeGain(state), [state]);
  const maisonPrestigeGain = useMemo(() => getMaisonPrestigeGain(state), [state]);
  const canPrestigeWorkshop = useMemo(() => canWorkshopPrestige(state), [state]);
  const canPrestigeMaison = useMemo(() => maisonPrestigeGain > 0, [maisonPrestigeGain]);
  const nowMs = useMemo(() => Date.now(), [state]);
  const currentEventMultiplier = useMemo(
    () => getEventIncomeMultiplier(state, nowMs),
    [state, nowMs],
  );
  const catalogBrands = useMemo(() => {
    return ["All", ...new Set(catalogEntries.map((entry) => entry.brand))];
  }, [catalogEntries]);
  const filteredCatalogEntries = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return catalogEntries.filter((entry) => {
      const matchesBrand = catalogBrand === "All" || entry.brand === catalogBrand;
      const matchesQuery =
        query.length === 0 ||
        `${entry.brand} ${entry.model} ${entry.description} ${entry.year} ${entry.tags.join(" ")}`
          .toLowerCase()
          .includes(query);
      return matchesBrand && matchesQuery;
    });
  }, [catalogEntries, catalogBrand, catalogSearch]);

  const autoBuyUnlocked = useMemo(() => getAutoBuyEnabled(state), [state]);
  const autoBuyEnabled = autoBuyUnlocked && autoBuyToggle;

  useEffect(() => {
    if (!autoBuyUnlocked) {
      setAutoBuyToggle(false);
    }
  }, [autoBuyUnlocked]);

  useEffect(() => {
    if (!autoBuyEnabled) {
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

      return nextState;
    });
  }, [autoBuyEnabled, state.currencyCents, state.unlockedMilestones, watchItems]);

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="eyebrow">Collection loop</p>
          <h1>Watch Idle</h1>
          <p className="muted">Build your vault, unlock new lines, and stack bonuses.</p>
          <nav className="page-nav" aria-label="Primary">
            <a className="page-nav-link" href="#collection">
              Collection
            </a>
            <a className="page-nav-link" href="#workshop">
              Workshop
            </a>
            <a className="page-nav-link" href="#maison">
              Maison
            </a>
            <a className="page-nav-link" href="#catalog">
              Catalog
            </a>
            <a className="page-nav-link" href="#save">
              Save
            </a>
          </nav>
        </div>
        <section aria-label="Vault stats" className="stats">
          <dl>
            <div>
              <dt>Vault cash</dt>
              <dd id="currency">{stats.currency}</dd>
            </div>
            <div>
              <dt>Income</dt>
              <dd id="income">{stats.income}</dd>
            </div>
            <div>
              <dt>Collection value</dt>
              <dd id="collection-value">{stats.collectionValue}</dd>
            </div>
            <div>
              <dt>Softcap</dt>
              <dd id="softcap">{stats.softcap}</dd>
            </div>
          </dl>
        </section>
      </header>

      <section className="collection" aria-label="Collection" id="collection">
        <div>
          <h2>Collection</h2>
          <p className="muted">Acquire pieces to unlock the next tier.</p>
          <div className="automation-toggle" role="group" aria-label="Automation controls">
            <p className="automation-label">Automation</p>
            {autoBuyUnlocked ? (
              <button
                type="button"
                className={autoBuyEnabled ? "" : "secondary"}
                onClick={() => setAutoBuyToggle((value) => !value)}
              >
                {autoBuyEnabled ? "Auto-buy on" : "Auto-buy off"}
              </button>
            ) : (
              <p className="muted">Unlock automation with Workshop blueprints.</p>
            )}
          </div>
          <div id="collection-list" className="card-stack">
            {watchItems.map((item) => {
              const owned = state.items[item.id] ?? 0;
              const price = getItemPriceCents(state, item.id, 1);
              const maxAffordable = getMaxAffordableItemCount(state, item.id);
              const bulkQty = Math.min(10, Math.max(1, maxAffordable));
              const bulkPrice = getItemPriceCents(state, item.id, bulkQty);
              const unlocked = isItemUnlocked(state, item.id);

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
                    {formatRateFromCentsPerSec(item.incomeCentsPerSec)} each · Value{" "}
                    {formatMoneyFromCents(item.collectionValueCents)}
                  </p>
                  <div className="card-actions">
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
                      disabled={bulkQty <= 1 || !canBuyItem(state, item.id, bulkQty) || !unlocked}
                      onClick={() => handlePurchase(buyItem(state, item.id, bulkQty))}
                    >
                      Buy {bulkQty} ({formatMoneyFromCents(bulkPrice)})
                    </button>
                    {!unlocked && (
                      <div className="unlock-tag">
                        Unlocks with {getMilestoneRequirementLabel(item.unlockMilestoneId!)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="side-panel">
          <div
            className="panel workshop-panel"
            aria-label="Workshop"
            data-testid="workshop-panel"
            id="workshop"
          >
            <header className="panel-header">
              <div>
                <p className="eyebrow">Reset loop</p>
                <h3>Workshop</h3>
                <p className="muted">Trade collection value for Blueprints and permanent boosts.</p>
              </div>
              <div className="results-count" data-testid="workshop-balance">
                {state.workshopBlueprints.toLocaleString()} Blueprints
              </div>
            </header>
            <div className="workshop-reset" data-testid="workshop-reset">
              <div>
                <p className="workshop-label">Reset threshold</p>
                <p className="workshop-value">$800,000 collection value</p>
              </div>
              <div>
                <p className="workshop-label">Current gain</p>
                <p className="workshop-value">+{workshopPrestigeGain} Blueprints</p>
              </div>
            </div>
            <div className="workshop-cta" role="group" aria-label="Reset vault">
              {workshopResetArmed ? (
                <div className="workshop-confirm">
                  <button
                    type="button"
                    aria-label="Confirm reset"
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
                  Reset vault
                </button>
              )}
              <p className="muted" aria-live="polite">
                {workshopResetArmed
                  ? "Confirming will reset progress and grant Blueprints."
                  : canPrestigeWorkshop
                    ? "Resetting trades your vault for Blueprints and permanent boosts."
                    : "Requires reaching the reset threshold."}
              </p>
            </div>
            <div className="workshop-upgrades" aria-label="Workshop upgrades">
              <h4>Upgrades</h4>
              <div className="card-stack">
                {workshopUpgrades.map((upgrade) => {
                  const owned = state.workshopUpgrades[upgrade.id] ?? false;
                  const canAfford = canBuyWorkshopUpgrade(state, upgrade.id);
                  const effectLabel = (() => {
                    if (upgrade.incomeMultiplier) {
                      return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% income`;
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
                          onClick={() => handlePurchase(buyWorkshopUpgrade(state, upgrade.id))}
                        >
                          {owned ? "Installed" : `Buy (${upgrade.blueprintCost} Blueprints)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="panel maison-panel"
            aria-label="Maison"
            data-testid="maison-panel"
            id="maison"
          >
            <header className="panel-header">
              <div>
                <p className="eyebrow">Meta progression</p>
                <h3>Maison</h3>
                <p className="muted">Prestige the workshop to earn Heritage and grow your house.</p>
              </div>
              <div className="results-count" data-testid="maison-balance">
                {state.maisonHeritage.toLocaleString()} Heritage ·{" "}
                {state.maisonReputation.toLocaleString()} Reputation
              </div>
            </header>
            <div className="workshop-reset maison-reset" data-testid="maison-reset">
              <div>
                <p className="workshop-label">Reset threshold</p>
                <p className="workshop-value">$4,000,000 collection value</p>
              </div>
              <div>
                <p className="workshop-label">Current gain</p>
                <p className="workshop-value">+{maisonPrestigeGain} Heritage</p>
              </div>
            </div>
            <div className="workshop-cta" role="group" aria-label="Reset workshop">
              {maisonResetArmed ? (
                <div className="workshop-confirm">
                  <button
                    type="button"
                    aria-label="Confirm reset"
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
                  Prestige workshop
                </button>
              )}
              <p className="muted" aria-live="polite">
                {maisonResetArmed
                  ? "Confirming will reset Workshop progress and grant Heritage."
                  : canPrestigeMaison
                    ? "Prestiging resets Workshop + Collection for Maison currency."
                    : "Requires reaching the Maison threshold."}
              </p>
            </div>
            <div className="workshop-upgrades" aria-label="Maison upgrades">
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
                      return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% income`;
                    }
                    if (upgrade.collectionBonusMultiplier) {
                      return `+${Math.round((upgrade.collectionBonusMultiplier - 1) * 100)}% collection bonuses`;
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
                          onClick={() => handlePurchase(buyMaisonUpgrade(state, upgrade.id))}
                        >
                          {owned ? "Installed" : `Buy (${costLabel})`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
                    <p>+{Math.round(upgrade.incomeMultiplierPerLevel * 100)}% income per level</p>
                    <div className="card-actions">
                      <button
                        type="button"
                        disabled={!canBuyUpgrade(state, upgrade.id, 1) || !unlocked}
                        onClick={() => handlePurchase(buyUpgrade(state, upgrade.id))}
                      >
                        Upgrade ({formatMoneyFromCents(price)})
                      </button>
                      {!unlocked && (
                        <div className="unlock-tag">
                          Unlocks with {getMilestoneRequirementLabel(upgrade.unlockMilestoneId!)}
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
              {achievements.map((achievement) => {
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
              Live boosts cycle in and out. Current multiplier x{currentEventMultiplier.toFixed(2)}.
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
            <div id="set-bonus-list" className="card-stack">
              {setBonuses.map((bonus) => {
                const active = activeBonuses.some((entry) => entry.id === bonus.id);
                return (
                  <div className="card" key={bonus.id}>
                    <h3>{bonus.name}</h3>
                    <p>{bonus.description}</p>
                    <p className="muted">
                      {active
                        ? `Active (+${Math.round((bonus.incomeMultiplier - 1) * 100)}%)`
                        : "Inactive"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>

      <section aria-label="Catalog" className="panel catalog-panel" id="catalog">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Archive</p>
            <h2>Catalog</h2>
            <p className="muted">Explore reference pieces and track licensing sources.</p>
          </div>
          <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
            {filteredCatalogEntries.length} results
          </div>
        </header>
        <div className="catalog-filters" role="search" data-testid="catalog-filters">
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
        </div>
        <div className="catalog-grid" data-testid="catalog-grid">
          {filteredCatalogEntries.map((entry) => (
            <article key={entry.id} className="catalog-card" data-testid="catalog-card">
              <div className="catalog-media">
                <img
                  src={entry.image.url}
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
                <p className="catalog-tags">{entry.tags.join(" · ")}</p>
                <p className="catalog-attribution">{entry.image.attribution}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-label="Sources and licenses"
        className="panel catalog-sources"
        data-testid="catalog-sources"
      >
        <h2>Sources &amp; Licenses</h2>
        <p className="muted">
          Every image in the archive lists its original source and license for compliance.
        </p>
        <ul className="sources-list" data-testid="sources-list">
          {catalogEntries.map((entry) => (
            <li key={entry.id} data-testid="source-item">
              <div className="source-title">
                <strong>{entry.brand}</strong> · {entry.model}
              </div>
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
      </section>

      <section aria-label="Save" className="panel" id="save">
        <h2>Save</h2>
        <div className="controls">
          <button type="button" onClick={handleExport}>
            Export
          </button>
        </div>

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

        <p id="save-status" role="status" aria-live="polite">
          {saveStatus}
        </p>
      </section>
    </main>
  );
}
