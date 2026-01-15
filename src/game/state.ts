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
