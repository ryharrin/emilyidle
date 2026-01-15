export type GameState = {
  currencyCents: number;
  incomeRateCentsPerSec: number;
  itemCount: number;
};

export function createInitialState(): GameState {
  return {
    currencyCents: 0,
    incomeRateCentsPerSec: 10,
    itemCount: 0,
  };
}

export const BASIC_WATCH_BASE_PRICE_CENTS = 100;
export const BASIC_WATCH_PRICE_GROWTH = 1.15;
export const BASIC_WATCH_INCOME_BONUS_CENTS_PER_SEC = 5;

export function getBasicWatchPriceCents(state: GameState): number {
  return Math.ceil(BASIC_WATCH_BASE_PRICE_CENTS * BASIC_WATCH_PRICE_GROWTH ** state.itemCount);
}

export function canBuyBasicWatch(state: GameState): boolean {
  return state.currencyCents >= getBasicWatchPriceCents(state);
}

export function buyBasicWatch(state: GameState): GameState {
  const priceCents = getBasicWatchPriceCents(state);

  if (state.currencyCents < priceCents) {
    return state;
  }

  return {
    ...state,
    currencyCents: state.currencyCents - priceCents,
    itemCount: state.itemCount + 1,
    incomeRateCentsPerSec: state.incomeRateCentsPerSec + BASIC_WATCH_INCOME_BONUS_CENTS_PER_SEC,
  };
}
