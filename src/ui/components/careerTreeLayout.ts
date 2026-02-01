import type { CareerNodeId } from "../../game/model/types";

export function computeCareerNodeTiers(
  nodes: ReadonlyArray<{ id: CareerNodeId; prerequisites: ReadonlyArray<CareerNodeId> }>,
): Map<CareerNodeId, number> {
  const byId = new Map(nodes.map((node) => [node.id, node] as const));
  const memo = new Map<CareerNodeId, number>();
  const visiting = new Set<CareerNodeId>();

  const compute = (id: CareerNodeId): number => {
    const cached = memo.get(id);
    if (cached !== undefined) {
      return cached;
    }

    const node = byId.get(id);
    if (!node) {
      throw new Error(`Unknown career node prerequisite: ${id}`);
    }

    if (visiting.has(id)) {
      throw new Error(`Career node graph has a cycle at: ${id}`);
    }

    visiting.add(id);
    const prereqs = node.prerequisites;
    const tier =
      prereqs.length <= 0 ? 0 : 1 + Math.max(...prereqs.map((prereqId) => compute(prereqId)));
    visiting.delete(id);

    memo.set(id, tier);
    return tier;
  };

  for (const node of nodes) {
    compute(node.id);
  }

  return memo;
}
