import type { GameState } from "../../game/state";
import type { AnchoredTooltipContent } from "../components/AnchoredTooltip";
import { getCraftedBoostPrestigeMultiplier, getMaisonLineBlueprintBonus } from "../../game/state";

export function buildBlueprintTooltip(
  state: GameState,
  blueprintGain: number,
): AnchoredTooltipContent {
  const craftedPercent = Math.round((getCraftedBoostPrestigeMultiplier(state) - 1) * 100);
  const maisonPercent = Math.round(getMaisonLineBlueprintBonus(state) * 100);
  const parts = [
    `Gain +${blueprintGain} Blueprints`,
    craftedPercent > 0 ? `Enjoyment & cash +${craftedPercent}% from crafted boosts` : null,
    maisonPercent > 0 ? `Maison lines add +${maisonPercent}% blueprint yield` : null,
    `Unlocks Atelier tier ${blueprintGain + 1}`,
  ].filter((value): value is string => Boolean(value));
  return {
    title: "Blueprint rewards",
    description: parts.join(" · "),
    meta: `Blueprint gain: +${blueprintGain}`,
  };
}
