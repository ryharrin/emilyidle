export type CareerMapNodeStatus = "available" | "locked" | "spent" | "chosen";

export type CareerMapNodeKind = "stage" | "choice-option" | "progression" | "meta";

export type CareerMapNode = {
  id: string;
  kind: CareerMapNodeKind;
  status?: CareerMapNodeStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description?: string;
  hint?: string;
  testId?: string;
};

export type CareerMapEdge = {
  id: string;
  from: string;
  to: string;
  kind: "solid" | "dashed";
};

export type CareerMapLayout = {
  nodes: CareerMapNode[];
  edges: CareerMapEdge[];
  width: number;
  height: number;
};
