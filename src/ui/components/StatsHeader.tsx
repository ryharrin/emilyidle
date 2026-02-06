import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

export type StatsSummary = {
  cash: string;
  cashRate: string;
  enjoyment: string;
  enjoymentRate: string;
  sentimentalValue: string;
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
              <dt>Dollars</dt>
              <dd id="currency">{stats.cash}</dd>
            </div>
            <div>
              <dt>Dollars / sec</dt>
              <dd id="income">{stats.cashRate}</dd>
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
                Collection enjoyment
                <ExplainButton sectionId={HELP_SECTION_IDS.currencies} label="Explain currencies" />
              </dt>
              <dd id="enjoyment">{stats.enjoyment}</dd>
            </div>
            <div>
              <dt>Enjoyment / sec</dt>
              <dd id="enjoyment-rate">{stats.enjoymentRate}</dd>
            </div>
            <div>
              <dt>Memories</dt>
              <dd id="collection-value">{stats.sentimentalValue}</dd>
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
