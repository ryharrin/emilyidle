export type OnboardingCoachmarkDefinition = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
};

type OnboardingCoachmarkProps = OnboardingCoachmarkDefinition & {
  onDismiss: (coachmarkId: string) => void;
};

export function OnboardingCoachmark({
  id,
  title,
  description,
  actionLabel = "Got it",
  onDismiss,
}: OnboardingCoachmarkProps) {
  return (
    <div
      className="onboarding-coachmark"
      data-testid={`collection-onboarding-coachmark-${id}`}
      aria-live="polite"
    >
      <p className="onboarding-coachmark__title">{title}</p>
      <p className="onboarding-coachmark__description">{description}</p>
      <button type="button" className="onboarding-coachmark__dismiss" onClick={() => onDismiss(id)}>
        {actionLabel}
      </button>
    </div>
  );
}
