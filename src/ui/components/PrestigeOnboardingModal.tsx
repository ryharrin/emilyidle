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
      className="nostalgia-modal"
      data-testid="prestige-onboarding-modal"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="nostalgia-modal-card">
        <h3 id={titleId}>{content.title}</h3>
        <p id={descriptionId} className="muted">
          {content.body}
        </p>
        <div className="prestige-onboarding-grid" data-testid="prestige-onboarding-grid">
          <section className="card">
            <h4>Carries forward</h4>
            <ul>
              {content.carryForward.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h4>Resets now</h4>
            <ul>
              {content.resets.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        </div>
        <p className="muted">{content.recoveryHint}</p>
        <div className="card-actions">
          <button
            type="button"
            onClick={() => {
              onRecommendedAction(content.recommended.tabId);
            }}
          >
            {content.recommended.label}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Keep current tab
          </button>
        </div>
      </div>
    </div>
  );
}
