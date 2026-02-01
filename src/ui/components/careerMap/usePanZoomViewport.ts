import React from "react";

export type PanZoomViewport = {
  x: number;
  y: number;
  scale: number;
};

type UsePanZoomViewportArgs = {
  storageKey: string;
  initial: PanZoomViewport;
  minScale?: number;
  maxScale?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function loadViewport(storageKey: string, fallback: PanZoomViewport): PanZoomViewport {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<PanZoomViewport>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      typeof parsed.scale !== "number"
    ) {
      return fallback;
    }

    return { x: parsed.x, y: parsed.y, scale: parsed.scale };
  } catch {
    return fallback;
  }
}

function persistViewport(storageKey: string, viewport: PanZoomViewport) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(viewport));
  } catch {
    // Ignore persistence failures (storage can be full/blocked).
  }
}

function hasPersistedViewport(storageKey: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

export function usePanZoomViewport({
  storageKey,
  initial,
  minScale = 0.5,
  maxScale = 2.75,
}: UsePanZoomViewportArgs) {
  const persistedOnInitRef = React.useRef<boolean>(hasPersistedViewport(storageKey));
  const skipPersistRef = React.useRef(true);
  const [viewport, setViewport] = React.useState<PanZoomViewport>(() =>
    loadViewport(storageKey, initial),
  );

  const setClampedViewport = React.useCallback(
    (next: PanZoomViewport) => {
      setViewport({
        x: Number.isFinite(next.x) ? next.x : 0,
        y: Number.isFinite(next.y) ? next.y : 0,
        scale: clamp(Number.isFinite(next.scale) ? next.scale : 1, minScale, maxScale),
      });
    },
    [maxScale, minScale],
  );

  React.useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    persistViewport(storageKey, viewport);
  }, [storageKey, viewport]);

  return {
    viewport,
    setViewport: setClampedViewport,
    reset: () => setClampedViewport(initial),
    minScale,
    maxScale,
    loadedFromStorage: persistedOnInitRef.current,
  };
}
