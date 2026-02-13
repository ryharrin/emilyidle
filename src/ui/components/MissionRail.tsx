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

type ForecastPoint = {
  id: string;
  label: string;
  projectedCashDeltaCents: number;
  projectedEnjoymentDeltaCents: number;
};

type EconomyForecast = {
  points: ReadonlyArray<ForecastPoint>;
  reason: string;
};

type MissionRailProps = {
  urgency: "critical" | "high" | "medium" | "low";
  urgencyReason: string;
  primary: MissionAction;
  secondary: MissionAction;
  checklist: MissionChecklist;
  forecast: EconomyForecast;
};

const MOBILE_MISSION_QUERY = "(max-width: 900px)";

const getIsCompactMissionViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_MISSION_QUERY).matches;
};

export function MissionRail({
  urgency,
  urgencyReason,
  primary,
  secondary,
  checklist,
  forecast,
}: MissionRailProps) {
  const [isCompactLayout, setIsCompactLayout] = React.useState(getIsCompactMissionViewport);
  const [secondaryOpen, setSecondaryOpen] = React.useState(() => !getIsCompactMissionViewport());

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MISSION_QUERY);
    const syncLayout = (matches: boolean) => {
      setIsCompactLayout(matches);
      if (!matches) {
        setSecondaryOpen(true);
      }
    };

    syncLayout(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => {
      syncLayout(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return (
    <section className="mission-rail" data-testid="mission-rail" aria-label="Recommended actions">
      <article
        className="mission-rail__card mission-rail__card--primary"
        data-testid="mission-rail-primary"
        data-urgency={urgency}
      >
        <p className="eyebrow">What to do now</p>
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

        <section className="mission-rail__forecast" data-testid="economy-forecast-strip">
          <header className="mission-rail__module-header">
            <p className="eyebrow">Forecast</p>
          </header>
          <div className="mission-rail__forecast-grid">
            {forecast.points.map((point) => (
              <article key={point.id} className="mission-rail__forecast-point">
                <p>{point.label}</p>
                <p>Cash +{Math.round(point.projectedCashDeltaCents / 100).toLocaleString()}</p>
                <p>
                  Enjoyment +{Math.round(point.projectedEnjoymentDeltaCents / 100).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
          <p className="muted mission-rail__forecast-note">{forecast.reason}</p>
        </section>
      </article>
      {isCompactLayout ? (
        <details
          className="mission-rail__secondary-disclosure"
          open={secondaryOpen}
          onToggle={(event) => setSecondaryOpen(event.currentTarget.open)}
          data-testid="mission-secondary-disclosure"
        >
          <summary data-testid="mission-secondary-toggle">
            <span>Next step</span>
            <span className="muted">{secondaryOpen ? "Collapse" : "Expand"}</span>
          </summary>
          <article className="mission-rail__card mission-rail__card--secondary">
            <h4>{secondary.label}</h4>
            <p className="muted">{secondary.detail}</p>
            <p className="mission-rail__reason" data-testid="mission-secondary-why-now">
              Why now: {secondary.whyNow}
            </p>
            <div className="card-actions">
              <button
                type="button"
                className="secondary"
                data-testid={secondary.testId}
                onClick={secondary.onAction}
              >
                {secondary.actionLabel}
              </button>
            </div>
          </article>
        </details>
      ) : (
        <article className="mission-rail__card mission-rail__card--secondary">
          <p className="eyebrow">Then</p>
          <h4>{secondary.label}</h4>
          <p className="muted">{secondary.detail}</p>
          <p className="mission-rail__reason" data-testid="mission-secondary-why-now">
            Why now: {secondary.whyNow}
          </p>
          <div className="card-actions">
            <button
              type="button"
              className="secondary"
              data-testid={secondary.testId}
              onClick={secondary.onAction}
            >
              {secondary.actionLabel}
            </button>
          </div>
        </article>
      )}

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
