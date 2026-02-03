import {
  getAutomaticLiveMessage,
  getAutomaticRewardCopy,
} from "../src/ui/components/AutomaticMiniGameModal";

describe("automatic mini-game messaging helpers", () => {
  it("reports live copy for running and resolved states", () => {
    const running = getAutomaticLiveMessage({ result: null, targetPercent: 38 });
    expect(running).toMatch(/Keep the rotor balanced/i);
    expect(running).toMatch(/38% stability/i);

    const finished = getAutomaticLiveMessage({
      result: { tier: "perfect", performance: 1 },
      targetPercent: 88,
    });
    expect(finished).toMatch(/Perfect balance locked/i);
    expect(finished).toMatch(/88% stability/i);
  });

  it("builds reward copy that respects the passed percentage", () => {
    const perfectCopy = getAutomaticRewardCopy("perfect", 20);
    expect(perfectCopy.headline).toContain("+20%");
    expect(perfectCopy.headline).toMatch(/Perfect balance pays 2×/i);

    const goodCopy = getAutomaticRewardCopy("good", 10);
    expect(goodCopy.detail).toMatch(/reliable charge/i);
  });
});
