export type TabId =
  | "career"
  | "catalog"
  | "collection"
  | "upgrades"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "stats"
  | "save";

export type TabActivationSource = "deep-link" | "system";

export type NavigationState = {
  lastTabId: TabId;
};

const TAB_IDS: TabId[] = [
  "career",
  "catalog",
  "collection",
  "upgrades",
  "workshop",
  "maison",
  "nostalgia",
  "stats",
  "save",
];

const isTabId = (value: string): value is TabId => TAB_IDS.includes(value as TabId);

export function resolveTabAlias(value: string): TabId | null {
  if (value === "vault") {
    return "collection";
  }

  if (value === "catalog") {
    return "catalog";
  }

  return isTabId(value) ? value : null;
}

export function resolveLandingTab(args: {
  search: string;
  hasSave: boolean;
  navigationState: NavigationState | null;
  isVisible: (tabId: TabId) => boolean;
}): { tabId: TabId; source: TabActivationSource } {
  void args.search;

  if (
    args.hasSave &&
    args.navigationState?.lastTabId === "collection" &&
    args.isVisible("collection")
  ) {
    return { tabId: "collection", source: "system" };
  }

  if (args.isVisible("career")) {
    return { tabId: "career", source: "system" };
  }

  return { tabId: "collection", source: "system" };
}
