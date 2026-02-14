import React from "react";

type MissionAction = {
  label: string;
  detail: string;
  actionLabel: string;
  whyNow: string;
  onAction: () => void;
  testId: string;
};

type MissionChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
};

type MissionChecklist = {
  visible: boolean;
  completedCount: number;
  totalCount: number;
  items: ReadonlyArray<MissionChecklistItem>;
};

type MissionRailProps = {
  urgency: "critical" | "high" | "medium" | "low";
  urgencyReason: string;
  primary: MissionAction;
  checklist: MissionChecklist;
};

export function MissionRail({
  urgency,
  urgencyReason,
  primary,
  checklist,
}: MissionRailProps) {
  const [primaryOpen, setPrimaryOpen] = React.useState(false);

  return (
    <section className="mission-rail" data-testid="mission-rail" aria-label="Recommended actions">
      <article
        className="mission-rail__card mission-rail__card--primary"
        data-testid="mission-rail-primary"
        data-urgency={urgency}
      >
        <details
          className="mission-rail__primary-disclosure"
          open={primaryOpen}
          onToggle={(event) => setPrimaryOpen(event.currentTarget.open)}
          data-testid="mission-primary-disclosure"
        >
          <summary data-testid="mission-primary-toggle">
            <span className="eyebrow">What to do now</span>
            <span className="muted">{primaryOpen ? "Collapse" : "Expand"}</span>
          </summary>
          <div className="mission-rail__primary-content">
            <p className="muted" data-testid="mission-guidance-lane-note">
              Primary guidance lane
            </p>
            <p className="mission-rail__urgency" data-testid="mission-urgency-reason">
              {urgencyReason}
            </p>
            <h3>{primary.label}</h3>
            <p className="muted">{primary.detail}</p>
            <p className="mission-rail__reason" data-testid="mission-primary-why-now">
              Why now: {primary.whyNow}
            </p>
            <div className="card-actions">
              <button type="button" data-testid={primary.testId} onClick={primary.onAction}>
                {primary.actionLabel}
              </button>
            </div>

            {checklist.visible ? (
              <section className="mission-rail__checklist" data-testid="first-run-checklist">
                <header className="mission-rail__module-header">
                  <p className="eyebrow">First-run checklist</p>
                  <span>
                    {checklist.completedCount}/{checklist.totalCount}
                  </span>
                </header>
                <ul>
                  {checklist.items.map((item) => (
                    <li key={item.id} data-complete={item.complete ? "true" : "false"}>
                      <span>{item.complete ? "✓" : "○"}</span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </details>
      </article>

      {/* Mobile sticky CTA - only visible on small screens */}
      <section className="mission-rail__mobile-cta" data-testid="mission-mobile-cta">
        <div className="mission-rail__mobile-cta-copy">
          <p className="eyebrow">Now</p>
          <p>{primary.label}</p>
        </div>
        <button type="button" data-testid={primary.testId} onClick={primary.onAction}>
          {primary.actionLabel}
        </button>
      </section>
    </section>
  );
}
