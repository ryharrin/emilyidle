import { describe, expect, it } from "vitest";

import {
  buyNostalgiaUnlock,
  canBuyNostalgiaUnlock,
  canRefundNostalgiaUnlock,
  createInitialState,
  getNostalgiaPrestigeThresholdCents,
  getNostalgiaUnlockCost,
  getNostalgiaUnlockIds,
  isItemUnlocked,
  prestigeNostalgia,
  refundNostalgiaUnlock,
  type WatchItemId,
} from "../src/game/state";
import { decodeSaveString, encodeSaveString } from "../src/game/persistence";

describe("nostalgia unlocks", () => {
  it("keeps nostalgia unlock costs stable and unique", () => {
    const unlockIds = getNostalgiaUnlockIds();

    expect(unlockIds).toEqual(["classic", "chronograph", "tourbillon"]);
    expect(getNostalgiaUnlockCost("classic")).toBe(1);
    expect(getNostalgiaUnlockCost("chronograph")).toBe(3);
    expect(getNostalgiaUnlockCost("tourbillon")).toBe(6);
  });

  it("gates unlock availability until the first nostalgia prestige", () => {
    const baseState = createInitialState();

    expect(canBuyNostalgiaUnlock(baseState, "classic")).toBe(false);
  });

  it("enforces unlock order and ignores milestone skips", () => {
    const baseState = createInitialState();
    const unlockedMilestones = ["collector-shelf", "showcase"] as const;
    const seededState = {
      ...baseState,
      nostalgiaResets: 1,
      nostalgiaPoints: 10,
      unlockedMilestones: [...unlockedMilestones],
    };

    expect(canBuyNostalgiaUnlock(seededState, "classic")).toBe(true);
    expect(canBuyNostalgiaUnlock(seededState, "chronograph")).toBe(false);

    const afterClassic = buyNostalgiaUnlock(seededState, "classic");

    expect(canBuyNostalgiaUnlock(afterClassic, "chronograph")).toBe(true);
    expect(canBuyNostalgiaUnlock(afterClassic, "tourbillon")).toBe(false);
  });

  it("subtracts nostalgia points and appends unlocks in order", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      nostalgiaResets: 1,
      nostalgiaPoints: 10,
    };

    const afterClassic = buyNostalgiaUnlock(seededState, "classic");
    expect(afterClassic.nostalgiaPoints).toBe(
      seededState.nostalgiaPoints - getNostalgiaUnlockCost("classic"),
    );
    expect(afterClassic.nostalgiaUnlockedItems).toEqual(["classic"]);

    const afterChronograph = buyNostalgiaUnlock(afterClassic, "chronograph");
    expect(afterChronograph.nostalgiaUnlockedItems).toEqual(["classic", "chronograph"]);
  });

  it("allows refunds only on the most recent unlock and restores full cost", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      nostalgiaResets: 1,
      nostalgiaPoints: 10,
    };

    const afterClassic = buyNostalgiaUnlock(seededState, "classic");
    const afterChronograph = buyNostalgiaUnlock(afterClassic, "chronograph");

    expect(canRefundNostalgiaUnlock(afterChronograph, "classic")).toBe(false);
    expect(canRefundNostalgiaUnlock(afterChronograph, "chronograph")).toBe(true);

    const refunded = refundNostalgiaUnlock(afterChronograph, "chronograph");
    expect(refunded.nostalgiaPoints).toBe(
      afterChronograph.nostalgiaPoints + getNostalgiaUnlockCost("chronograph"),
    );
    expect(refunded.nostalgiaUnlockedItems).toEqual(["classic"]);
  });

  it("treats nostalgia unlocks as an OR gate for item availability", () => {
    const baseState = createInitialState();
    const unlocked: WatchItemId[] = ["classic"];
    const seededState = {
      ...baseState,
      nostalgiaUnlockedItems: unlocked,
    };

    expect(isItemUnlocked(seededState, "classic")).toBe(true);
    expect(isItemUnlocked(seededState, "chronograph")).toBe(false);
  });

  it("preserves nostalgia unlocks after nostalgia prestige", () => {
    const baseState = createInitialState();
    const threshold = getNostalgiaPrestigeThresholdCents();
    const unlocked: WatchItemId[] = ["classic"];
    const seededState = {
      ...baseState,
      nostalgiaUnlockedItems: unlocked,
      nostalgiaEnjoymentEarnedCents: threshold,
    };

    const afterPrestige = prestigeNostalgia(seededState, 1_234);

    expect(afterPrestige.nostalgiaUnlockedItems).toEqual(["classic"]);
  });

  it("persists nostalgia unlocks through save encode/decode", () => {
    const baseState = createInitialState();
    const unlocked: WatchItemId[] = ["classic", "chronograph"];
    const seededState = {
      ...baseState,
      nostalgiaUnlockedItems: unlocked,
    };

    const encoded = encodeSaveString(seededState, Date.now());
    const decoded = decodeSaveString(encoded);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.save.state.nostalgiaUnlockedItems).toEqual(["classic", "chronograph"]);
    }
  });
});
