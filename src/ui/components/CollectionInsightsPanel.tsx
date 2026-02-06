import { formatMoneyFromCents } from "../../game/format";
import {
  getCollectionAnalyticsSnapshot,
  getNextPrestigePreview,
  getSetBonusProgressRows,
  type GameState,
} from "../../game/state";

import "./collectionDepth.css";

type CollectionInsightsPanelProps = {
  state: GameState;
};

const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;

export function CollectionInsightsPanel({ state }: CollectionInsightsPanelProps) {
  const setBonusRows = getSetBonusProgressRows(state);
  const prestigePreview = getNextPrestigePreview(state);
  const analytics = getCollectionAnalyticsSnapshot(state);

  const renderDistribution = (
    label: string,
    rows: Array<{ id: string; label: string; count: number; ratio: number }>,
  ) => {
    if (rows.length === 0) {
      return null;
    }
    return (
      <div
        className="collection-insights__distribution-group"
        data-testid={`collection-analytics-${label.toLowerCase()}`}
      >
        <p className="eyebrow">{label}</p>
        <ul className="collection-insights__distribution-list">
          {rows.map((row) => (
            <li key={row.id}>
              <span>{row.label}</span>
              <span>
                {row.count} · {formatPercent(row.ratio)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section
      id="collection-set-bonuses"
      className="collection-insights"
      data-testid="collection-insights-panel"
    >
      <div className="collection-insights__set-bonuses" data-testid="collection-set-bonus-grid">
        {setBonusRows.map((row) => (
          <article
            key={row.id}
            className={`collection-insights__set-bonus-card ${row.active ? "is-active" : ""}`}
            data-testid="collection-set-bonus-card"
            data-bonus-id={row.id}
          >
            <div className="collection-insights__set-card-header">
              <p className="eyebrow">Set bonus</p>
              <h3>{row.name}</h3>
            </div>
            <div className="collection-insights__set-card-progress">
              <span>
                {row.metCount}/{row.requiredCount}
              </span>
              <span>{formatPercent(row.ratio)}</span>
            </div>
            <p className="collection-insights__set-card-status">
              {row.active ? "Active" : row.nextNeedLabel}
            </p>
            <ul className="collection-insights__set-card-requirements">
              {row.requirements.map((entry) => (
                <li key={entry.itemId} className={entry.met ? "is-met" : ""}>
                  {entry.itemId} {entry.currentCount}/{entry.requiredCount}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="collection-insights__right">
        <article
          className="collection-insights__prestige"
          data-testid="collection-prestige-preview"
        >
          <p className="collection-insights__badge">Prestige preview</p>
          {prestigePreview ? (
            <>
              <h3>{prestigePreview.label}</h3>
              <p className="muted">{prestigePreview.effectSummary}</p>
              <div className="collection-insights__prestige-progress">
                <span>
                  {formatMoneyFromCents(prestigePreview.current)} /{" "}
                  {formatMoneyFromCents(prestigePreview.threshold)}
                </span>
                <span>{formatPercent(prestigePreview.ratio)}</span>
              </div>
              <p className="muted">
                {formatMoneyFromCents(prestigePreview.remaining)} remaining to unlock.
              </p>
            </>
          ) : (
            <>
              <h3>Fully prestiged</h3>
              <p className="muted">You already met the highest prestige threshold.</p>
            </>
          )}
        </article>
        <article
          className="collection-insights__analytics"
          data-testid="collection-analytics-panel"
        >
          <div className="collection-insights__analytics-main">
            <p className="eyebrow">Analytics</p>
            <h3>Most valuable</h3>
            {analytics.mostValuableModel ? (
              <>
                <p>{analytics.mostValuableModel.displayName}</p>
                <p className="muted">
                  {analytics.mostValuableModel.brand} · {analytics.mostValuableModel.tierId}
                </p>
                <p className="muted">
                  {formatMoneyFromCents(analytics.mostValuableModel.totalValueCents)} value ·{" "}
                  {analytics.mostValuableModel.ownedCount} owned
                </p>
              </>
            ) : (
              <p className="muted">No watches owned yet.</p>
            )}
          </div>
          <div className="collection-insights__analytics-distributions">
            {renderDistribution("Brand", analytics.brandDistribution)}
            {renderDistribution("Era", analytics.eraDistribution)}
            {renderDistribution("Tier", analytics.tierDistribution)}
          </div>
        </article>
      </div>
    </section>
  );
}
