import {
  getMaisonLines,
  getMaisonUpgrades,
  getUpgrades,
  getWorkshopUpgrades,
  type GameState,
} from "../../game/state";

type CatalogUpgradeContext = {
  totalUpgradeLevels: number;
  workshopOwned: number;
  workshopTotal: number;
  maisonOwned: number;
  maisonTotal: number;
  maisonLinesActive: number;
  maisonLinesTotal: number;
};

export function getCatalogUpgradeContext(state: GameState): CatalogUpgradeContext {
  const upgrades = getUpgrades();
  const workshopUpgrades = getWorkshopUpgrades();
  const maisonUpgrades = getMaisonUpgrades();
  const maisonLines = getMaisonLines();

  const totalUpgradeLevels = upgrades.reduce(
    (sum, upgrade) => sum + (state.upgrades[upgrade.id] ?? 0),
    0,
  );
  const workshopOwned = workshopUpgrades.filter(
    (upgrade) => state.workshopUpgrades[upgrade.id],
  ).length;
  const maisonOwned = maisonUpgrades.filter((upgrade) => state.maisonUpgrades[upgrade.id]).length;
  const maisonLinesActive = maisonLines.filter((line) => state.maisonLines[line.id]).length;

  return {
    totalUpgradeLevels,
    workshopOwned,
    workshopTotal: workshopUpgrades.length,
    maisonOwned,
    maisonTotal: maisonUpgrades.length,
    maisonLinesActive,
    maisonLinesTotal: maisonLines.length,
  };
}
