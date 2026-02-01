import type { CareerNodeDefinition } from "./careerNodeTypes";

import { CAREER_NODES_CORE } from "./careerNodesCore";
import { CAREER_NODES_OUTPATIENT_CLINIC } from "./careerNodesOutpatientClinic";
import { CAREER_NODES_RESEARCH_TEACHING } from "./careerNodesResearchTeaching";
import { CAREER_NODES_VA_HOSPITAL } from "./careerNodesVaHospital";

export type { CareerNodeDefinition } from "./careerNodeTypes";

export const CAREER_NODES: ReadonlyArray<CareerNodeDefinition> = [
  ...CAREER_NODES_CORE,
  ...CAREER_NODES_OUTPATIENT_CLINIC,
  ...CAREER_NODES_VA_HOSPITAL,
  ...CAREER_NODES_RESEARCH_TEACHING,
];
