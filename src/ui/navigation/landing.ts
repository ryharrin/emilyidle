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
  const params = new URLSearchParams(args.search);
  const deepLinkRaw = params.get("tab");
  const deepLinkTabId = deepLinkRaw ? resolveTabAlias(deepLinkRaw) : null;

  if (deepLinkTabId && args.isVisible(deepLinkTabId)) {
    return { tabId: deepLinkTabId, source: "deep-link" };
  }

  const lastTabId = args.navigationState?.lastTabId;
  if (args.hasSave && lastTabId && args.isVisible(lastTabId)) {
    return { tabId: lastTabId, source: "system" };
  }

  if (!args.hasSave) {
    if (args.isVisible("career")) {
      return { tabId: "career", source: "system" };
    }

    return { tabId: "collection", source: "system" };
  }

  return { tabId: "collection", source: "system" };
}
