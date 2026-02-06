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

export function StatsHeader({ stats, systemStats }: StatsHeaderProps) {
  return (
    <section className="stats-header" aria-labelledby="vault-stats-title">
      <h2 id="vault-stats-title" className="visually-hidden">
        Collection stats
      </h2>
      <div className="stats-header__grid" data-testid="stats-metrics">
        <article className="stats-header__group">
          <div className="stats-header__group-title">
            <p className="eyebrow">Primary economy</p>
          </div>
          <dl className="stats-grid stats-header__metrics">
            <div>
              <dt className="inline-icon-button">
                <CurrencyIcon className="inline-icon" />
                Dollars
              </dt>
              <dd id="currency">
                <ValueTicker
                  value={stats.cash}
                  formatValue={formatMoneyFromCents}
                  testId="value-ticker-currency"
                />
              </dd>
            </div>
            <div>
              <dt className="inline-icon-button">
                <CurrencyIcon className="inline-icon" />
                Dollars / sec
              </dt>
              <dd id="income">
                <ValueTicker
                  value={stats.cashRate}
                  formatValue={formatRateFromCentsPerSec}
                  testId="value-ticker-income"
                />
              </dd>
            </div>
          </dl>
        </article>

        <details className="stats-header__group stats-header__group--collapsible" open>
          <summary className="stats-header__group-summary">
            <span className="eyebrow">Progression</span>
            <span className="stats-header__toggle-icon" aria-hidden="true">
              ▼
            </span>
          </summary>
          <dl className="stats-grid stats-header__metrics">
            <div>
              <dt className="inline-icon-button">
                <CurrencyIcon className="inline-icon" />
                Collection enjoyment
                <ExplainButton sectionId={HELP_SECTION_IDS.currencies} label="Explain currencies" />
              </dt>
              <dd id="enjoyment">
                <ValueTicker
                  value={stats.enjoyment}
                  formatValue={formatMoneyFromCents}
                  testId="value-ticker-enjoyment"
                />
              </dd>
            </div>
            <div>
              <dt>Enjoyment / sec</dt>
              <dd id="enjoyment-rate">
                <ValueTicker
                  value={stats.enjoymentRate}
                  formatValue={formatRateFromCentsPerSec}
                  testId="value-ticker-enjoyment-rate"
                />
              </dd>
            </div>
            <div>
              <dt>Memories</dt>
              <dd id="collection-value">
                <ValueTicker
                  value={stats.sentimentalValue}
                  formatValue={formatMoneyFromCents}
                  testId="value-ticker-memories"
                />
              </dd>
            </div>
          </dl>
        </details>

        <details className="stats-header__group stats-header__group--collapsible" open>
          <summary className="stats-header__group-summary">
            <span className="eyebrow">System</span>
            <span className="stats-header__toggle-icon" aria-hidden="true">
              ▼
            </span>
          </summary>
          <dl className="stats-grid stats-header__metrics">
            <div>
              <dt>Atelier resets</dt>
              <dd>{systemStats.atelierResets}</dd>
            </div>
            <div>
              <dt>Maison heritage</dt>
              <dd>{systemStats.maisonHeritage}</dd>
            </div>
            <div>
              <dt>Maison reputation</dt>
              <dd>{systemStats.maisonReputation}</dd>
            </div>
            <div>
              <dt>Event multiplier</dt>
              <dd data-testid="stats-event-multiplier">
                x{systemStats.eventMultiplier.toFixed(2)}
              </dd>
            </div>
          </dl>
        </details>
      </div>
    </section>
  );
}
