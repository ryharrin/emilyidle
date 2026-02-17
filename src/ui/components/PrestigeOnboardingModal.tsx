import React from "react";

import { getPrestigeOnboardingContent, type PrestigeEvent } from "../prestigeOnboarding";
import { useModalAccessibility } from "./useModalAccessibility";

type PrestigeOnboardingModalProps = {
  event: PrestigeEvent;
  onClose: () => void;
  onRecommendedAction: (tabId: "collection" | "workshop" | "maison" | "nostalgia") => void;
};

export function PrestigeOnboardingModal({
  event,
  onClose,
  onRecommendedAction,
}: PrestigeOnboardingModalProps): JSX.Element {
  const content = getPrestigeOnboardingContent(event);
  const modalRef = React.useRef<HTMLDivElement | null>(null);
  const modalId = React.useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;

  useModalAccessibility({
    open: true,
    modalRef,
    onClose,
  });

  return (
    <div
      className="nostalgia-modal prestige-onboarding-modal"
      data-testid="prestige-onboarding-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="nostalgia-modal-card prestige-onboarding-modal-card" ref={modalRef}>
        <header className="modal-panel-header prestige-onboarding-header">
          <p className="eyebrow">Prestige briefing</p>
          <h3 id={titleId}>{content.title}</h3>
        </header>
        <p id={descriptionId} className="muted modal-panel-description">
          {content.body}
        </p>
        <div className="prestige-onboarding-grid" data-testid="prestige-onboarding-grid">
          <section className="card prestige-onboarding-section">
            <h4>Carries forward</h4>
            <ul>
              {content.carryForward.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
          <section className="card prestige-onboarding-section">
            <h4>Resets now</h4>
            <ul>
              {content.resets.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        </div>
        <p className="muted prestige-onboarding-recovery">{content.recoveryHint}</p>
        <div className="card-actions modal-panel-actions prestige-onboarding-actions">
          <button
            type="button"
            className="action-priority-primary"
            onClick={() => {
              onRecommendedAction(content.recommended.tabId);
            }}
          >
            {content.recommended.label}
          </button>
          <button type="button" className="secondary action-priority-secondary" onClick={onClose}>
            Keep current tab
          </button>
        </div>
      </div>
    </div>
  );
}
