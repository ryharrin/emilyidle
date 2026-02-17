import React from "react";

import type { TabId } from "../navigation/tabMeta";

export type NextActionChip = {
  id: string;
  title: string;
  detail: string;
  ctaLabel: string;
  tabId: TabId;
  scrollTargetId?: string;
  dismissKey?: string;
};

type NextActionChipsProps = {
  chips: NextActionChip[];
  onDismiss: (chip: NextActionChip) => void;
  onSelect: (chip: NextActionChip) => void;
};

export function NextActionChips({
  chips,
  onDismiss,
  onSelect,
}: NextActionChipsProps): JSX.Element | null {
  if (chips.length === 0) {
    return null;
  }

  return (
    <section
      className="next-action-chip-rail"
      aria-label="Next action suggestions"
      data-testid="next-action-chip-rail"
    >
      {chips.map((chip) => (
        <article
          key={chip.id}
          className="next-action-chip"
          data-testid={`next-action-chip-${chip.id}`}
        >
          <div className="next-action-chip__copy">
            <p className="next-action-chip__title">{chip.title}</p>
            <p className="next-action-chip__detail">{chip.detail}</p>
          </div>
          <div className="next-action-chip__actions">
            <button
              type="button"
              className="next-action-chip__cta"
              data-testid={`next-action-chip-cta-${chip.id}`}
              onClick={() => onSelect(chip)}
            >
              {chip.ctaLabel}
            </button>
            <button
              type="button"
              className="next-action-chip__dismiss"
              data-testid={`next-action-chip-dismiss-${chip.id}`}
              aria-label={`Dismiss ${chip.title}`}
              onClick={() => onDismiss(chip)}
            >
              Dismiss
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
