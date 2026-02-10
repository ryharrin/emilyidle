import React from "react";

import { AnchoredTooltip } from "../../components/AnchoredTooltip";
import { usePanZoomSurface } from "../../components/panZoom/usePanZoomSurface";

export type CareerUpgradesCanvasNode = {
  id: string;
  x: number;
  y: number;
  tier: number;
  label: string;
  shortDescription: string;
  costPoints: number;
  status: "available" | "locked" | "spent";
  canSpend: boolean;
  hint: string;
  testId: string;
};

export type CareerUpgradesCanvasEdge = {
  id: string;
  from: string;
  to: string;
};

type CareerUpgradesCanvasProps = {
  nodes: ReadonlyArray<CareerUpgradesCanvasNode>;
  edges: ReadonlyArray<CareerUpgradesCanvasEdge>;
  width: number;
  height: number;
  onNodeClick: (nodeId: string) => void;
};

type TooltipState = {
  nodeId: string;
  anchorEl: HTMLElement;
} | null;

const UPGRADES_STORAGE_KEY = "emily-idle:career-upgrades-viewport:v1";
const NODE_SIZE = 44;

function getCenter(node: { x: number; y: number }) {
  return { x: node.x + NODE_SIZE / 2, y: node.y + NODE_SIZE / 2 };
}

function toMonogram(label: string) {
  const words = label
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length <= 0) {
    return "";
  }
  const take = words.slice(0, 2).map((w) => w[0] ?? "");
  return take.join("").toUpperCase();
}

export function CareerUpgradesCanvas({
  nodes,
  edges,
  width,
  height,
  onNodeClick,
}: CareerUpgradesCanvasProps) {
  const [tooltip, setTooltip] = React.useState<TooltipState>(null);

  const {
    viewportRef,
    viewport,
    setViewport,
    reset,
    loadedFromStorage,
    getViewSize,
    clampToView,
    bind,
  } = usePanZoomSurface({
    storageKey: UPGRADES_STORAGE_KEY,
    initial: { x: 36, y: 36, scale: 1 },
    content: { width, height },
    clampMargin: 50,
    onInteractionStart: () => setTooltip(null),
  });

  const nodeById = React.useMemo(
    () => new Map(nodes.map((node) => [node.id, node] as const)),
    [nodes],
  );

  React.useEffect(() => {
    if (loadedFromStorage) {
      return;
    }
    const viewSize = getViewSize();
    if (!viewSize) {
      return;
    }
    if (nodes.length <= 0) {
      return;
    }

    const focus = nodes.filter((node) => node.tier <= 1);
    const focusNodes = focus.length > 0 ? focus : nodes;
    const minX = Math.min(...focusNodes.map((node) => node.x));
    const minY = Math.min(...focusNodes.map((node) => node.y));
    const maxX = Math.max(...focusNodes.map((node) => node.x + NODE_SIZE));
    const maxY = Math.max(...focusNodes.map((node) => node.y + NODE_SIZE));
    const rectW = Math.max(1, maxX - minX);
    const rectH = Math.max(1, maxY - minY);
    const padding = 60;
    const fitScale = Math.min(
      1.35,
      Math.max(
        0.8,
        Math.min(viewSize.width / (rectW + padding * 2), viewSize.height / (rectH + padding * 2)),
      ),
    );
    setViewport(
      clampToView({
        x: padding - minX * fitScale,
        y: padding - minY * fitScale,
        scale: fitScale,
      }),
    );
  }, [clampToView, getViewSize, loadedFromStorage, nodes, setViewport]);

  const tooltipNode = tooltip ? (nodeById.get(tooltip.nodeId) ?? null) : null;

  const setTooltipForEvent = (nodeId: string, anchorEl: HTMLElement) => {
    setTooltip({ nodeId, anchorEl });
  };

  const clearTooltipForEvent = (anchorEl: HTMLElement) => {
    setTooltip((current) => (current && current.anchorEl === anchorEl ? null : current));
  };

  return (
    <div className="career-upgrades-canvas" data-testid="career-tree">
      <div className="career-upgrades-controls">
        <p className="career-canvas-control-label">Lens controls</p>
        <div className="career-canvas-control-buttons">
          <button
            type="button"
            className="secondary"
            onClick={() => setViewport(clampToView({ ...viewport, scale: viewport.scale * 1.12 }))}
          >
            +
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setViewport(clampToView({ ...viewport, scale: viewport.scale / 1.12 }))}
          >
            -
          </button>
          <button type="button" className="secondary" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="career-upgrades-viewport" {...bind}>
        <div className="career-upgrades-blueprint-grid" aria-hidden="true" />
        <div className="career-upgrades-hud" aria-hidden="true">
          <span>Nodes {nodes.length}</span>
          <span>Links {edges.length}</span>
          <span>Zoom {Math.round(viewport.scale * 100)}%</span>
        </div>
        <div
          className="career-upgrades-content"
          style={{
            width,
            height,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg className="career-upgrades-edges" width={width} height={height} aria-hidden="true">
            {edges.map((edge) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) {
                return null;
              }
              const a = getCenter(from);
              const b = getCenter(to);
              return (
                <line
                  key={edge.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="career-upgrades-edge"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={[
                "career-tree-node",
                "career-upgrades-node",
                `career-tree-${node.status}`,
              ].join(" ")}
              style={{ left: node.x, top: node.y, width: NODE_SIZE, height: NODE_SIZE }}
              data-testid={node.testId}
              data-tier={node.tier + 1}
              aria-disabled={!node.canSpend}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseEnter={(event) => setTooltipForEvent(node.id, event.currentTarget)}
              onMouseLeave={(event) => clearTooltipForEvent(event.currentTarget)}
              onFocus={(event) => setTooltipForEvent(node.id, event.currentTarget)}
              onBlur={(event) => clearTooltipForEvent(event.currentTarget)}
              onClick={() => {
                setTooltip(null);
                onNodeClick(node.id);
              }}
            >
              <span className="career-upgrade-icon" aria-hidden="true">
                {toMonogram(node.label)}
              </span>
              <span className="career-upgrade-tier" aria-hidden="true">
                T{node.tier + 1}
              </span>
              <span className="career-upgrade-cost" aria-hidden="true">
                {node.costPoints}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnchoredTooltip
        open={Boolean(tooltip && tooltipNode)}
        anchorEl={tooltip?.anchorEl ?? null}
        preferredPlacement="top"
        testId="career-upgrades-tooltip"
        content={{
          title: tooltipNode?.label ?? "",
          description: tooltipNode?.shortDescription,
          meta: tooltipNode ? `${tooltipNode.hint} · ${tooltipNode.costPoints} pt` : undefined,
        }}
      />
    </div>
  );
}
