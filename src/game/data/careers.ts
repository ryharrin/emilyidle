import type { CareerStage } from '../types'

export type CareerStageDefinition = {
  id: Exclude<CareerStage, 'pre-phd'>
  title: string
  xpRequired: number
  incomePerSecCents: number
  enjoymentCost: number
  description: string
  unlocks: string[]
}

export const CAREER_STAGES: readonly CareerStageDefinition[] = [
  {
    id: 'PhDStudent',
    title: 'PhD Student',
    xpRequired: 0,
    incomePerSecCents: 10,
    enjoymentCost: 5,
    description: 'Learning and first clients.',
    unlocks: ['quartz'],
  },
  {
    id: 'Externship',
    title: 'Externship',
    xpRequired: 100,
    incomePerSecCents: 25,
    enjoymentCost: 8,
    description: 'Supervised practice and clinical growth.',
    unlocks: ['manual'],
  },
  {
    id: 'VAHospital',
    title: 'VA Hospital',
    xpRequired: 500,
    incomePerSecCents: 50,
    enjoymentCost: 12,
    description: 'Serving veterans with higher responsibility.',
    unlocks: ['automatic', 'jlc-award'],
  },
  {
    id: 'PrivatePractice',
    title: 'Private Practice',
    xpRequired: 2_000,
    incomePerSecCents: 100,
    enjoymentCost: 20,
    description: 'Independent work with stronger earning power.',
    unlocks: ['tourbillon'],
  },
  {
    id: 'GroupPractice',
    title: 'Group Practice',
    xpRequired: 8_000,
    incomePerSecCents: 200,
    enjoymentCost: 35,
    description: 'Collaborative leadership in a larger practice.',
    unlocks: ['all-tiers'],
  },
  {
    id: 'Retirement',
    title: 'Retirement',
    xpRequired: 25_000,
    incomePerSecCents: 50,
    enjoymentCost: 0,
    description: 'Legacy stage focused on reflection and meaning.',
    unlocks: ['endgame'],
  },
] as const

export function getCareerStageById(stageId: CareerStage): CareerStageDefinition | null {
  if (stageId === 'pre-phd') return null
  return CAREER_STAGES.find((stage) => stage.id === stageId) ?? null
}
