import React from "react";

import { UnlockHint, type UnlockHintProps } from "./UnlockHint";

export type NextUnlockItem = UnlockHintProps & {
  id: string;
};

type NextUnlockPanelProps = {
  items: ReadonlyArray<NextUnlockItem>;
};

export function NextUnlockPanel({ items }: NextUnlockPanelProps): JSX.Element {
  const [primaryUnlock] = items;

  return (
    <section className="panel" data-testid="next-unlocks">
      <div className="next-unlock-preview" data-testid="next-unlock-preview">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Progress</p>
            <h3>Next unlocks</h3>
            <p className="muted">Upcoming goals that unlock new options.</p>
          </div>
        </header>

        {primaryUnlock && (
          <div className="next-unlock-feature" data-testid="next-unlock-lead">
            <span className="next-unlock-feature-icon" aria-hidden="true"></span>
            <div className="next-unlock-feature-body">
              <div className="next-unlock-feature-heading">
                <p className="eyebrow">{primaryUnlock.eyebrow}</p>
                <h4>{primaryUnlock.title}</h4>
              </div>
              {primaryUnlock.effectSummary && (
                <p className="next-unlock-feature-effect">{primaryUnlock.effectSummary}</p>
              )}
              <p className="muted next-unlock-feature-progress">
                {primaryUnlock.detail} · {primaryUnlock.currentLabel} /{" "}
                {primaryUnlock.thresholdLabel}
              </p>
            </div>
          </div>
        )}

        <div className="card-stack">
          {items.map(({ id, ...hint }) => (
            <div key={id} className="card" data-testid={`next-unlock-${id}`}>
              <UnlockHint {...hint} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
