import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import React from "react";

type UseCatalogVirtualizerOptions = {
  count: number;
  enabled: boolean;
  estimateSize?: number;
  overscan?: number;
};

export type CatalogVirtualizerResult = {
  virtualItems: VirtualItem[];
  totalSize: number;
  paddingTop: number;
  paddingBottom: number;
};

export function useCatalogVirtualizer({
  count,
  enabled,
  estimateSize = 420,
  overscan = 6,
}: UseCatalogVirtualizerOptions): CatalogVirtualizerResult | null {
  const scrollElement = React.useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }
    return document.scrollingElement ?? document.documentElement;
  }, []);

  const virtualizationReady = enabled && scrollElement !== null;

  const virtualizer = useVirtualizer({
    count: virtualizationReady ? count : 0,
    estimateSize: () => estimateSize,
    getScrollElement: () => scrollElement,
    overscan,
  });

  if (!virtualizationReady) {
    return null;
  }

  const virtualItems = virtualizer.getVirtualItems();
  const firstItem = virtualItems[0];
  const lastItem = virtualItems[virtualItems.length - 1];

  return {
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    paddingTop: firstItem?.start ?? 0,
    paddingBottom: virtualizer.getTotalSize() - (lastItem?.end ?? 0),
  };
}
