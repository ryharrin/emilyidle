import React from "react";

import { UnlockHint, type UnlockHintProps } from "./UnlockHint";

export type NextUnlockItem = UnlockHintProps & {
  id: string;
};

type NextUnlockPanelProps = {
  items: ReadonlyArray<NextUnlockItem>;
};

export function NextUnlockPanel({ items }: NextUnlockPanelProps): JSX.Element {
  return (
    <section className="panel" data-testid="next-unlocks">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Progress</p>
          <h3>Next unlocks</h3>
          <p className="muted">Upcoming goals that unlock new options.</p>
        </div>
      </header>

      <div className="card-stack">
        {items.map(({ id, ...hint }) => (
          <div key={id} className="card" data-testid={`next-unlock-${id}`}>
            <UnlockHint {...hint} />
          </div>
        ))}
      </div>
    </section>
  );
}
