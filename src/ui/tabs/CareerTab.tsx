import React from "react";

import type { GameState } from "../../game/state";
import { CareerPanel } from "./career/CareerPanel";

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

type CareerTabProps = {
  isActive: boolean;
  state: GameState;
  nowMs: number;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  onPurchase: (nextState: GameState) => void;
};

export function CareerTab({ isActive, state, nowMs, onPurchase }: CareerTabProps) {
  return (
    <section id="career" role="tabpanel" aria-labelledby="career-tab" hidden={!isActive}>
      {isActive ? <CareerPanel state={state} nowMs={nowMs} onPurchase={onPurchase} /> : null}
    </section>
  );
}
