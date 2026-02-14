import React from "react";

import { CAREER_TRACKS } from "../../../game/data/career";
import {
  CAREER_EXPANSION_FOCUSES,
  CAREER_MODALITIES,
  CAREER_OPERATING_STYLES,
  CAREER_STAGES,
} from "../../../game/data/careerStages";
import {
  chooseCareerExpansionFocus,
  chooseCareerModality,
  chooseCareerOperatingStyle,
  getCareerChoicePreview,
  getTherapistCareer,
  getTherapistCareerChoiceStatus,
  getTherapistCareerStageId,
  getTherapistCareerStageUnlockLevel,
  selectPrimaryCareerTrack,
} from "../../../game/state";
import type { GameState } from "../../../game/state";
import type {
  CareerExpansionFocusId,
  CareerModalityId,
  CareerOperatingStyleId,
  CareerTrackId,
} from "../../../game/model/types";
import { CareerStageChoicePreview } from "../../components/CareerStageChoicePreview";
import { CareerMapCanvas } from "../../components/careerMap/CareerMapCanvas";
import type {
  CareerMapEdge,
  CareerMapLayout,
  CareerMapNode,
} from "../../components/careerMap/types";
import { ConfirmModal } from "../../components/ConfirmModal";

type CareerMapProps = {
  state: GameState;
  onPurchase: (nextState: GameState) => void;
};

type NodeAction =
  | { type: "track"; trackId: CareerTrackId }
  | { type: "modality"; choiceId: CareerModalityId }
  | { type: "operatingStyle"; choiceId: CareerOperatingStyleId }
  | { type: "expansionFocus"; choiceId: CareerExpansionFocusId };

type CareerChoicePreviewArgs = Parameters<typeof getCareerChoicePreview>[1];

type CareerChoiceStageId =
  | "licensed-associate"
  | "specialist-certification"
  | "practice-builder"
  | "private-practice-owner";

function getPreviewArgs(action: NodeAction): CareerChoicePreviewArgs {
  switch (action.type) {
    case "track":
      return { stageId: "licensed-associate", choiceId: action.trackId };
    case "modality":
      return { stageId: "specialist-certification", choiceId: action.choiceId };
    case "operatingStyle":
      return { stageId: "practice-builder", choiceId: action.choiceId };
    case "expansionFocus":
      return { stageId: "private-practice-owner", choiceId: action.choiceId };
  }
}

function getChoiceLabel(action: NodeAction): string {
  if (action.type === "track") {
    return CAREER_TRACKS.find((track) => track.id === action.trackId)?.label ?? action.trackId;
  }
  if (action.type === "modality") {
    return (
      CAREER_MODALITIES.find((choice) => choice.id === action.choiceId)?.label ?? action.choiceId
    );
  }
  if (action.type === "operatingStyle") {
    return (
      CAREER_OPERATING_STYLES.find((choice) => choice.id === action.choiceId)?.label ??
      action.choiceId
    );
  }
  return (
    CAREER_EXPANSION_FOCUSES.find((choice) => choice.id === action.choiceId)?.label ??
    action.choiceId
  );
}

function getChoiceStageLabel(action: NodeAction): string {
  if (action.type === "track") {
    return "primary track";
  }
  if (action.type === "modality") {
    return "modality";
  }
  if (action.type === "operatingStyle") {
    return "operating style";
  }
  return "expansion focus";
}

function layoutCareerMap(state: GameState): {
  layout: CareerMapLayout;
  actions: Map<string, NodeAction>;
  bodies: Map<string, React.ReactNode>;
} {
  const career = getTherapistCareer(state);

  const actions = new Map<string, NodeAction>();
  const bodies = new Map<string, React.ReactNode>();
  const nodes: CareerMapNode[] = [];
  const edges: CareerMapEdge[] = [];

  const stageGapX = 260;
  const stageWidth = 220;
  const stageHeight = 126;
  const stageY = 40;
  const stageX0 = 40;

  const currentStageId = getTherapistCareerStageId(career.level);
  const currentStageIndex = CAREER_STAGES.findIndex((stage) => stage.id === currentStageId);

  nodes.push({
    id: "meta-stages",
    kind: "meta",
    x: stageX0,
    y: 0,
    width: 280,
    height: 32,
    label: "Career stages",
    description: undefined,
    testId: "career-stages-card",
  });

  for (let i = 0; i < CAREER_STAGES.length; i += 1) {
    const stage = CAREER_STAGES[i];
    const reached = i <= currentStageIndex;
    const id = `stage-${stage.id}`;
    const x = stageX0 + i * stageGapX;
    const y = stageY;
    nodes.push({
      id,
      kind: "stage",
      status: reached ? "chosen" : "locked",
      x,
      y,
      width: stageWidth,
      height: stageHeight,
      label: stage.label,
      description: stage.description,
      hint: `Level ${stage.unlockLevel}+`,
      testId: `career-stage-node-${stage.id}`,
    });

    if (i > 0) {
      edges.push({
        id: `edge-stage-${CAREER_STAGES[i - 1].id}-${stage.id}`,
        from: `stage-${CAREER_STAGES[i - 1].id}`,
        to: id,
        kind: "solid",
      });
    }
  }

  nodes.push({
    id: "meta-stage-current",
    kind: "meta",
    x: stageX0 + Math.max(0, currentStageIndex) * stageGapX,
    y: stageY + stageHeight + 6,
    width: 220,
    height: 32,
    label: `${CAREER_STAGES[currentStageIndex]?.label ?? "Career"} - Level ${career.level.toLocaleString()}`,
    testId: "career-stage-current",
  });

  if (career.careerStartId === null) {
    nodes.push({
      id: "career-start-hint",
      kind: "meta",
      status: "locked",
      x: stageX0,
      y: stageY + stageHeight + 64,
      width: 420,
      height: 60,
      label: "Start your career to unlock choices and upgrades",
      description: "Use the Career next-action card to enter the PhD program.",
    });
  }

  const choiceStatus = getTherapistCareerChoiceStatus(state);
  const nextAvailable = choiceStatus.find((status) => status.available) ?? null;
  const nextLocked = choiceStatus.find((status) => !status.unlocked) ?? null;
  const choice = nextAvailable ?? nextLocked;

  const choiceBaseY = stageY + stageHeight + 96;
  const choiceCardW = 260;
  const choiceCardH = 180;
  const choiceGap = 18;

  const addChoiceOptions = (
    stageId: CareerChoiceStageId,
    title: string,
    options: Array<{ id: string; label: string; description: string; action: NodeAction }>,
  ) => {
    const stageIndex = CAREER_STAGES.findIndex((stage) => stage.id === stageId);
    const stageX = stageX0 + Math.max(0, stageIndex) * stageGapX;
    const totalWidth = options.length * choiceCardW + Math.max(0, options.length - 1) * choiceGap;
    const baseX = stageX + stageWidth / 2 - totalWidth / 2;

    nodes.push({
      id: `choice-${stageId}-title`,
      kind: "meta",
      x: baseX,
      y: choiceBaseY - 34,
      width: totalWidth,
      height: 28,
      label: title,
      testId: `career-stage-block-${stageId}`,
    });

    options.forEach((option, index) => {
      const nodeId = `choice-${stageId}-${option.id}`;
      const x = baseX + index * (choiceCardW + choiceGap);
      const y = choiceBaseY;
      nodes.push({
        id: nodeId,
        kind: "choice-option",
        status: nextAvailable ? "available" : "locked",
        x,
        y,
        width: choiceCardW,
        height: choiceCardH,
        label: option.label,
        description: option.description,
        testId: `career-choice-option-${option.id}`,
      });
      actions.set(nodeId, option.action);

      bodies.set(
        nodeId,
        <div className="career-map-choice-preview">
          <CareerStageChoicePreview
            preview={getCareerChoicePreview(state, getPreviewArgs(option.action))}
          />
        </div>,
      );

      edges.push({
        id: `edge-${stageId}-${option.id}`,
        from: `stage-${stageId}`,
        to: nodeId,
        kind: "dashed",
      });
    });
  };

  if (choice && career.careerStartId !== null) {
    const unlockLevel = getTherapistCareerStageUnlockLevel(choice.stageId);
    const heading =
      CAREER_STAGES.find((stage) => stage.id === choice.stageId)?.label ?? choice.stageId;

    if (!choice.unlocked) {
      nodes.push({
        id: `locked-${choice.stageId}`,
        kind: "choice-option",
        status: "locked",
        x: stageX0,
        y: choiceBaseY,
        width: 320,
        height: 96,
        label: heading,
        description: `Unlocks at level ${unlockLevel}.`,
        hint: "Locked",
        testId: `career-stage-block-${choice.stageId}`,
      });
    } else {
      if (choice.stageId === "licensed-associate") {
        addChoiceOptions(
          "licensed-associate",
          "Choose a primary track (permanent)",
          CAREER_TRACKS.map((track) => ({
            id: track.id,
            label: track.label,
            description: track.description,
            action: { type: "track", trackId: track.id },
          })),
        );
      } else if (choice.stageId === "specialist-certification") {
        addChoiceOptions(
          "specialist-certification",
          "Choose a modality (permanent)",
          CAREER_MODALITIES.map((opt) => ({
            id: opt.id,
            label: opt.label,
            description: opt.description,
            action: { type: "modality", choiceId: opt.id },
          })),
        );
      } else if (choice.stageId === "practice-builder") {
        addChoiceOptions(
          "practice-builder",
          "Choose an operating style (permanent)",
          CAREER_OPERATING_STYLES.map((opt) => ({
            id: opt.id,
            label: opt.label,
            description: opt.description,
            action: { type: "operatingStyle", choiceId: opt.id },
          })),
        );
      } else if (choice.stageId === "private-practice-owner") {
        addChoiceOptions(
          "private-practice-owner",
          "Choose an expansion focus (permanent)",
          CAREER_EXPANSION_FOCUSES.map((opt) => ({
            id: opt.id,
            label: opt.label,
            description: opt.description,
            action: { type: "expansionFocus", choiceId: opt.id },
          })),
        );
      }
    }
  }

  const maxX = Math.max(0, ...nodes.map((n) => n.x + n.width)) + 80;
  const maxY = Math.max(0, ...nodes.map((n) => n.y + n.height)) + 80;

  return {
    layout: { nodes, edges, width: maxX, height: maxY },
    actions,
    bodies,
  };
}

export function CareerMap({ state, onPurchase }: CareerMapProps) {
  const career = getTherapistCareer(state);
  const { layout, actions, bodies } = React.useMemo(() => layoutCareerMap(state), [state]);
  const [pendingChoiceAction, setPendingChoiceAction] = React.useState<NodeAction | null>(null);
  const currentStageId = getTherapistCareerStageId(career.level);
  const currentStage =
    CAREER_STAGES.find((stage) => stage.id === currentStageId) ?? CAREER_STAGES[0];
  const unlockedStages = CAREER_STAGES.filter((stage) => career.level >= stage.unlockLevel).length;
  const pendingChoices = getTherapistCareerChoiceStatus(state).filter((status) => !status.chosen);

  const commitChoiceAction = React.useCallback(
    (action: NodeAction) => {
      if (action.type === "track") {
        onPurchase(selectPrimaryCareerTrack(state, action.trackId));
        return;
      }

      if (action.type === "modality") {
        onPurchase(chooseCareerModality(state, action.choiceId));
        return;
      }

      if (action.type === "operatingStyle") {
        onPurchase(chooseCareerOperatingStyle(state, action.choiceId));
        return;
      }

      onPurchase(chooseCareerExpansionFocus(state, action.choiceId));
    },
    [onPurchase, state],
  );

  const handleNodeClick = (nodeId: string) => {
    const action = actions.get(nodeId);
    if (!action) {
      return;
    }

    setPendingChoiceAction(action);
  };

  const confirmPendingChoice = () => {
    if (!pendingChoiceAction) {
      return;
    }
    commitChoiceAction(pendingChoiceAction);
    setPendingChoiceAction(null);
  };

  const choiceLabel = pendingChoiceAction ? getChoiceLabel(pendingChoiceAction) : "";
  const stageLabel = pendingChoiceAction ? getChoiceStageLabel(pendingChoiceAction) : "";

  return (
    <div className="career-map-shell" data-testid="career-map-shell">
      <div className="career-canvas-header career-canvas-header-map">
        <div className="career-canvas-header-copy">
          <p className="eyebrow">Caliber blueprint</p>
          <h4>Career stage map</h4>
          <p className="muted">
            Follow progression thresholds and lock permanent specialty choices.
          </p>
        </div>
        <dl className="career-canvas-instruments" aria-label="Career map status">
          <div className="career-canvas-instrument">
            <dt>Current stage</dt>
            <dd>{currentStage.label}</dd>
          </div>
          <div className="career-canvas-instrument">
            <dt>Stage index</dt>
            <dd>
              {unlockedStages}/{CAREER_STAGES.length}
            </dd>
          </div>
          <div className="career-canvas-instrument">
            <dt>Pending choices</dt>
            <dd>{pendingChoices.length}</dd>
          </div>
        </dl>
      </div>
      <CareerMapCanvas
        nodes={layout.nodes}
        edges={layout.edges}
        width={layout.width}
        height={layout.height}
        onNodeClick={handleNodeClick}
        isNodeInteractive={(nodeId) => actions.has(nodeId)}
        renderNodeBody={(nodeId) => bodies.get(nodeId) ?? null}
      />
      <ConfirmModal
        open={pendingChoiceAction !== null}
        title="Lock in permanent choice"
        description={`Choose ${choiceLabel} as your ${stageLabel}. This permanent choice cannot be changed in this run.`}
        confirmLabel="Confirm choice"
        cancelLabel="Keep browsing"
        confirmTestId="career-permanent-choice-confirm"
        cancelTestId="career-permanent-choice-cancel"
        onConfirm={confirmPendingChoice}
        onCancel={() => setPendingChoiceAction(null)}
      />
    </div>
  );
}
