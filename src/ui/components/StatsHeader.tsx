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

type StatsSystemVisibility = {
  atelier: boolean;
  maison: boolean;
  events: boolean;
};

type StatsHeaderProps = {
  stats: StatsSummary;
  systemStats: StatsSystemMetrics;
  systemVisibility: StatsSystemVisibility;
  eventMultiplier?: number;
};

const MOBILE_STATS_QUERY = "(max-width: 900px)";

const getIsCompactStatsViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_STATS_QUERY).matches;
};

export function StatsHeader({
  stats,
  systemStats,
  systemVisibility,
  eventMultiplier,
}: StatsHeaderProps) {
  const [systemOpen, setSystemOpen] = React.useState(() => !getIsCompactStatsViewport());
  const discoveredSystemRows = React.useMemo(
    () =>
      [
        {
          key: "atelier",
          label: "Atelier resets",
          visible: systemVisibility.atelier,
          value: systemStats.atelierResets,
        },
        {
          key: "maison-heritage",
          label: "Maison heritage",
          visible: systemVisibility.maison,
          value: systemStats.maisonHeritage,
        },
        {
          key: "maison-reputation",
          label: "Maison reputation",
          visible: systemVisibility.maison,
          value: systemStats.maisonReputation,
        },
        {
          key: "event-multiplier",
          label: "Event multiplier",
          visible: systemVisibility.events,
          value: `x${systemStats.eventMultiplier.toFixed(2)}`,
          testId: "stats-event-multiplier",
        },
      ].filter((row) => row.visible),
    [systemStats, systemVisibility],
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_STATS_QUERY);
    const syncLayout = (matches: boolean) => {
      if (matches) {
        setSystemOpen(false);
        return;
      }

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

  return (
    <section className="stats-header" aria-labelledby="vault-stats-title">
      <h2 id="vault-stats-title" className="visually-hidden">
        Collection stats
      </h2>
      <div className="stats-header__grid" data-testid="stats-metrics">
        <article className="stats-header__group">
          <div className="stats-header__group-title">
            <p className="eyebrow">Economy</p>
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
                className="stats-header__metric-value stats-header__metric-value--hero stats-header__metric-value--rate"
              >
                <ValueTicker
                  value={stats.cashRate}
                  formatValue={formatRateFromCentsPerSec}
                  testId="value-ticker-income"
                />
                <span className="stats-header__rate-badge">/sec</span>
                {eventMultiplier && eventMultiplier > 1 && (
                  <span className="stats-header__event-badge">
                    +{Math.round((eventMultiplier - 1) * 100)}% event
                  </span>
                )}
              </dd>
            </div>
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
              <dd
                id="enjoyment-rate"
                className="stats-header__metric-value stats-header__metric-value--rate"
              >
                <ValueTicker
                  value={stats.enjoymentRate}
                  formatValue={formatRateFromCentsPerSec}
                  testId="value-ticker-enjoyment-rate"
                />
                <span className="stats-header__rate-badge">/sec</span>
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
        </article>

        {discoveredSystemRows.length > 0 ? (
          <details
            className="stats-header__group stats-header__group--collapsible"
            open={systemOpen}
            onToggle={(event) => setSystemOpen(event.currentTarget.open)}
            data-testid="stats-system-details"
          >
            <summary className="stats-header__group-summary" data-testid="stats-system-toggle">
              <span className="eyebrow disclosure-summary-label">System</span>
              <span className="stats-header__toggle-icon disclosure-summary-meta" aria-hidden="true">
                ▼
              </span>
            </summary>
            <dl className="stats-grid stats-header__metrics">
              {discoveredSystemRows.map((row) => (
                <div key={row.key}>
                  <dt className="stats-header__metric-label">{row.label}</dt>
                  <dd
                    className="stats-header__metric-value stats-header__metric-value--system"
                    data-testid={row.testId}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        ) : null}
      </div>
    </section>
  );
}
