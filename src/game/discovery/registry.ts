import type { UnlockRegistry } from './types'
import { CAREER_STAGES } from '../data/careers'

const CAREER_UNLOCK_REGISTRY: UnlockRegistry = CAREER_STAGES.flatMap((stage) =>
  stage.unlocks.map((unlockId) => ({
    id: `career-${stage.id}-${unlockId}`,
    category: 'career' as const,
    condition: (state) => state.careerStage === stage.id,
  })),
)

const EXTERNSHIP_MILESTONE_UNLOCKS: UnlockRegistry = [
  {
    id: 'career-Externship-celebration',
    category: 'career',
    condition: (state) => state.careerStage === 'Externship',
  },
  {
    id: 'home-photo-externship',
    category: 'home-life',
    condition: (state) => state.careerStage === 'Externship',
  },
  {
    id: 'ryan-message-externship',
    category: 'home-life',
    condition: (state) => state.careerStage === 'Externship',
  },
]

// Story 4.3: VA Hospital milestone unlocks
const VA_HOSPITAL_MILESTONE_UNLOCKS: UnlockRegistry = [
  {
    id: 'career-VAHospital-celebration',
    category: 'career',
    condition: (state) => state.careerStage === 'VAHospital',
  },
  {
    id: 'career-VAHospital-jlc-award',
    category: 'career',
    condition: (state) => state.careerStage === 'VAHospital',
    // Award the JLC watch automatically upon reaching VA Hospital
    onUnlock: (state) => {
      // Only add if not already owned
      if (state.ownedWatchIds.includes('jlc-master-ultra-thin-moon')) {
        return state
      }
      return {
        ...state,
        ownedWatchIds: [...state.ownedWatchIds, 'jlc-master-ultra-thin-moon'],
      }
    },
  },
  {
    id: 'home-photo-va-hospital',
    category: 'home-life',
    condition: (state) => state.careerStage === 'VAHospital',
  },
  {
    id: 'ryan-message-va-hospital',
    category: 'home-life',
    condition: (state) => state.careerStage === 'VAHospital',
  },
]

export const UNLOCK_REGISTRY: UnlockRegistry = [
  ...CAREER_UNLOCK_REGISTRY,
  ...EXTERNSHIP_MILESTONE_UNLOCKS,
  ...VA_HOSPITAL_MILESTONE_UNLOCKS,
]
