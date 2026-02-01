import React from "react";

export type CareerUpgradeModalModel = {
  title: string;
  description: string;
  hint: string;
  costPoints: number;
  status: "available" | "locked" | "spent";
  canSpend: boolean;
};

type CareerUpgradeModalProps = {
  open: boolean;
  model: CareerUpgradeModalModel | null;
  onClose: () => void;
  onSpend: () => void;
};

export function CareerUpgradeModal({ open, model, onClose, onSpend }: CareerUpgradeModalProps) {
  if (!open || !model) {
    return null;
  }

  return (
    <div
      className="nostalgia-modal career-upgrade-modal"
      data-testid="career-upgrade-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="nostalgia-modal-card career-upgrade-modal-card">
        <header className="career-upgrade-modal-header">
          <div>
            <p className="eyebrow">Career upgrade</p>
            <h3>{model.title}</h3>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="muted career-upgrade-modal-desc">{model.description}</p>

        <div className="career-upgrade-modal-meta">
          <div>
            <p className="workshop-label">Cost</p>
            <p className="workshop-value">{model.costPoints} pt</p>
          </div>
          <div>
            <p className="workshop-label">Status</p>
            <p className="workshop-value">{model.status}</p>
          </div>
        </div>

        <p className="career-upgrade-modal-hint">{model.hint}</p>

        <div className="card-actions">
          <button
            type="button"
            data-testid="career-upgrade-spend"
            disabled={!model.canSpend}
            onClick={onSpend}
          >
            Spend point
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
