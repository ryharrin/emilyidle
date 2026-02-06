import { formatRateFromCentsPerSec } from "../../game/format";
import {
  getCashRateBreakdown,
  getEnjoymentRateBreakdown,
  getEventCalendar,
  getStatModifierGroups,
  type GameState,
  type EventCalendarEntry,
  type RateBreakdownMultiplierTerm,
  type StatsModifierGroup,
} from "../../game/state";

import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import type { StatsSummary } from "../components/StatsHeader";

type TabId =
  | "collection"
  | "career"
  | "upgrades"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "catalog"
  | "stats"
  | "save";

type StatsTabProps = {
  isActive: boolean;
  state: GameState;
  stats: StatsSummary;
  currentEventMultiplier: number;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
};

export function StatsTab({ isActive, state, stats, currentEventMultiplier }: StatsTabProps) {
  const nowMs = Date.now();
  const enjoymentRateBreakdown = getEnjoymentRateBreakdown(state, currentEventMultiplier);
  const cashRateBreakdown = getCashRateBreakdown(state, nowMs, currentEventMultiplier);
  const eventCalendar = getEventCalendar(state, nowMs);
  const enjoymentModifierGroups = getStatModifierGroups(
    enjoymentRateBreakdown.baseCentsPerSec,
    enjoymentRateBreakdown.multiplierTerms,
  );
  const cashBaseCentsPerSec = cashRateBreakdown.careerAddends.reduce(
    (total, addend) => total + addend.centsPerSec,
    0,
  );
  const cashModifierGroups = getStatModifierGroups(
    cashBaseCentsPerSec,
    cashRateBreakdown.multiplierTerms,
  );
  const eventSummary = {
    active: eventCalendar.active.length,
    upcoming: eventCalendar.upcoming.length,
    ready: eventCalendar.ready.length,
  };

  const renderModifierGroups = (groups: StatsModifierGroup[]) => {
    const activeGroups = groups.filter((group) => group.multiplier !== 1);
    if (activeGroups.length === 0) {
      return null;
    }

    return (
      <div className="stats-breakdown__groups">
        {activeGroups.map((group) => (
          <div className="stats-breakdown__modifier" key={group.id}>
            <p className="eyebrow">{group.label}</p>
            <p>
              +{formatRateFromCentsPerSec(group.contributionCentsPerSec)} ×
              {group.multiplier.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderModifierTerms = (terms: RateBreakdownMultiplierTerm[]) => {
    const activeTerms = terms.filter((term) => term.multiplier !== 1);
    if (activeTerms.length === 0) {
      return null;
    }

    return (
      <ul className="stats-breakdown__terms">
        {activeTerms.map((term) => (
          <li key={term.id}>
            {term.label} ×{term.multiplier.toFixed(2)}
          </li>
        ))}
      </ul>
    );
  };

  const renderEventCalendarGroup = (
    title: string,
    entries: EventCalendarEntry[],
    testId: string,
  ) => (
    <section className="card stats-event-calendar__group" data-testid={testId}>
      <header className="stats-event-calendar__group-header">
        <h4>{title}</h4>
        <span className="muted">{entries.length}</span>
      </header>
      {entries.length === 0 ? (
        <p className="muted">None</p>
      ) : (
        <div className="card-stack">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="card stats-event-calendar__entry"
              data-testid={`event-calendar-${entry.id}`}
            >
              <div className="card-header">
                <div>
                  <h5>{entry.name}</h5>
                  <p>{entry.description}</p>
                </div>
                <p className="muted">{entry.bonusLabel}</p>
              </div>
              <p className="muted" data-testid={`event-calendar-status-${entry.id}`}>
                {entry.status === "active"
                  ? `Ends in ${entry.countdownLabel}`
                  : entry.status === "upcoming"
                    ? `Starts in ${entry.countdownLabel}`
                    : "Ready"}
              </p>
              <p className="muted">{entry.bonusExplanation}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <section id="stats" role="tabpanel" aria-labelledby="stats-tab" hidden={!isActive}>
      <div className="panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Stats</h2>
            <p className="muted">Derived metrics from your current state.</p>
          </div>
        </header>

        <section className="stats-summary-strip" data-testid="stats-summary-strip">
          <article className="stats-summary-strip__card">
            <p className="eyebrow">Enjoyment / sec</p>
            <p className="stats-summary-strip__value">
              {formatRateFromCentsPerSec(enjoymentRateBreakdown.effectiveCentsPerSec)}
            </p>
          </article>
          <article className="stats-summary-strip__card">
            <p className="eyebrow">Dollars / sec</p>
            <p className="stats-summary-strip__value">
              {formatRateFromCentsPerSec(cashRateBreakdown.totalCentsPerSec)}
            </p>
          </article>
          <article className="stats-summary-strip__card" data-testid="stats-softcap-summary">
            <p className="eyebrow">Softcap</p>
            <p className="stats-summary-strip__value">{stats.softcap}</p>
          </article>
          <article className="stats-summary-strip__card">
            <p className="eyebrow">Events</p>
            <p className="stats-summary-strip__value">
              {eventSummary.active} active · {eventSummary.upcoming} upcoming
            </p>
            <p className="muted">{eventSummary.ready} ready</p>
          </article>
        </section>

        <details className="stats-disclosure" data-testid="stats-disclosure-rates" open>
          <summary>
            <span>Rate breakdown</span>
            <span className="muted">Base + modifiers</span>
          </summary>
          <div className="stats-disclosure__body">
            <section className="panel stats-breakdown">
              <div className="stats-breakdown__grid">
                <article
                  className="card stats-breakdown__card"
                  data-testid="enjoyment-rate-breakdown"
                >
                  <header className="stats-breakdown__card-header">
                    <div>
                      <p className="eyebrow">Enjoyment / sec</p>
                      <p className="stats-breakdown__total">
                        {formatRateFromCentsPerSec(enjoymentRateBreakdown.effectiveCentsPerSec)}
                      </p>
                    </div>
                    <ExplainButton sectionId={HELP_SECTION_IDS.rates} label="Explain rates" />
                  </header>
                  <p className="muted">
                    Base: {formatRateFromCentsPerSec(enjoymentRateBreakdown.baseCentsPerSec)}
                  </p>
                  {renderModifierGroups(enjoymentModifierGroups)}
                  {renderModifierTerms(enjoymentRateBreakdown.multiplierTerms)}
                </article>

                <article className="card stats-breakdown__card" data-testid="cash-rate-breakdown">
                  <header className="stats-breakdown__card-header">
                    <div>
                      <p className="eyebrow">Dollars / sec</p>
                      <p className="stats-breakdown__total">
                        {formatRateFromCentsPerSec(cashRateBreakdown.totalCentsPerSec)}
                      </p>
                    </div>
                    <ExplainButton sectionId={HELP_SECTION_IDS.rates} label="Explain rates" />
                  </header>
                  <ul className="stats-breakdown__base-addends">
                    {cashRateBreakdown.careerAddends.map((addend) => (
                      <li key={addend.id}>
                        {addend.label}: {formatRateFromCentsPerSec(addend.centsPerSec)}
                      </li>
                    ))}
                  </ul>
                  {renderModifierGroups(cashModifierGroups)}
                  {renderModifierTerms(cashRateBreakdown.multiplierTerms)}
                </article>
              </div>

              <article className="card stats-breakdown__softcap" data-testid="stats-softcap">
                <h4>Softcap efficiency</h4>
                <p id="softcap">{stats.softcap}</p>
                <p className="muted">
                  Income is smoothed once the atelier softcap threshold is exceeded so growth stays
                  balanced.
                </p>
              </article>
            </section>
          </div>
        </details>

        <details className="stats-disclosure" data-testid="stats-disclosure-calendar" open>
          <summary>
            <span>Event calendar</span>
            <span className="muted">
              {eventSummary.active} active · {eventSummary.upcoming} upcoming
            </span>
          </summary>
          <div className="stats-disclosure__body">
            <section
              className="panel stats-event-calendar-panel"
              data-testid="stats-event-calendar"
            >
              <div className="stats-event-calendar" data-testid="event-calendar">
                {renderEventCalendarGroup("Active", eventCalendar.active, "event-calendar-active")}
                {renderEventCalendarGroup(
                  "Upcoming",
                  eventCalendar.upcoming,
                  "event-calendar-upcoming",
                )}
                {renderEventCalendarGroup("Ready", eventCalendar.ready, "event-calendar-ready")}
              </div>
            </section>
          </div>
        </details>

        <details className="stats-disclosure" data-testid="stats-disclosure-journal">
          <summary>
            <span>Journal</span>
            <span className="muted">First arrivals, cabinet growth, and atelier stories</span>
          </summary>
          <div className="stats-disclosure__body">
            <section className="panel stats-journal" data-testid="stats-journal">
              <div className="card-stack" data-testid="lore-chapters">
                {(
                  [
                    {
                      id: "collector-shelf",
                      title: "First arrivals",
                      text: "The first pieces find their way into the collection, still warm from wrists and stories. You learn their rhythms, their quirks, and the quiet pull of the next addition.",
                    },
                    {
                      id: "showcase",
                      title: "The cabinet grows",
                      text: "The collection starts to feel curated instead of accidental. A pattern emerges: what you seek, what you keep, and what you let go as the collection takes shape.",
                    },
                    {
                      id: "atelier",
                      title: "Atelier nights",
                      text: "Late hours in the atelier turn maintenance into ritual. Tools, patience, and a little obsession sharpen your eye—and the collection responds in kind.",
                    },
                  ] as const
                )
                  .filter((chapter) => state.unlockedMilestones.includes(chapter.id))
                  .map((chapter) => (
                    <article className="card" key={chapter.id} data-testid="lore-chapter">
                      <h4>{chapter.title}</h4>
                      <p>{chapter.text}</p>
                    </article>
                  ))}
              </div>
            </section>
          </div>
        </details>
      </div>
    </section>
  );
}
