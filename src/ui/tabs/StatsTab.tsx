import React from "react";

import type { GameState } from "../../game/state";

type StatsSummary = {
  cash: string;
  cashRate: string;
  enjoyment: string;
  enjoymentRate: string;
  sentimentalValue: string;
  softcap: string;
};

type StatsTabProps = {
  isActive: boolean;
  state: GameState;
  stats: StatsSummary;
  currentEventMultiplier: number;
};

export function StatsTab({ isActive, state, stats, currentEventMultiplier }: StatsTabProps) {
  return (
    <section id="stats" role="tabpanel" aria-labelledby="stats-tab" hidden={!isActive}>
      {isActive && (
        <div className="panel">
          <h2>Stats</h2>
          <p className="muted">Derived metrics from your current state.</p>
          <dl className="stats-grid" data-testid="stats-metrics">
            <div>
              <dt>Vault enjoyment</dt>
              <dd data-testid="stats-enjoyment">{stats.enjoyment}</dd>
            </div>
            <div>
              <dt>Enjoyment / sec</dt>
              <dd data-testid="stats-enjoyment-rate">{stats.enjoymentRate}</dd>
            </div>
            <div>
              <dt>Vault dollars</dt>
              <dd data-testid="stats-cash">{stats.cash}</dd>
            </div>
            <div>
              <dt>Dollars / sec</dt>
              <dd data-testid="stats-cash-rate">{stats.cashRate}</dd>
            </div>
            <div>
              <dt>Memories</dt>
              <dd data-testid="stats-memories">{stats.sentimentalValue}</dd>
            </div>
            <div>
              <dt>Atelier resets</dt>
              <dd data-testid="stats-workshop-prestige">{state.workshopPrestigeCount}</dd>
            </div>
            <div>
              <dt>Maison heritage</dt>
              <dd data-testid="stats-maison-heritage">{state.maisonHeritage}</dd>
            </div>
            <div>
              <dt>Maison reputation</dt>
              <dd data-testid="stats-maison-reputation">{state.maisonReputation}</dd>
            </div>
            <div>
              <dt>Event multiplier</dt>
              <dd data-testid="stats-event-multiplier">x{currentEventMultiplier.toFixed(2)}</dd>
            </div>
          </dl>

          <section className="panel stats-journal" data-testid="stats-journal">
            <h3>Journal</h3>
            <div className="card-stack" data-testid="lore-chapters">
              {(
                [
                  {
                    id: "collector-shelf",
                    title: "First arrivals",
                    text: "The first pieces find their way into the vault, still warm from wrists and stories. You learn their rhythms, their quirks, and the quiet pull of the next addition.",
                  },
                  {
                    id: "showcase",
                    title: "The cabinet grows",
                    text: "The vault starts to feel curated instead of accidental. A pattern emerges: what you seek, what you keep, and what you let go as the collection takes shape.",
                  },
                  {
                    id: "atelier",
                    title: "Atelier nights",
                    text: "Late hours in the atelier turn maintenance into ritual. Tools, patience, and a little obsession sharpen your eye—and the vault responds in kind.",
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
      )}
    </section>
  );
}
