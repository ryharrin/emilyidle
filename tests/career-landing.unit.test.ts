import { describe, expect, it } from "vitest";

import { resolveLandingTab } from "../src/ui/navigation/landing";

describe("career landing", () => {
  it("prefers deep links over last-tab and fresh-save defaults", () => {
    const result = resolveLandingTab({
      search: "?tab=stats",
      hasSave: true,
      navigationState: { lastTabId: "save" },
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "stats", source: "deep-link" });
  });

  it("treats tab=catalog as a Catalog deep link", () => {
    const result = resolveLandingTab({
      search: "?tab=catalog",
      hasSave: false,
      navigationState: null,
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "catalog", source: "deep-link" });
  });

  it("ignores invalid deep link tabs and falls back to last-tab when available", () => {
    const result = resolveLandingTab({
      search: "?tab=not-a-real-tab",
      hasSave: true,
      navigationState: { lastTabId: "upgrades" },
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "upgrades", source: "system" });
  });

  it("ignores hidden deep links and uses last-tab for existing saves", () => {
    const result = resolveLandingTab({
      search: "?tab=career",
      hasSave: true,
      navigationState: { lastTabId: "save" },
      isVisible: (tabId) => tabId !== "career",
    });

    expect(result).toEqual({ tabId: "save", source: "system" });
  });

  it("defaults fresh saves to Career when visible", () => {
    const result = resolveLandingTab({
      search: "",
      hasSave: false,
      navigationState: null,
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "career", source: "system" });
  });

  it("ignores last-tab when there is no save", () => {
    const result = resolveLandingTab({
      search: "",
      hasSave: false,
      navigationState: { lastTabId: "save" },
      isVisible: () => true,
    });

    expect(result).toEqual({ tabId: "career", source: "system" });
  });

  it("falls back to Vault/collection when Career is hidden on a fresh save", () => {
    const result = resolveLandingTab({
      search: "",
      hasSave: false,
      navigationState: null,
      isVisible: (tabId) => tabId !== "career",
    });

    expect(result).toEqual({ tabId: "collection", source: "system" });
  });
});
