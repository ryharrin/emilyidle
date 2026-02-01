import React from "react";

import type { CareerMapEdge, CareerMapNode } from "./types";
import { usePanZoomSurface } from "../panZoom/usePanZoomSurface";

type CareerMapCanvasProps = {
  nodes: ReadonlyArray<CareerMapNode>;
  edges: ReadonlyArray<CareerMapEdge>;
  width: number;
  height: number;
  onNodeClick: (nodeId: string) => void;
  isNodeInteractive?: (nodeId: string) => boolean;
  renderNodeBody?: (nodeId: string) => React.ReactNode;
};

const CAREER_MAP_STORAGE_KEY = "emily-idle:career-map-viewport:v1";

function getNodeCenter(node: CareerMapNode) {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

export function CareerMapCanvas({
  nodes,
  edges,
  width,
  height,
  onNodeClick,
  isNodeInteractive,
  renderNodeBody,
}: CareerMapCanvasProps) {
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
    storageKey: CAREER_MAP_STORAGE_KEY,
    initial: { x: 40, y: 40, scale: 1 },
    content: { width, height },
    clampMargin: 60,
  });

  const didAutoFitStages = React.useRef(false);
  const didAutoFitChoices = React.useRef(false);

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

    const availableChoiceNodes = nodes.filter(
      (node) => node.kind === "choice-option" && node.status === "available",
    );
    const stageNodes = nodes.filter((node) => node.kind === "stage");

    const hasAvailableChoices = availableChoiceNodes.length > 0;

    const lockedChoiceNode = nodes.find(
      (node) =>
        node.kind === "choice-option" && node.status === "locked" && node.id.startsWith("locked-"),
    );

    if (hasAvailableChoices) {
      if (didAutoFitChoices.current) {
        return;
      }
      didAutoFitChoices.current = true;
    } else {
      if (didAutoFitStages.current) {
        return;
      }
      didAutoFitStages.current = true;
    }

    const stageFocusNodes = (() => {
      if (stageNodes.length <= 0) {
        return stageNodes;
      }
      const chosenCount = stageNodes.filter((node) => node.status === "chosen").length;
      const currentIndex = Math.max(0, chosenCount - 1);
      const start = Math.max(0, currentIndex - 1);
      const end = Math.min(stageNodes.length, currentIndex + 2);
      return stageNodes.slice(start, end);
    })();

    const focusNodes = hasAvailableChoices
      ? availableChoiceNodes
      : lockedChoiceNode
        ? [...stageFocusNodes, lockedChoiceNode]
        : stageFocusNodes;
    if (focusNodes.length <= 0) {
      return;
    }

    const minX = Math.min(...focusNodes.map((node) => node.x));
    const minY = Math.min(...focusNodes.map((node) => node.y));
    const maxX = Math.max(...focusNodes.map((node) => node.x + node.width));
    const maxY = Math.max(...focusNodes.map((node) => node.y + node.height));
    const rectW = Math.max(1, maxX - minX);
    const rectH = Math.max(1, maxY - minY);

    const padding = hasAvailableChoices ? 80 : 70;
    const fitScale = Math.min(
      1.15,
      Math.max(
        0.7,
        Math.min(viewSize.width / (rectW + padding * 2), viewSize.height / (rectH + padding * 2)),
      ),
    );

    const next = hasAvailableChoices
      ? (() => {
          const rectCenterX = minX + rectW / 2;
          const rectCenterY = minY + rectH / 2;
          return {
            x: viewSize.width / 2 - rectCenterX * fitScale,
            y: viewSize.height / 2 - rectCenterY * fitScale,
            scale: fitScale,
          };
        })()
      : {
          x: padding - minX * fitScale,
          y: padding - minY * fitScale,
          scale: fitScale,
        };

    setViewport(clampToView(next));
  }, [clampToView, getViewSize, loadedFromStorage, nodes, setViewport]);

  return (
    <div className="career-map" data-testid="career-map">
      <div className="career-map-controls">
        <button
          type="button"
          className="secondary"
          data-testid="career-map-zoom-in"
          onClick={() => setViewport(clampToView({ ...viewport, scale: viewport.scale * 1.12 }))}
        >
          +
        </button>
        <button
          type="button"
          className="secondary"
          data-testid="career-map-zoom-out"
          onClick={() => setViewport(clampToView({ ...viewport, scale: viewport.scale / 1.12 }))}
        >
          -
        </button>
        <button type="button" className="secondary" data-testid="career-map-reset" onClick={reset}>
          Reset
        </button>
      </div>

      <div
        ref={viewportRef}
        className="career-map-viewport"
        data-testid="career-map-viewport"
        onWheel={bind.onWheel}
        onPointerDown={bind.onPointerDown}
        onPointerMove={bind.onPointerMove}
        onPointerUp={bind.onPointerUp}
        onPointerCancel={bind.onPointerCancel}
      >
        <div
          className="career-map-content"
          style={{
            width,
            height,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            ["--career-map-scale" as any]: viewport.scale,
          }}
        >
          <svg className="career-map-edges" width={width} height={height} aria-hidden="true">
            {edges.map((edge) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) {
                return null;
              }
              const a = getNodeCenter(from);
              const b = getNodeCenter(to);
              return (
                <line
                  key={edge.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={
                    edge.kind === "dashed"
                      ? "career-map-edge career-map-edge-dashed"
                      : "career-map-edge"
                  }
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={[
                "career-map-node",
                `career-map-node-${node.kind}`,
                node.status ? `career-map-${node.status}` : null,
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
              data-testid={node.testId}
              disabled={isNodeInteractive ? !isNodeInteractive(node.id) : false}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onNodeClick(node.id)}
            >
              <div className="career-map-node-title">{node.label}</div>
              {node.description ? (
                <div className="career-map-node-desc">{node.description}</div>
              ) : null}
              {node.hint ? <div className="career-map-node-hint">{node.hint}</div> : null}
              {renderNodeBody ? renderNodeBody(node.id) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
