export type FamilyMoment = {
  id: string
  vignette: string
  loveGained: number
}

export const familyMoments: FamilyMoment[] = [
  {
    id: 'morning-coffee',
    vignette:
      "Your partner brings you coffee just the way you like it. The steam rises as you both stand in comfortable silence, watching the morning light fill the kitchen.",
    loveGained: 5,
  },
  {
    id: 'child-drawing',
    vignette:
      "Your child presents a crayon drawing of the family. Everyone has stick arms and enormous smiles, and you're wearing a watch bigger than your head.",
    loveGained: 8,
  },
  {
    id: 'shared-laugh',
    vignette:
      "A memory surfaces during dinner—a vacation mishap that seemed disastrous then, hilarious now. The laughter reconnects you across the table.",
    loveGained: 6,
  },
  {
    id: 'quiet-support',
    vignette:
      "No words needed. Just a hand on your shoulder as you review challenging case notes late into the evening.",
    loveGained: 7,
  },
  {
    id: 'weekend-ritual',
    vignette:
      "The Saturday morning pancake tradition continues. Flour dusts the counter. Someone burned the first batch. Perfect.",
    loveGained: 5,
  },
  {
    id: 'voice-message',
    vignette:
      "A voicemail from your parent, just checking in. Their voice carries warmth across the miles, unconditional and steady.",
    loveGained: 6,
  },
  {
    id: 'small-victory',
    vignette:
      "Your family celebrates a minor win—someone finished a book, fixed a leaky faucet, finally beat that video game level. Enthusiasm matters more than magnitude.",
    loveGained: 4,
  },
  {
    id: 'evening-walk',
    vignette:
      "An unplanned stroll after dinner. The rhythm of footsteps, the shared observation of a particularly dramatic sunset.",
    loveGained: 6,
  },
  {
    id: 'remembered-detail',
    vignette:
      "They remembered. The specific tea you prefer, the stressful meeting you mentioned in passing, the name of that difficult client.",
    loveGained: 7,
  },
  {
    id: 'wordless-care',
    vignette:
      "A favorite snack appears on your desk. The blankets are already pulled up on your side of the bed. Love in the language of action.",
    loveGained: 5,
  },
]

export function getRandomFamilyMoment(): FamilyMoment {
  const index = Math.floor(Math.random() * familyMoments.length)
  return familyMoments[index]
}

export function getFamilyMomentById(id: string): FamilyMoment | undefined {
  return familyMoments.find((m) => m.id === id)
}
