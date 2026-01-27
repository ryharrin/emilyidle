import React from "react";

import { getPrestigeOnboardingContent, type PrestigeEvent } from "../prestigeOnboarding";

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
  return (
    <div
      className="nostalgia-modal"
      data-testid="prestige-onboarding-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="nostalgia-modal-card">
        <h3>{content.title}</h3>
        <p className="muted">{content.body}</p>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
