import React from "react";

import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { CurrencyIcon } from "../icons/coreIcons";
import { ValueTicker } from "./ValueTicker";
import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";

export type StatsSummary = {
  cash: number;
  cashRate: number;
  enjoyment: number;
  enjoymentRate: number;
  sentimentalValue: number;
  softcap: string;
};

type StatsSystemMetrics = {
  atelierResets: number;
  maisonHeritage: number;
  maisonReputation: number;
  eventMultiplier: number;
};

type StatsHeaderProps = {
  stats: StatsSummary;
  systemStats: StatsSystemMetrics;
};

const MOBILE_STATS_QUERY = "(max-width: 900px)";

const getIsCompactStatsViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_STATS_QUERY).matches;
};

export function StatsHeader({ stats, systemStats }: StatsHeaderProps) {
  const [isCompactLayout, setIsCompactLayout] = React.useState(getIsCompactStatsViewport);
  const [progressionOpen, setProgressionOpen] = React.useState(() => !getIsCompactStatsViewport());
  const [systemOpen, setSystemOpen] = React.useState(() => !getIsCompactStatsViewport());

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_STATS_QUERY);
    const syncLayout = (matches: boolean) => {
      setIsCompactLayout(matches);
      if (matches) {
        setProgressionOpen(false);
        setSystemOpen(false);
        return;
      }

      setProgressionOpen(true);
      setSystemOpen(true);
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

  const handleProgressionToggle = React.useCallback(
    (isOpen: boolean) => {
      setProgressionOpen(isOpen);
      if (isCompactLayout && isOpen) {
        setSystemOpen(false);
      }
    },
    [isCompactLayout],
  );

  const handleSystemToggle = React.useCallback(
    (isOpen: boolean) => {
      setSystemOpen(isOpen);
      if (isCompactLayout && isOpen) {
        setProgressionOpen(false);
      }
    },
    [isCompactLayout],
  );

  return (
    <section className="stats-header" aria-labelledby="vault-stats-title">
      <h2 id="vault-stats-title" className="visually-hidden">
        Collection stats
      </h2>
      <div className="stats-header__grid" data-testid="stats-metrics">
        <article className="stats-header__group">
          <div className="stats-header__group-title">
            <p className="eyebrow">Primary mission</p>
          </div>
          <dl className="stats-grid stats-header__metrics">
            <div>
              <dt className="inline-icon-button stats-header__metric-label">
                <CurrencyIcon className="inline-icon" />
                Cash
              </dt>
              <dd
                id="currency"
                className="stats-header__metric-value stats-header__metric-value--hero"
              >
                <ValueTicker
                  value={stats.cash}
                  formatValue={formatMoneyFromCents}
                  testId="value-ticker-currency"
                />
              </dd>
            </div>
            <div>
              <dt className="inline-icon-button stats-header__metric-label">
                <CurrencyIcon className="inline-icon" />
                Cash / sec
              </dt>
              <dd
                id="income"
                className="stats-header__metric-value stats-header__metric-value--hero"
              >
                <ValueTicker
                  value={stats.cashRate}
                  formatValue={formatRateFromCentsPerSec}
                  testId="value-ticker-income"
                />
              </dd>
            </div>
          </dl>
        </article>

        <details
          className="stats-header__group stats-header__group--collapsible"
          open={progressionOpen}
          onToggle={(event) => handleProgressionToggle(event.currentTarget.open)}
          data-testid="stats-progression-details"
        >
          <summary className="stats-header__group-summary" data-testid="stats-progression-toggle">
            <span className="eyebrow disclosure-summary-label">Progression</span>
            <span className="stats-header__toggle-icon disclosure-summary-meta" aria-hidden="true">
              ▼
            </span>
          </summary>
          <dl className="stats-grid stats-header__metrics">
            <div>
              <dt className="inline-icon-button stats-header__metric-label">
                <CurrencyIcon className="inline-icon" />
                Enjoyment
                <ExplainButton sectionId={HELP_SECTION_IDS.currencies} label="Explain currencies" />
              </dt>
              <dd id="enjoyment" className="stats-header__metric-value">
                <ValueTicker
                  value={stats.enjoyment}
                  formatValue={formatMoneyFromCents}
                  testId="value-ticker-enjoyment"
                />
              </dd>
            </div>
            <div>
              <dt className="stats-header__metric-label">Enjoyment / sec</dt>
              <dd id="enjoyment-rate" className="stats-header__metric-value">
                <ValueTicker
                  value={stats.enjoymentRate}
                  formatValue={formatRateFromCentsPerSec}
                  testId="value-ticker-enjoyment-rate"
                />
              </dd>
            </div>
            <div>
              <dt className="stats-header__metric-label">Memories</dt>
              <dd id="collection-value" className="stats-header__metric-value">
                <ValueTicker
                  value={stats.sentimentalValue}
                  formatValue={formatMoneyFromCents}
                  testId="value-ticker-memories"
                />
              </dd>
            </div>
          </dl>
        </details>

        <details
          className="stats-header__group stats-header__group--collapsible"
          open={systemOpen}
          onToggle={(event) => handleSystemToggle(event.currentTarget.open)}
          data-testid="stats-system-details"
        >
          <summary className="stats-header__group-summary" data-testid="stats-system-toggle">
            <span className="eyebrow disclosure-summary-label">System</span>
            <span className="stats-header__toggle-icon disclosure-summary-meta" aria-hidden="true">
              ▼
            </span>
          </summary>
          <dl className="stats-grid stats-header__metrics">
            <div>
              <dt className="stats-header__metric-label">Atelier resets</dt>
              <dd className="stats-header__metric-value stats-header__metric-value--system">
                {systemStats.atelierResets}
              </dd>
            </div>
            <div>
              <dt className="stats-header__metric-label">Maison heritage</dt>
              <dd className="stats-header__metric-value stats-header__metric-value--system">
                {systemStats.maisonHeritage}
              </dd>
            </div>
            <div>
              <dt className="stats-header__metric-label">Maison reputation</dt>
              <dd className="stats-header__metric-value stats-header__metric-value--system">
                {systemStats.maisonReputation}
              </dd>
            </div>
            <div>
              <dt className="stats-header__metric-label">Event multiplier</dt>
              <dd
                className="stats-header__metric-value stats-header__metric-value--system"
                data-testid="stats-event-multiplier"
              >
                x{systemStats.eventMultiplier.toFixed(2)}
              </dd>
            </div>
          </dl>
        </details>
      </div>
    </section>
  );
}
