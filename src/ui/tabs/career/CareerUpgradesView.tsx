import React from "react";

import { CAREER_NODES, CAREER_TRACKS } from "../../../game/data/career";
import type { CareerNodeId } from "../../../game/model/types";
import { getTherapistCareer, respecCareerNodes, spendCareerNode } from "../../../game/state";
import type { GameState } from "../../../game/state";
import { computeCareerNodeTiers } from "../../components/careerTreeLayout";

import { CareerUpgradeModal, type CareerUpgradeModalModel } from "./CareerUpgradeModal";
import {
  CareerUpgradesCanvas,
  type CareerUpgradesCanvasEdge,
  type CareerUpgradesCanvasNode,
} from "./CareerUpgradesCanvas";

type CareerUpgradesViewProps = {
  state: GameState;
  nowMs: number;
  onPurchase: (nextState: GameState) => void;
};

function shortDescription(text: string) {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  if (match) {
    return match[0].trim();
  }
  return trimmed;
}

function buildUpgradeNode(args: {
  node: (typeof CAREER_NODES)[number];
  tierById: Map<CareerNodeId, number>;
  labelById: Map<CareerNodeId, string>;
  spentNodes: Record<CareerNodeId, boolean>;
  pointsAvailable: number;
  x: number;
  y: number;
}): CareerUpgradesCanvasNode {
  const { node, tierById, labelById, spentNodes, pointsAvailable, x, y } = args;
  const tier = tierById.get(node.id) ?? 0;
  const isSpent = Boolean(spentNodes[node.id]);
  const prereqsMet = node.prerequisites.every((id) => Boolean(spentNodes[id]));
  const canAfford = pointsAvailable >= node.costPoints;
  const canSpend = !isSpent && prereqsMet && canAfford;
  const status: CareerUpgradesCanvasNode["status"] = isSpent
    ? "spent"
    : canSpend
      ? "available"
      : "locked";

  const missingPrereqs = node.prerequisites.filter((id) => !spentNodes[id]);
  const missingLabels = missingPrereqs
    .map((id) => labelById.get(id))
    .filter(Boolean)
    .join(", ");
  const missingPoints = Math.max(0, node.costPoints - pointsAvailable);
  const hint = isSpent
    ? "Unlocked"
    : !prereqsMet
      ? `Requires ${missingLabels || "prerequisite"}`
      : !canAfford
        ? `Need ${missingPoints} more point${missingPoints === 1 ? "" : "s"}`
        : "Spend point";

  return {
    id: node.id,
    x,
    y,
    tier,
    label: node.label,
    shortDescription: shortDescription(node.description),
    costPoints: node.costPoints,
    status,
    canSpend,
    hint,
    testId: `career-tree-node-${node.id}`,
  };
}

export function CareerUpgradesView({ state, nowMs, onPurchase }: CareerUpgradesViewProps) {
  const career = getTherapistCareer(state);
  const careerStarted = career.careerStartId !== null;
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);

  if (!careerStarted) {
    return (
      <div className="card career-upgrades-empty" data-testid="career-upgrades-empty">
        <h4>Career upgrades</h4>
        <p className="muted">Start your career to unlock the progression tree.</p>
      </div>
    );
  }

  const tierById = computeCareerNodeTiers(CAREER_NODES);
  const labelById = new Map(CAREER_NODES.map((node) => [node.id, node.label] as const));

  const coreNodes = CAREER_NODES.filter((node) => node.trackId === "core");
  const activeTrackId = career.activeTrackId;
  const trackNodes = activeTrackId
    ? CAREER_NODES.filter((node) => node.trackId === activeTrackId)
    : [];

  const tierGapX = 110;
  const rowGapY = 74;
  const baseX = 46;
  const baseY = 62;

  const sortByTierThenLabel = (
    a: (typeof CAREER_NODES)[number],
    b: (typeof CAREER_NODES)[number],
  ) => {
    const ta = tierById.get(a.id) ?? 0;
    const tb = tierById.get(b.id) ?? 0;
    if (ta !== tb) {
      return ta - tb;
    }
    return a.label.localeCompare(b.label);
  };

  const buildSection = (list: Array<(typeof CAREER_NODES)[number]>, sectionOffsetY: number) => {
    const byTier = new Map<number, Array<(typeof CAREER_NODES)[number]>>();
    for (const node of list.slice().sort(sortByTierThenLabel)) {
      const tier = tierById.get(node.id) ?? 0;
      const existing = byTier.get(tier);
      if (existing) {
        existing.push(node);
      } else {
        byTier.set(tier, [node]);
      }
    }

    const tiers = Array.from(byTier.keys()).sort((a, b) => a - b);
    const out: CareerUpgradesCanvasNode[] = [];
    for (const tier of tiers) {
      const items = byTier.get(tier) ?? [];
      items.forEach((node, idx) => {
        out.push(
          buildUpgradeNode({
            node,
            tierById,
            labelById,
            spentNodes: career.spentNodes,
            pointsAvailable: career.pointsAvailable,
            x: baseX + tier * tierGapX,
            y: sectionOffsetY + idx * rowGapY,
          }),
        );
      });
    }

    const maxRows = Math.max(0, ...tiers.map((tier) => (byTier.get(tier) ?? []).length));
    const sectionHeight = maxRows * rowGapY + 60;
    const maxTier = tiers.length > 0 ? Math.max(...tiers) : 0;
    const sectionWidth = (maxTier + 1) * tierGapX + 120;
    return { nodes: out, sectionWidth, sectionHeight };
  };

  const coreSection = buildSection(coreNodes, baseY + 64);
  const trackSection = buildSection(trackNodes, baseY + 64 + coreSection.sectionHeight + 110);

  const nodes: CareerUpgradesCanvasNode[] = [...coreSection.nodes, ...trackSection.nodes];
  const edges: CareerUpgradesCanvasEdge[] = [];
  for (const node of [...coreNodes, ...trackNodes]) {
    for (const prereq of node.prerequisites) {
      edges.push({ id: `edge-upgrade-${prereq}-${node.id}`, from: prereq, to: node.id });
    }
  }

  const contentWidth = Math.max(coreSection.sectionWidth, trackSection.sectionWidth, 520);
  const contentHeight = Math.max(
    baseY + 64 + coreSection.sectionHeight + 110 + trackSection.sectionHeight,
    520,
  );

  const respecDisabled = !Object.values(career.spentNodes).some(Boolean);
  const trackLabel = activeTrackId
    ? (CAREER_TRACKS.find((track) => track.id === activeTrackId)?.label ?? "Track upgrades")
    : "Track upgrades";
  const trackDescriptor = activeTrackId ? "Track specialization active" : "Track specialization pending";

  const selected = selectedNodeId
    ? (CAREER_NODES.find((node) => node.id === selectedNodeId) ?? null)
    : null;
  const selectedModel: CareerUpgradeModalModel | null = selected
    ? (() => {
        const tier = tierById.get(selected.id) ?? 0;
        const candidate = buildUpgradeNode({
          node: selected,
          tierById,
          labelById,
          spentNodes: career.spentNodes,
          pointsAvailable: career.pointsAvailable,
          x: 0,
          y: 0,
        });
        return {
          title: `${selected.label} (Tier ${tier + 1})`,
          description: selected.description,
          hint: candidate.hint,
          costPoints: selected.costPoints,
          status: candidate.status,
          canSpend: candidate.canSpend,
        };
      })()
    : null;

  return (
    <>
      <div className="career-tree-header career-tree-header-deep" data-testid="career-tree-header">
        <div className="career-tree-header-copy">
          <p className="eyebrow">Complication lattice</p>
          <h4>Progression tree</h4>
          <p className="muted">Spend points to unlock track upgrades.</p>
        </div>
        <div className="career-tree-controls">
          <span className="career-tree-points" data-testid="career-tree-points">
            {career.pointsAvailable} points
          </span>
          <span className="career-tree-track-chip">{trackDescriptor}</span>
          <button
            type="button"
            className="secondary"
            data-testid="career-tree-respec"
            onClick={() => onPurchase(respecCareerNodes(state, nowMs))}
            disabled={respecDisabled}
          >
            Respec
          </button>
        </div>
      </div>

      <div className="career-upgrades-sections">
        <div className="career-upgrades-section-card">
          <p className="career-upgrades-section-kicker">Core deck</p>
          <h5>Core foundations</h5>
          <p className="muted">Baseline unlocks that improve your overall career cycle.</p>
        </div>
        <div className="career-upgrades-section-card">
          <p className="career-upgrades-section-kicker">Active track</p>
          <h5>{trackLabel}</h5>
          <p className="muted">
            {activeTrackId
              ? "Upgrades tied to your chosen track."
              : "Select a primary track to unlock track upgrades."}
          </p>
        </div>
      </div>

      <CareerUpgradesCanvas
        nodes={nodes}
        edges={edges}
        width={contentWidth}
        height={contentHeight}
        onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
      />

      <CareerUpgradeModal
        open={Boolean(selectedModel)}
        model={selectedModel}
        onClose={() => setSelectedNodeId(null)}
        onSpend={() => {
          if (!selected) {
            return;
          }
          onPurchase(spendCareerNode(state, selected.id as CareerNodeId, nowMs));
          setSelectedNodeId(null);
        }}
      />
    </>
  );
}
