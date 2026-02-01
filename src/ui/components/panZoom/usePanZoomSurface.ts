import React from "react";

import { usePanZoomViewport } from "../careerMap/usePanZoomViewport";

export type PanZoomViewport = {
  x: number;
  y: number;
  scale: number;
};

export type PanZoomSize = {
  width: number;
  height: number;
};

type PointerSnapshot = {
  x: number;
  y: number;
};

type UsePanZoomSurfaceArgs = {
  storageKey: string;
  initial: PanZoomViewport;
  content: PanZoomSize;
  clampMargin?: number;
  onInteractionStart?: () => void;
};

function clampViewport(
  viewport: PanZoomViewport,
  view: PanZoomSize,
  content: PanZoomSize,
  margin: number,
) {
  const contentWidth = content.width * viewport.scale;
  const contentHeight = content.height * viewport.scale;

  const clampAxis = (pos: number, viewSize: number, contentSize: number) => {
    if (contentSize <= viewSize - margin * 2) {
      return (viewSize - contentSize) / 2;
    }

    const min = viewSize - contentSize - margin;
    const max = margin;
    return Math.min(max, Math.max(min, pos));
  };

  return {
    x: clampAxis(viewport.x, view.width, contentWidth),
    y: clampAxis(viewport.y, view.height, contentHeight),
    scale: viewport.scale,
  };
}

export function usePanZoomSurface({
  storageKey,
  initial,
  content,
  clampMargin = 60,
  onInteractionStart,
}: UsePanZoomSurfaceArgs) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const { viewport, setViewport, reset, loadedFromStorage } = usePanZoomViewport({
    storageKey,
    initial,
  });

  const getViewSize = React.useCallback((): PanZoomSize | null => {
    const el = viewportRef.current;
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  const clampToView = React.useCallback(
    (next: PanZoomViewport) => {
      const viewSize = getViewSize();
      return viewSize ? clampViewport(next, viewSize, content, clampMargin) : next;
    },
    [clampMargin, content, getViewSize],
  );

  const applyZoomAt = React.useCallback(
    (nextScale: number, clientX: number, clientY: number) => {
      const el = viewportRef.current;
      if (!el) {
        setViewport({ ...viewport, scale: nextScale });
        return;
      }

      const bounds = el.getBoundingClientRect();
      const px = clientX - bounds.left;
      const py = clientY - bounds.top;
      const contentX = (px - viewport.x) / viewport.scale;
      const contentY = (py - viewport.y) / viewport.scale;
      const nextX = px - contentX * nextScale;
      const nextY = py - contentY * nextScale;
      setViewport(clampToView({ x: nextX, y: nextY, scale: nextScale }));
    },
    [clampToView, setViewport, viewport],
  );

  const pointers = React.useRef(new Map<number, PointerSnapshot>());
  const dragStart = React.useRef<{
    x: number;
    y: number;
    viewportX: number;
    viewportY: number;
  } | null>(null);
  const pinchStart = React.useRef<{
    distance: number;
    midpoint: PointerSnapshot;
    viewport: PanZoomViewport;
  } | null>(null);

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    onInteractionStart?.();

    if (event.ctrlKey) {
      const direction = event.deltaY > 0 ? -1 : 1;
      const delta = direction * 0.12;
      applyZoomAt(viewport.scale * (1 + delta), event.clientX, event.clientY);
      return;
    }

    setViewport(
      clampToView({
        x: viewport.x - event.deltaX,
        y: viewport.y - event.deltaY,
        scale: viewport.scale,
      }),
    );
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    onInteractionStart?.();

    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const all = Array.from(pointers.current.values());
    if (all.length === 1) {
      dragStart.current = {
        x: event.clientX,
        y: event.clientY,
        viewportX: viewport.x,
        viewportY: viewport.y,
      };
      pinchStart.current = null;
      return;
    }

    if (all.length === 2) {
      const [a, b] = all;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      pinchStart.current = {
        distance: Math.hypot(dx, dy),
        midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        viewport: { ...viewport },
      };
      dragStart.current = null;
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const all = Array.from(pointers.current.values());
    if (all.length === 1) {
      const start = dragStart.current;
      if (!start) {
        return;
      }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      setViewport(
        clampToView({ x: start.viewportX + dx, y: start.viewportY + dy, scale: viewport.scale }),
      );
      return;
    }

    if (all.length === 2) {
      const base = pinchStart.current;
      if (!base || base.distance <= 0) {
        return;
      }
      const [a, b] = all;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      applyZoomAt(
        base.viewport.scale * (Math.hypot(dx, dy) / base.distance),
        base.midpoint.x,
        base.midpoint.y,
      );
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }
    pointers.current.delete(event.pointerId);
    dragStart.current = null;
    pinchStart.current = null;
  };

  React.useEffect(() => {
    const viewSize = getViewSize();
    if (!viewSize) {
      return;
    }
    const next = clampViewport(viewport, viewSize, content, clampMargin);
    const deltaX = Math.abs(next.x - viewport.x);
    const deltaY = Math.abs(next.y - viewport.y);
    if (deltaX > 0.5 || deltaY > 0.5) {
      setViewport(next);
    }
  }, [clampMargin, content, getViewSize, setViewport, viewport]);

  return {
    viewportRef,
    viewport,
    setViewport,
    reset,
    loadedFromStorage,
    getViewSize,
    clampToView,
    applyZoomAt,
    bind: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
