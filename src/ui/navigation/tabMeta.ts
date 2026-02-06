export type TabBucket = "primary" | "progression" | "system";

export type TabId =
  | "career"
  | "collection"
  | "catalog"
  | "upgrades"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "stats"
  | "save";

export type TabMeta = {
  id: TabId;
  label: string;
  bucket: TabBucket;
  testId?: string;
};

export const TAB_DEFINITIONS: TabMeta[] = [
  { id: "career", label: "Career", bucket: "primary" },
  { id: "catalog", label: "Catalog", bucket: "primary" },
  { id: "collection", label: "Collection", bucket: "primary" },
  { id: "upgrades", label: "Upgrades", bucket: "progression" },
  { id: "workshop", label: "Atelier", bucket: "progression" },
  { id: "maison", label: "Maison", bucket: "progression" },
  { id: "nostalgia", label: "Nostalgia", bucket: "progression", testId: "nostalgia-tab" },
  { id: "stats", label: "Stats", bucket: "system" },
  { id: "save", label: "Settings", bucket: "system" },
];
