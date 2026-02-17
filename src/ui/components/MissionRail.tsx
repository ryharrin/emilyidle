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
  now: MissionAction;
  next: MissionAction;
  later: MissionAction;
  checklist: MissionChecklist;
};

export function MissionRail({
  urgency,
  urgencyReason,
  now,
  next,
  later,
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
            <span className="eyebrow">Mission plan</span>
            <span className="muted">{primaryOpen ? "Collapse" : "Expand"}</span>
          </summary>
          <div className="mission-rail__primary-content">
            <p className="muted" data-testid="mission-guidance-lane-note">
              Now / Next / Later
            </p>
            <p className="mission-rail__urgency" data-testid="mission-urgency-reason">
              {urgencyReason}
            </p>
            <h3>{now.label}</h3>
            <p className="muted">{now.detail}</p>
            <p className="mission-rail__reason" data-testid="mission-primary-why-now">
              Why now: {now.whyNow}
            </p>
            <div className="card-actions">
              <button type="button" data-testid={now.testId} onClick={now.onAction}>
                {now.actionLabel}
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

      <article
        className="mission-rail__card mission-rail__card--secondary"
        data-testid="mission-rail-secondary"
      >
        <div className="mission-rail__timeline" data-testid="mission-lane-groups">
          <div className="mission-rail__lane" data-testid="mission-next-lane">
            <p className="eyebrow">Next</p>
            <h4>{next.label}</h4>
            <p className="muted">{next.detail}</p>
            <p className="mission-rail__reason" data-testid="mission-secondary-why-now">
              Queue after this: {next.actionLabel}. {next.whyNow}
            </p>
            <button
              type="button"
              className="secondary mission-rail__secondary-action"
              data-testid={next.testId}
              onClick={next.onAction}
            >
              {next.actionLabel}
            </button>
          </div>
          <div className="mission-rail__lane" data-testid="mission-later-lane">
            <p className="eyebrow">Later</p>
            <h4>{later.label}</h4>
            <p className="muted">{later.detail}</p>
            <p className="mission-rail__reason" data-testid="mission-later-summary">
              Why later: {later.whyNow}
            </p>
            <button
              type="button"
              className="secondary mission-rail__secondary-action"
              data-testid={later.testId}
              onClick={later.onAction}
            >
              {later.actionLabel}
            </button>
          </div>
        </div>
      </article>

      <section className="mission-rail__mobile-cta" data-testid="mission-mobile-cta">
        <div className="mission-rail__mobile-cta-copy">
          <p className="eyebrow">Now</p>
          <p>{now.label}</p>
        </div>
        <button type="button" data-testid={now.testId} onClick={now.onAction}>
          {now.actionLabel}
        </button>
      </section>
    </section>
  );
}
