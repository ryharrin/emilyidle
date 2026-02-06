import { CatalogEntry } from "../../../game/catalog";
import type { TierBadgeDefinition } from "../../../game/tierBadges";
import { TierBadge } from "../TierBadge";

import "./catalogCompare.css";

export type CompareSlotPayload = {
  entry: CatalogEntry;
  movementLabel: string;
  priceLabel: string;
  gateDescription: string;
  tierBadge?: TierBadgeDefinition;
  enjoymentLabel: string;
  cashLabel: string;
  ready: boolean;
};

type WatchComparePanelProps = {
  slots: [CompareSlotPayload | null, CompareSlotPayload | null];
  onClearSlot: (index: number) => void;
  onClearAll: () => void;
  onSwap?: () => void;
};

const SLOT_LABELS = ["A", "B"] as const;

export function WatchComparePanel({
  slots,
  onClearSlot,
  onClearAll,
  onSwap,
}: WatchComparePanelProps) {
  const filledSlots = slots.filter(Boolean).length;

  return (
    <section className="compare-panel" data-testid="catalog-compare-panel">
      <header className="compare-panel-header">
        <div>
          <p className="eyebrow">Compare watches</p>
          <h3>Side-by-side stats</h3>
        </div>
        <div className="compare-panel-controls">
          <button
            type="button"
            className="secondary compare-panel-control"
            id="compare-clear-all"
            onClick={onClearAll}
            disabled={filledSlots === 0}
          >
            Clear all
          </button>
          {onSwap && filledSlots === 2 && (
            <button type="button" className="tertiary compare-panel-control" onClick={onSwap}>
              Swap order
            </button>
          )}
        </div>
      </header>
      <div className="compare-panel-body">
        {slots.map((slot, index) => {
          const slotId = SLOT_LABELS[index];
          if (!slot) {
            return (
              <div
                key={`empty-${slotId}`}
                className="compare-slot compare-slot-empty"
                id={`compare-slot-${slotId.toLowerCase()}`}
              >
                <div
                  className="compare-slot-placeholder"
                  data-testid={`compare-slot-${slotId}-empty`}
                >
                  <p className="compare-slot-label">Slot {slotId}</p>
                  <p>Add a watch to compare with slot {slotId === "A" ? "B" : "A"}.</p>
                </div>
              </div>
            );
          }

          return (
            <article
              key={slot.entry.id}
              className={`compare-slot ${slot.ready ? "compare-slot-ready" : ""}`}
              id={`compare-slot-${slotId.toLowerCase()}`}
              data-testid={`compare-slot-${slotId}`}
            >
              <header className="compare-slot-header">
                <div>
                  <p className="compare-slot-label">Slot {slotId}</p>
                  <h4>
                    {slot.entry.brand} {slot.entry.model}
                  </h4>
                  <span className="compare-slot-movement">{slot.movementLabel}</span>
                </div>
                <div className="compare-slot-actions">
                  <button
                    type="button"
                    className="compare-slot-clear"
                    onClick={() => onClearSlot(index)}
                    aria-label={`Clear compare slot ${slotId}`}
                  >
                    Clear slot
                  </button>
                  {slot.tierBadge && (
                    <TierBadge
                      tier={slot.tierBadge.category}
                      showLabel
                      label={slot.tierBadge.label}
                      description={slot.tierBadge.description}
                    />
                  )}
                </div>
              </header>
              <div className="compare-slot-main">
                <div className="compare-stat">
                  <span className="compare-stat-label">Price</span>
                  <span className="compare-stat-value">{slot.priceLabel}</span>
                </div>
                <div className="compare-stat">
                  <span className="compare-stat-label">Status</span>
                  <span className="compare-stat-value">{slot.gateDescription}</span>
                </div>
                <div className="compare-stat-grid">
                  <div>
                    <span className="compare-stat-label">Enjoyment / sec</span>
                    <span className="compare-stat-value">{slot.enjoymentLabel}</span>
                  </div>
                  <div>
                    <span className="compare-stat-label">Cash / sec</span>
                    <span className="compare-stat-value">{slot.cashLabel}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
