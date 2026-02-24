import type { CareerStage } from '../types'

export interface TherapyVignette {
  id: string
  stage: CareerStage
  patientText: string[]
  exchangeCount: number
  reward: {
    cashCents: number
    xp: number
  }
}

export const THERAPY_VIGNETTES: TherapyVignette[] = [
  // PhD Student stage - simpler, foundational scenarios
  {
    id: 'phd-first-anxiety',
    stage: 'PhDStudent',
    patientText: [
      "I've been having trouble sleeping lately...",
      "I keep thinking about all the things I need to do.",
      "It's like my mind won't turn off, you know?",
      "But I want to keep moving forward, one session at a time.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 75_00, xp: 10 },
  },
  {
    id: 'phd-family-pressure',
    stage: 'PhDStudent',
    patientText: [
      "My parents don't really understand what I'm studying.",
      "They keep asking when I'll get a 'real job'.",
      "It makes me doubt if I'm on the right path.",
      "I guess I'm learning to trust my own direction.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 75_00, xp: 10 },
  },
  {
    id: 'phd-imposter',
    stage: 'PhDStudent',
    patientText: [
      "Sometimes I feel like I don't belong here.",
      "Everyone else seems to know what they're doing.",
      "What if they find out I'm just figuring it out as I go?",
      "But maybe that's how everyone feels, deep down.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 75_00, xp: 10 },
  },

  // Externship stage - clinical training scenarios
  {
    id: 'extern-first-client',
    stage: 'Externship',
    patientText: [
      "I finally got to sit in on my first real session.",
      "The client was so nervous, and I didn't know what to say.",
      "But my supervisor said silence is okay sometimes.",
      "I'm learning that being present is enough.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 120_00, xp: 15 },
  },
  {
    id: 'extern-supervision',
    stage: 'Externship',
    patientText: [
      "My supervisor pointed out I was giving too much advice.",
      "I thought I was supposed to help solve their problems.",
      "But she says the client has their own wisdom.",
      "I'm learning to hold space instead of fixing.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 120_00, xp: 15 },
  },
  {
    id: 'extern-burnout',
    stage: 'Externship',
    patientText: [
      "Between classes and practicum, I'm exhausted.",
      "I feel guilty taking time for myself.",
      "But I'm noticing I can't give what I don't have.",
      "Self-care isn't selfish—it's sustainable.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 120_00, xp: 15 },
  },

  // VA Hospital stage - complex, systemic issues
  {
    id: 'va-trauma-history',
    stage: 'VAHospital',
    patientText: [
      "I've seen things I can't unsee.",
      "Some nights I wake up and I'm back there.",
      "The civilian world doesn't feel real anymore.",
      "But I'm here, and I'm trying to build something new.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 185_00, xp: 20 },
  },
  {
    id: 'va-transition',
    stage: 'VAHospital',
    patientText: [
      "Twenty years of service, and now I'm a civilian.",
      "The structure, the purpose, the brotherhood—all gone.",
      "I don't know who I am without the uniform.",
      "Maybe I can carry the values forward, even without the title.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 185_00, xp: 20 },
  },
  {
    id: 'va-isolation',
    stage: 'VAHospital',
    patientText: [
      "I've pushed everyone away.",
      "Better they don't get close to something broken.",
      "But the silence is getting louder every day.",
      "Maybe connection is worth the risk after all.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 185_00, xp: 20 },
  },

  // Private Practice stage - nuanced individual therapy
  {
    id: 'private-relationships',
    stage: 'PrivatePractice',
    patientText: [
      "I keep ending up with the same kind of partner.",
      "Different face, same pattern.",
      "I think I'm drawn to what's familiar, even if it hurts.",
      "Recognizing the pattern is the first step to changing it.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 275_00, xp: 25 },
  },
  {
    id: 'private-grief',
    stage: 'PrivatePractice',
    patientText: [
      "It's been three years, and I still reach for the phone.",
      "People say I should be over it by now.",
      "But grief doesn't follow a timeline.",
      "I'm learning to carry the love without the weight of expectation.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 275_00, xp: 25 },
  },
  {
    id: 'private-work-life',
    stage: 'PrivatePractice',
    patientText: [
      "I've built this successful career, but I'm empty inside.",
      "Every achievement feels like checking a box.",
      "When did I start living for the validation?",
      "I'm ready to figure out what I actually want.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 275_00, xp: 25 },
  },

  // Group Practice stage - interpersonal dynamics
  {
    id: 'group-dynamics',
    stage: 'GroupPractice',
    patientText: [
      "Being in a group brings up everything from my family.",
      "I see myself in the others' struggles.",
      "It's uncomfortable, but also strangely comforting.",
      "We're all just humans trying to figure it out together.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 385_00, xp: 30 },
  },
  {
    id: 'group-identity',
    stage: 'GroupPractice',
    patientText: [
      "I've defined myself by my career for so long.",
      "Without the title, who am I really?",
      "The group sees parts of me I hide from myself.",
      "Integration feels possible here.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 385_00, xp: 30 },
  },
  {
    id: 'group-intimacy',
    stage: 'GroupPractice',
    patientText: [
      "Vulnerability has always felt dangerous.",
      "But in this room, something different happens.",
      "I say things I didn't know I was holding.",
      "Real connection requires showing up fully.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 385_00, xp: 30 },
  },

  // Retirement stage - reflection and legacy
  {
    id: 'retirement-reflection',
    stage: 'Retirement',
    patientText: [
      "I've spent my whole life becoming someone.",
      "Now I'm stepping back from all of that.",
      "Who am I when I'm not producing?",
      "Maybe I've been worthy all along, not just when I achieve.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 500_00, xp: 35 },
  },
  {
    id: 'retirement-legacy',
    stage: 'Retirement',
    patientText: [
      "I wonder if any of it mattered.",
      "Did I leave the world better than I found it?",
      "The small kindnesses—do they ripple outward?",
      "Perhaps meaning is found in the moments, not the monuments.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 500_00, xp: 35 },
  },
  {
    id: 'retirement-peace',
    stage: 'Retirement',
    patientText: [
      "For the first time in decades, I'm not rushing.",
      "The present moment feels spacious, not empty.",
      "I've carried so much; now I can set some of it down.",
      "Peace isn't the absence of struggle—it's acceptance within it.",
    ],
    exchangeCount: 4,
    reward: { cashCents: 500_00, xp: 35 },
  },
]

export function getVignettesForStage(stage: CareerStage): TherapyVignette[] {
  return THERAPY_VIGNETTES.filter((v) => v.stage === stage)
}

export function getRandomVignetteForStage(stage: CareerStage): TherapyVignette | null {
  const vignettes = getVignettesForStage(stage)
  if (vignettes.length === 0) return null
  return vignettes[Math.floor(Math.random() * vignettes.length)]
}

// Generic therapist responses - shown as 3 options, purely flavor (no gameplay impact)
export const THERAPIST_RESPONSES: string[] = [
  "That's interesting. Tell me more about that.",
  "How does that make you feel?",
  "I hear you. That sounds challenging.",
  "What do you think is behind those feelings?",
  "Take a moment with that.",
  "What's coming up for you right now?",
  "I'm curious about that.",
  "Let's sit with that for a moment.",
  "What patterns do you notice?",
  "How has that shown up in your life?",
  "What would your younger self say?",
  "What do you need right now?",
  "I'm here with you in this.",
  "What matters most to you about this?",
  "How does that connect to your values?",
  "What are you learning about yourself?",
  "What would self-compassion look like here?",
  "How have you coped with this before?",
  "What's the hardest part of this?",
  "What do you hope for going forward?",
]

/**
 * Get 3 random therapist responses for display.
 * Uses simple randomization - could be enhanced with seeded random for determinism.
 */
export function getRandomTherapistResponses(): string[] {
  const shuffled = [...THERAPIST_RESPONSES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}
