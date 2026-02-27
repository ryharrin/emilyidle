import type { CareerStage } from '../types'

// ============================================
// Family Photos - Story 6.2
// ============================================
export type FamilyPhoto = {
  id: string
  title: string
  imageUrl: string
  unlockAtStage: CareerStage
  year: string
  description: string
}

export const FAMILY_PHOTOS: FamilyPhoto[] = [
  {
    id: 'photo-babies',
    title: 'First Days',
    imageUrl: '/photos/family/babies.jpg',
    unlockAtStage: 'PrivatePractice', // After moving to Michigan (2015+)
    year: '2018',
    description: 'Freddy, Sam, and Simi as babies. The beginning of everything.',
  },
  {
    id: 'photo-first-steps',
    title: 'First Steps',
    imageUrl: '/photos/family/first-steps.jpg',
    unlockAtStage: 'PrivatePractice', // After moving to Michigan
    year: '2020',
    description: 'The kids taking their first steps. Chaos and joy in equal measure.',
  },
  {
    id: 'photo-beach',
    title: 'Beach Day',
    imageUrl: '/photos/family/beach.jpg',
    unlockAtStage: 'PrivatePractice', // After moving to Michigan
    year: '2022',
    description: 'A summer day at the beach. Sand everywhere, but happy.',
  },
  {
    id: 'photo-family-portrait',
    title: 'Family Portrait',
    imageUrl: '/photos/family/portrait.jpg',
    unlockAtStage: 'GroupPractice',
    year: '2024',
    description: 'The family all dressed up. Simi refused to smile.',
  },
  {
    id: 'photo-graduation',
    title: 'Graduation',
    imageUrl: '/photos/family/graduation.jpg',
    unlockAtStage: 'GroupPractice',
    year: '2025',
    description: 'Celebrating your achievement together. So proud.',
  },
  {
    id: 'photo-retirement',
    title: 'New Chapter',
    imageUrl: '/photos/family/retirement.jpg',
    unlockAtStage: 'Retirement',
    year: '2026',
    description: 'The next chapter begins. All of you, together.',
  },
]

// ============================================
// Children's Drawings - Story 6.3
// ============================================
export type ChildDrawing = {
  id: string
  title: string
  imageUrl: string
  unlockAtStage: CareerStage
  artist: string
  age: number
  caption: string
  description: string
}

export const CHILDREN_DRAWINGS: ChildDrawing[] = [
  {
    id: 'drawing-freddy-watch',
    title: "Freddy's Watch",
    imageUrl: '/photos/drawings/freddy-watch.png',
    unlockAtStage: 'PrivatePractice', // After moving to Michigan (2015+)
    artist: 'Freddy',
    age: 6,
    caption: 'Freddy drew this for you',
    description: 'A crayon drawing of a watch. The hands are a bit wobbly but you can tell what it is.',
  },
  {
    id: 'drawing-sam-family',
    title: 'Sam\'s Family',
    imageUrl: '/photos/drawings/sam-family.png',
    unlockAtStage: 'PrivatePractice', // After moving to Michigan
    artist: 'Sam',
    age: 5,
    caption: 'Sam made this at preschool',
    description: 'Stick figures with enormous smiles. You\'re wearing a watch bigger than your head.',
  },
  {
    id: 'drawing-simi-scribble',
    title: 'Simi\'s Masterpiece',
    imageUrl: '/photos/drawings/simi-scribble.png',
    unlockAtStage: 'GroupPractice',
    artist: 'Simi',
    age: 3,
    caption: 'Simi calls it "watch"',
    description: 'An endearing chaos of colors. You\'re not sure what it is, but you love it.',
  },
  {
    id: 'drawing-freddy-doctor',
    title: 'Doctor Emily',
    imageUrl: '/photos/drawings/freddy-doctor.png',
    unlockAtStage: 'GroupPractice',
    artist: 'Freddy',
    age: 8,
    caption: 'Freddy\'s career aspirations',
    description: 'You as a doctor with a stethoscope and a fancy watch. "The best doctor in the whole world."',
  },
]

// ============================================
// Ryan Messages - Story 6.4
// ============================================
export type RyanMessage = {
  id: string
  title: string
  unlockAtStage: CareerStage
  subject: string
  body: string
}

export const RYAN_MESSAGES: RyanMessage[] = [
  {
    id: 'ryan-phd-start',
    title: 'Starting the Journey',
    unlockAtStage: 'PhDStudent',
    subject: 'Proud of you',
    body: `Em,

I knew you could do it. I've watched you work so hard for this.

The program is going to challenge you, but you have what it takes. Looking forward to seeing where this journey takes you.

Can't wait to see you in that cap and gown.

— R`,
  },
  {
    id: 'ryan-externship',
    title: 'The Externship',
    unlockAtStage: 'Externship',
    subject: "You're amazing",
    body: `Em,

Externship, huh? Look at you go.

I know the hours are long and the work is hard, but you're doing something meaningful. Keep pushing.

You're doing something hard, and you're doing it beautifully.

— R`,
  },
  {
    id: 'ryan-va-hospital',
    title: 'VA Hospital',
    unlockAtStage: 'VAHospital',
    subject: 'Our hero',
    body: `Em,

Working with veterans? I shouldn't be surprised. You always find the people who need you most.

I'm so proud of the work you're doing. The world needs more people like you.

Maybe you are a superhero.

— R`,
  },
  {
    id: 'ryan-private-practice',
    title: 'Private Practice',
    unlockAtStage: 'PrivatePractice',
    subject: 'Dream realized',
    body: `Em,

Private practice. You did it. All those years of school, all those late nights studying, all those times you doubted yourself—

You made it. I'm sitting here watching you sleep (you fell asleep on the couch again) and I can't believe you're mine.

So incredibly proud of you.

The kids keep asking when "Doctor Emily" will be home. I told them it'll be a while, but they're already proud of you.

— R`,
  },
  {
    id: 'ryan-group-practice',
    title: 'Group Practice',
    unlockAtStage: 'GroupPractice',
    subject: 'Building something',
    body: `Em,

Group practice! You're not just a doctor anymore—you're building something. Leading something.

The kids are getting so big. Freddy asked if he could be a doctor too. I told him he'd have to ask you.

Whatever happens next, I'm right here with you.

— R`,
  },
  {
    id: 'ryan-retirement',
    title: 'Retirement',
    unlockAtStage: 'Retirement',
    subject: 'Finally',
    body: `Em,

Finally. You've earned this.

All those years of helping others, and now it's your time. I'm looking forward to having you home more. The kids are too—even if they'll never admit it.

We should take that trip we've always talked about.

I love you, Doctor. Former Doctor. Whatever you are now—I'm so proud.

— R`,
  },
]

// ============================================
// Home Evolution - Story 6.5
// ============================================
export type HomeScene = {
  id: string
  careerStage: CareerStage
  title: string
  description: string
  backgroundImage: string
}

export const HOME_SCENES: HomeScene[] = [
  {
    id: 'home-pre-phd',
    careerStage: 'pre-phd',
    title: 'Your Studio',
    description: 'A cozy studio apartment. Small but full of potential.',
    backgroundImage: '/photos/home/studio.jpg',
  },
  {
    id: 'home-phd-student',
    careerStage: 'PhDStudent',
    title: 'First Apartment',
    description: 'A modest apartment. The start of something big.',
    backgroundImage: '/photos/home/first-apartment.jpg',
  },
  {
    id: 'home-externship',
    careerStage: 'Externship',
    title: 'Growing Space',
    description: 'More room now. Family photos on the walls.',
    backgroundImage: '/photos/home/growing.jpg',
  },
  {
    id: 'home-va-hospital',
    careerStage: 'VAHospital',
    title: 'Family Home',
    description: 'A real family home. Full of life and love.',
    backgroundImage: '/photos/home/family-home.jpg',
  },
  {
    id: 'home-private-practice',
    careerStage: 'PrivatePractice',
    title: 'The Practice',
    description: 'Your own space. The watch collection is growing.',
    backgroundImage: '/photos/home/practice.jpg',
  },
  {
    id: 'home-group-practice',
    careerStage: 'GroupPractice',
    title: 'Complete Home',
    description: 'A beautiful home. The kids\' art fills the walls.',
    backgroundImage: '/photos/home/complete.jpg',
  },
  {
    id: 'home-retirement',
    careerStage: 'Retirement',
    title: 'Full Circle',
    description: 'A lifetime of memories. A home full of love.',
    backgroundImage: '/photos/home/retirement.jpg',
  },
]

// ============================================
// Combined Home Life Item
// ============================================
export type HomeLifeItemType = 'photo' | 'drawing' | 'message'

export type HomeLifeItem =
  | { type: 'photo'; data: FamilyPhoto }
  | { type: 'drawing'; data: ChildDrawing }
  | { type: 'message'; data: RyanMessage }

// Combine all items into one list
export const ALL_HOME_LIFE_ITEMS: HomeLifeItem[] = [
  ...FAMILY_PHOTOS.map((photo) => ({ type: 'photo' as const, data: photo })),
  ...CHILDREN_DRAWINGS.map((drawing) => ({ type: 'drawing' as const, data: drawing })),
  ...RYAN_MESSAGES.map((message) => ({ type: 'message' as const, data: message })),
]

// Get all unlock IDs for a given career stage
export function getUnlockIdsForStage(stage: CareerStage): string[] {
  const photoIds = FAMILY_PHOTOS.filter((p) => p.unlockAtStage === stage).map((p) => p.id)
  const drawingIds = CHILDREN_DRAWINGS.filter((d) => d.unlockAtStage === stage).map((d) => d.id)
  const messageIds = RYAN_MESSAGES.filter((m) => m.unlockAtStage === stage).map((m) => m.id)
  return [...photoIds, ...drawingIds, ...messageIds]
}

// Get home scene for a career stage
export function getHomeSceneForStage(stage: CareerStage): HomeScene {
  return HOME_SCENES.find((s) => s.careerStage === stage) ?? HOME_SCENES[0]
}

// Get all home life items for display (sorted by unlock stage)
export function getAllHomeLifeItemsSorted(): HomeLifeItem[] {
  const stageOrder: CareerStage[] = [
    'pre-phd',
    'PhDStudent',
    'Externship',
    'VAHospital',
    'PrivatePractice',
    'GroupPractice',
    'Retirement',
  ]

  return [...ALL_HOME_LIFE_ITEMS].sort((a, b) => {
    const stageA = getUnlockStage(a)
    const stageB = getUnlockStage(b)
    return stageOrder.indexOf(stageA) - stageOrder.indexOf(stageB)
  })
}

function getUnlockStage(item: HomeLifeItem): CareerStage {
  switch (item.type) {
    case 'photo':
      return item.data.unlockAtStage
    case 'drawing':
      return item.data.unlockAtStage
    case 'message':
      return item.data.unlockAtStage
  }
}
