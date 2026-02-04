import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import type { PerWatchStatsRow } from "../../game/selectors/perWatchStats";
import { useCallback, useMemo, useState } from "react";

type SortKey = "enjoyment" | "cash";

type PerWatchStatsTableProps = {
  rows: PerWatchStatsRow[];
  highlightModelId?: string | null;
};

export function PerWatchStatsTable({ rows, highlightModelId }: PerWatchStatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("enjoyment");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const sortedRows = useMemo(() => {
    const filtered = ownedOnly ? rows.filter((row) => row.ownedCount > 0) : rows;
    return [...filtered].sort((a, b) => {
      const primary =
        sortKey === "enjoyment"
          ? b.enjoymentCentsPerSec - a.enjoymentCentsPerSec
          : b.cashCentsPerSec - a.cashCentsPerSec;
      if (primary !== 0) {
        return primary;
      }
      const secondary =
        sortKey === "enjoyment"
          ? b.cashCentsPerSec - a.cashCentsPerSec
          : b.enjoymentCentsPerSec - a.enjoymentCentsPerSec;
      if (secondary !== 0) {
        return secondary;
      }
      return a.modelId.localeCompare(b.modelId);
    });
  }, [rows, sortKey, ownedOnly]);

  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortKey(event.target.value as SortKey);
  }, []);

  const toggleOwnedOnly = useCallback(() => {
    setOwnedOnly((prev) => !prev);
  }, []);

  const handleToggleRow = useCallback((modelId: string, isOpen: boolean) => {
    setExpandedRows((prev) => ({
      ...prev,
      [modelId]: isOpen,
    }));
  }, []);

  return (
    <section className="per-watch-stats" data-testid="per-watch-stats">
      <header className="per-watch-stats-hdr">
        <div>
          <p className="eyebrow">Per-watch stats</p>
          <h3>Enjoyment vs cash</h3>
          <p className="muted">
            Enjoyment is per watch, cash stays anchored to the therapist salary. Sort and expand
            rows to inspect each watch’s modifiers.
          </p>
        </div>
        <div className="per-watch-stats-controls" data-testid="per-watch-stats-controls">
          <label>
            Sort
            <select data-testid="per-watch-sort" value={sortKey} onChange={handleSortChange}>
              <option value="enjoyment">Enjoyment first</option>
              <option value="cash">Cash first</option>
            </select>
          </label>
          <label className="per-watch-owned-toggle">
            <input
              data-testid="per-watch-owned-filter"
              type="checkbox"
              checked={ownedOnly}
              onChange={toggleOwnedOnly}
            />
            Owned only
          </label>
        </div>
      </header>
      <div className="per-watch-stats-table">
        {sortedRows.map((row) => {
          const isOpen = Boolean(expandedRows[row.modelId]);
          const isHighlighted = row.modelId === highlightModelId;
          return (
            <details
              key={row.modelId}
              open={isOpen}
              onToggle={(event) => handleToggleRow(row.modelId, event.currentTarget.open)}
              className={`per-watch-row ${isHighlighted ? "per-watch-row-highlight" : ""}`}
              data-testid={`per-watch-row-${row.modelId}`}
            >
              <summary className="per-watch-row-summary">
                <div className="per-watch-row-cell per-watch-row-name">
                  <span className="per-watch-row-title">{row.displayName}</span>
                  <span className="per-watch-row-subtitle">
                    {row.tierLabel} · {row.movement} · {row.catalogEntryIds.length} entry(s)
                  </span>
                </div>
                <div className="per-watch-row-cell per-watch-row-enjoyment">
                  <span>{formatRateFromCentsPerSec(row.enjoymentCentsPerSec)}</span>
                  <small>Enjoyment / sec</small>
                </div>
                <div className="per-watch-row-cell per-watch-row-cash">
                  <span>{formatRateFromCentsPerSec(row.cashCentsPerSec)}</span>
                  <small>Cash / sec (career)</small>
                </div>
                <div className="per-watch-row-cell per-watch-row-owned">
                  <span>{row.ownedCount} owned</span>
                  <small>Reserve x{row.reserveMultiplier.toFixed(2)}</small>
                </div>
              </summary>
              <div
                className="per-watch-row-details"
                data-testid={`per-watch-row-details-${row.modelId}`}
              >
                <p>
                  Total enjoyment (all copies):{" "}
                  {formatMoneyFromCents(row.totalEnjoymentCentsPerSec)} /s
                </p>
                <p>Event multiplier: x{row.eventMultiplier.toFixed(2)}</p>
                <p>{row.cashExplanation}</p>
              </div>
            </details>
          );
        })}
        {sortedRows.length === 0 && (
          <p className="muted per-watch-empty" data-testid="per-watch-empty">
            No watches match this filter.
          </p>
        )}
      </div>
    </section>
  );
}
