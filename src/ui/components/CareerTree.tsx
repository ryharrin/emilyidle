import React from "react";

import type { CareerNodeId } from "../../game/model/types";

export type CareerTreeNode = {
  id: CareerNodeId;
  label: string;
  description: string;
  costPoints: number;
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
    <div className="card career-tree">
      <div className="career-tree-header">
        <div>
          <h4>Progression tree</h4>
          <p className="muted">Spend points to unlock track upgrades.</p>
        </div>
        <div className="career-tree-controls">
          <span className="career-tree-points">{pointsAvailable} points</span>
          <button type="button" className="secondary" onClick={onRespec} disabled={respecDisabled}>
            Respec
          </button>
        </div>
      </div>

      <div className="career-tree-body">
        {sections.map((section) => (
          <div key={section.id} className="career-tree-section">
            <div className="career-tree-section-header">
              <div>
                <h5>{section.label}</h5>
                {section.description && <p className="muted">{section.description}</p>}
              </div>
            </div>
            <div className="career-tree-grid">
              {section.nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={`career-tree-node career-tree-${node.status}`}
                  disabled={!node.canSpend}
                  onClick={() => onSpendNode(node.id)}
                >
                  <div className="career-tree-node-header">
                    <div className="career-tree-node-title">{node.label}</div>
                    <span className="career-tree-node-cost">{node.costPoints} pt</span>
                  </div>
                  <p className="career-tree-node-desc">{node.description}</p>
                  {node.hint && <span className="career-tree-node-hint">{node.hint}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
