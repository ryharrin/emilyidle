import React from "react";

import type { CareerNodeId } from "../../game/model/types";

export type CareerTreeNode = {
  id: CareerNodeId;
  label: string;
  description: string;
  costPoints: number;
  tier?: number;
  status: "available" | "locked" | "spent";
  hint?: string;
  canSpend: boolean;
};

export type CareerTreeSection = {
  id: string;
  label: string;
  description?: string;
  nodes: CareerTreeNode[];
};

type CareerTreeProps = {
  pointsAvailable: number;
  sections: CareerTreeSection[];
  onSpendNode: (nodeId: CareerNodeId) => void;
  onRespec: () => void;
  respecDisabled: boolean;
};

export function CareerTree({
  pointsAvailable,
  sections,
  onSpendNode,
  onRespec,
  respecDisabled,
}: CareerTreeProps) {
  return (
    <div className="card career-tree" data-testid="career-tree">
      <div className="career-tree-header">
        <div>
          <h4>Progression tree</h4>
          <p className="muted">Spend points to unlock track upgrades.</p>
        </div>
        <div className="career-tree-controls">
          <span className="career-tree-points" data-testid="career-tree-points">
            {pointsAvailable} points
          </span>
          <button
            type="button"
            className="secondary"
            data-testid="career-tree-respec"
            onClick={onRespec}
            disabled={respecDisabled}
          >
            Respec
          </button>
        </div>
      </div>

      <div className="career-tree-body">
        {sections.map((section) => (
          <div
            key={section.id}
            className="career-tree-section"
            data-testid={`career-tree-section-${section.id}`}
          >
            <div className="career-tree-section-header">
              <div>
                <h5 data-testid={`career-tree-section-title-${section.id}`}>{section.label}</h5>
                {section.description && <p className="muted">{section.description}</p>}
              </div>
            </div>
            {(() => {
              const tiered = new Map<number, CareerTreeNode[]>();
              for (const node of section.nodes) {
                const tier = node.tier ?? 0;
                const list = tiered.get(tier);
                if (list) {
                  list.push(node);
                } else {
                  tiered.set(tier, [node]);
                }
              }
              const tiers = Array.from(tiered.keys()).sort((a, b) => a - b);
              const sortNodes = (a: CareerTreeNode, b: CareerTreeNode) => {
                const statusOrder: Record<CareerTreeNode["status"], number> = {
                  available: 0,
                  spent: 1,
                  locked: 2,
                };
                const statusDelta = statusOrder[a.status] - statusOrder[b.status];
                if (statusDelta !== 0) {
                  return statusDelta;
                }
                return a.label.localeCompare(b.label);
              };

              return (
                <div className="career-tree-tier-strip">
                  {tiers.map((tier) => (
                    <div className="career-tree-tier" key={tier}>
                      <div className="career-tree-tier-label">Tier {tier + 1}</div>
                      <div className="career-tree-tier-nodes">
                        {(tiered.get(tier) ?? [])
                          .slice()
                          .sort(sortNodes)
                          .map((node) => (
                            <button
                              key={node.id}
                              type="button"
                              className={`career-tree-node career-tree-${node.status}`}
                              data-testid={`career-tree-node-${node.id}`}
                              disabled={!node.canSpend}
                              onClick={() => onSpendNode(node.id)}
                            >
                              <div className="career-tree-node-header">
                                <div className="career-tree-node-title">{node.label}</div>
                                <span className="career-tree-node-cost">{node.costPoints} pt</span>
                              </div>
                              <p className="career-tree-node-desc">{node.description}</p>
                              {node.hint && (
                                <span className="career-tree-node-hint">{node.hint}</span>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
