import React from "react";

import type { CatalogEntry } from "../../game/catalog";

type UseStableCatalogEntriesArgs = {
  entries: ReadonlyArray<CatalogEntry>;
  allEntries: ReadonlyArray<CatalogEntry>;
  signature: string;
};

export function useStableCatalogEntries({
  entries,
  allEntries,
  signature,
}: UseStableCatalogEntriesArgs): ReadonlyArray<CatalogEntry> {
  const stableIdsRef = React.useRef<ReadonlyArray<string>>(entries.map((entry) => entry.id));
  const signatureRef = React.useRef(signature);

  if (signatureRef.current !== signature) {
    signatureRef.current = signature;
    stableIdsRef.current = entries.map((entry) => entry.id);
  }

  const byId = React.useMemo(
    () => new Map(allEntries.map((entry) => [entry.id, entry] as const)),
    [allEntries],
  );

  const ids = stableIdsRef.current;
  return ids.map((id) => byId.get(id)).filter(Boolean) as CatalogEntry[];
}
