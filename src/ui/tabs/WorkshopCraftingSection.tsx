import React from "react";

import { dismantleItem, getItemCount } from "../../game/state";
import type { GameState, WatchItemDefinition, WatchItemId } from "../../game/state";

type WorkshopCraftingSectionProps = {
  state: GameState;
  showWorkshopPanel: boolean;
  craftingParts: number;
  watchItems: ReadonlyArray<WatchItemDefinition>;
  craftingPartsPerWatch: Record<WatchItemId, number>;
  onPurchase: (nextState: GameState) => void;
  renderCraftingRecipes: (testId: string) => React.ReactNode;
  renderCraftingBoosts: (testId: string) => React.ReactNode;
};

export function WorkshopCraftingSection({
  state,
  showWorkshopPanel,
  craftingParts,
  watchItems,
  craftingPartsPerWatch,
  onPurchase,
  renderCraftingRecipes,
  renderCraftingBoosts,
}: WorkshopCraftingSectionProps) {
  return (
    <section className="panel workshop-crafting" data-testid="workshop-crafting">
      <h3>Crafting workshop</h3>
      <p className="muted">
        Break down watches into parts, then craft permanent collection boosts.
      </p>
      <div className="results-count" data-testid="workshop-crafting-parts">
        {craftingParts} parts
      </div>
      {showWorkshopPanel ? (
        <div className="workshop-crafting-section" data-testid="workshop-dismantle">
          <p className="workshop-label">Dismantle watches</p>
          <p className="muted">Convert owned watches into parts for recipes.</p>
          <div className="card-stack" data-testid="workshop-dismantle-list">
            {watchItems.map((item) => {
              const owned = getItemCount(state, item.id);
              const partsPerWatch = craftingPartsPerWatch[item.id] ?? 0;
              const canDismantle = owned > 1 && partsPerWatch > 0;
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
                      onClick={() => onPurchase(dismantleItem(state, item.id, 1))}
                    >
                      Dismantle (+{partsPerWatch} parts)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="workshop-crafting-section" data-testid="workshop-dismantle-locked">
          <p className="workshop-label">Dismantle watches</p>
          <p className="muted">
            Dismantling unlocks with Atelier resets. Reach the reset threshold to begin.
          </p>
          <div className="card" aria-hidden="true">
            <div className="card-header">
              <div>
                <h4>Locked</h4>
                <p>Unlock after your first Atelier reset.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="workshop-crafting-section">
        <p className="workshop-label">Recipes</p>
        {renderCraftingRecipes("workshop-crafting-recipes")}
      </div>
      <div className="workshop-crafting-section">
        <p className="workshop-label">Active boosts</p>
        {renderCraftingBoosts("workshop-crafting-boosts")}
      </div>
    </section>
  );
}
