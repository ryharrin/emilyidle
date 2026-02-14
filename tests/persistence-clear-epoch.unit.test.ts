import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { bumpSaveClearEpoch, getSaveClearEpoch } from "../src/game/persistence";

describe("save clear epoch persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("returns 0 when the clear-epoch key is missing", () => {
    expect(getSaveClearEpoch()).toBe(0);
  });

  it("returns 0 when the clear-epoch key is invalid", () => {
    localStorage.setItem("emily-idle:save-clear-epoch", "not-a-number");
    expect(getSaveClearEpoch()).toBe(0);
  });

  it("returns 0 when reading localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(getSaveClearEpoch()).toBe(0);
  });

  it("writes max(nowMs, current+1) using provided time", () => {
    localStorage.setItem("emily-idle:save-clear-epoch", "500");

    const result = bumpSaveClearEpoch(new Date(100));

    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem("emily-idle:save-clear-epoch")).toBe("501");
  });

  it("uses nowMs when it is greater than current+1", () => {
    localStorage.setItem("emily-idle:save-clear-epoch", "25");

    const result = bumpSaveClearEpoch(new Date(1000));

    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem("emily-idle:save-clear-epoch")).toBe("1000");
  });

  it("returns an error result when writing localStorage fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    const result = bumpSaveClearEpoch(new Date(123));

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error).toContain("Could not write localStorage");
  });
});
