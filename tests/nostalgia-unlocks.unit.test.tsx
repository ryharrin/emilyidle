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

    expect(unlockIds).toEqual(["automatic", "manual", "tourbillon"]);
    expect(getNostalgiaUnlockCost("automatic")).toBe(1);
    expect(getNostalgiaUnlockCost("manual")).toBe(3);
    expect(getNostalgiaUnlockCost("tourbillon")).toBe(6);
  });

  it("gates unlock availability until the first nostalgia prestige", () => {
    const baseState = createInitialState();

    expect(canBuyNostalgiaUnlock(baseState, "automatic")).toBe(false);
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

    expect(canBuyNostalgiaUnlock(seededState, "automatic")).toBe(true);
    expect(canBuyNostalgiaUnlock(seededState, "manual")).toBe(false);

    const afterClassic = buyNostalgiaUnlock(seededState, "automatic");

    expect(canBuyNostalgiaUnlock(afterClassic, "manual")).toBe(true);
    expect(canBuyNostalgiaUnlock(afterClassic, "tourbillon")).toBe(false);
  });

  it("subtracts nostalgia points and appends unlocks in order", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      nostalgiaResets: 1,
      nostalgiaPoints: 10,
    };

    const afterClassic = buyNostalgiaUnlock(seededState, "automatic");
    expect(afterClassic.nostalgiaPoints).toBe(
      seededState.nostalgiaPoints - getNostalgiaUnlockCost("automatic"),
    );
    expect(afterClassic.nostalgiaUnlockedItems).toEqual(["automatic"]);

    const afterChronograph = buyNostalgiaUnlock(afterClassic, "manual");
    expect(afterChronograph.nostalgiaUnlockedItems).toEqual(["automatic", "manual"]);
  });

  it("allows refunds only on the most recent unlock and restores full cost", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      nostalgiaResets: 1,
      nostalgiaPoints: 10,
    };

    const afterClassic = buyNostalgiaUnlock(seededState, "automatic");
    const afterChronograph = buyNostalgiaUnlock(afterClassic, "manual");

    expect(canRefundNostalgiaUnlock(afterChronograph, "automatic")).toBe(false);
    expect(canRefundNostalgiaUnlock(afterChronograph, "manual")).toBe(true);

    const refunded = refundNostalgiaUnlock(afterChronograph, "manual");
    expect(refunded.nostalgiaPoints).toBe(
      afterChronograph.nostalgiaPoints + getNostalgiaUnlockCost("manual"),
    );
    expect(refunded.nostalgiaUnlockedItems).toEqual(["automatic"]);
  });

  it("treats nostalgia unlocks as an OR gate for item availability", () => {
    const baseState = createInitialState();
    const unlocked: WatchItemId[] = ["automatic"];
    const seededState = {
      ...baseState,
      nostalgiaUnlockedItems: unlocked,
    };

    expect(isItemUnlocked(seededState, "automatic")).toBe(true);
    expect(isItemUnlocked(seededState, "manual")).toBe(false);
  });

  it("preserves nostalgia unlocks after nostalgia prestige", () => {
    const baseState = createInitialState();
    const threshold = getNostalgiaPrestigeThresholdCents();
    const unlocked: WatchItemId[] = ["automatic"];
    const seededState = {
      ...baseState,
      nostalgiaUnlockedItems: unlocked,
      nostalgiaEnjoymentEarnedCents: threshold,
    };

    const afterPrestige = prestigeNostalgia(seededState, 1_234);

    expect(afterPrestige.nostalgiaUnlockedItems).toEqual(["automatic"]);
  });

  it("persists nostalgia unlocks through save encode/decode", () => {
    const baseState = createInitialState();
    const unlocked: WatchItemId[] = ["automatic", "manual"];
    const seededState = {
      ...baseState,
      nostalgiaUnlockedItems: unlocked,
    };

    const encoded = encodeSaveString(seededState, Date.now());
    const decoded = decodeSaveString(encoded);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.save.state.nostalgiaUnlockedItems).toEqual(["automatic", "manual"]);
    }
  });
});
