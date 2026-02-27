/**
 * Achievement Registry
 * Defines all achievements in the game
 */

import type { Achievement, AchievementCategory } from './types'
import type { GameState } from '../types'

/**
 * All achievements in the game
 * Organized by category
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Collection Achievements
  {
    id: 'first-watch',
    name: 'First Timepiece',
    description: 'Acquire your first watch',
    category: 'collection',
    icon: 'Watch',
    condition: { type: 'watchCount', count: 1 },
  },
  {
    id: 'watch-enthusiast',
    name: 'Watch Enthusiast',
    description: 'Own 10 watches',
    category: 'collection',
    icon: 'Clock',
    condition: { type: 'watchCount', count: 10 },
  },
  {
    id: 'collector',
    name: 'The Collector',
    description: 'Own 25 watches',
    category: 'collection',
    icon: 'Library',
    condition: { type: 'watchCount', count: 25 },
  },
  {
    id: 'collection-complete',
    name: 'Complete Collection',
    description: 'Own all watches in the catalog',
    category: 'collection',
    icon: 'Trophy',
    condition: { type: 'watchCount', count: 50 },
  },
  {
    id: 'workshop-artisan',
    name: 'Workshop Artisan',
    description: 'Unlock the Workshop prestige tier',
    category: 'collection',
    icon: 'Hammer',
    condition: { type: 'custom', check: (s) => s.prestige?.workshop?.unlocked === true },
  },
  {
    id: 'maison-heritage',
    name: 'Maison Heritage',
    description: 'Unlock the Maison prestige tier',
    category: 'collection',
    icon: 'Crown',
    condition: { type: 'custom', check: (s) => s.prestige?.maison?.unlocked === true },
  },
  {
    id: 'nostalgia-collector',
    name: 'Nostalgia Collector',
    description: 'Unlock the Nostalgia prestige tier',
    category: 'collection',
    icon: 'History',
    condition: { type: 'custom', check: (s) => s.prestige?.nostalgia?.unlocked === true },
  },
  {
    id: 'tier-master',
    name: 'Tier Master',
    description: 'Unlock all watch tiers',
    category: 'collection',
    icon: 'Layers',
    condition: { type: 'custom', check: (s) => {
      const ownedTiers = new Set(s.ownedWatchIds?.map(id => {
        // Get tier from watch data (simplified check)
        if (id.includes('tourbillon')) return 'tourbillon'
        if (id.includes('manual')) return 'manual'
        if (id.includes('automatic')) return 'automatic'
        return 'quartz'
      }) ?? [])
      return ownedTiers.size === 4
    }},
  },

  // Career Achievements
  {
    id: 'phd-candidate',
    name: 'PhD Candidate',
    description: 'Begin your PhD journey',
    category: 'career',
    icon: 'GraduationCap',
    condition: { type: 'careerStage', stage: 'PhDStudent' },
  },
  {
    id: 'externship-complete',
    name: 'Externship Graduate',
    description: 'Complete your externship',
    category: 'career',
    icon: 'Stethoscope',
    condition: { type: 'careerStage', stage: 'Externship' },
  },
  {
    id: 'va-service',
    name: 'VA Service',
    description: 'Complete the VA Hospital stage',
    category: 'career',
    icon: 'Heart',
    condition: { type: 'careerStage', stage: 'VAHospital' },
  },
  {
    id: 'private-practice',
    name: 'Private Practice',
    description: 'Open your private practice',
    category: 'career',
    icon: 'Briefcase',
    condition: { type: 'careerStage', stage: 'PrivatePractice' },
  },
  {
    id: 'group-practice',
    name: 'Group Practice',
    description: 'Join a group practice',
    category: 'career',
    icon: 'Users',
    condition: { type: 'careerStage', stage: 'GroupPractice' },
  },
  {
    id: 'retirement',
    name: 'Retirement',
    description: 'Retire from your career',
    category: 'career',
    icon: 'Sunset',
    condition: { type: 'careerStage', stage: 'Retirement' },
  },
  {
    id: 'jlc-milestone',
    name: 'JLC Milestone',
    description: 'Receive the JLC prize',
    category: 'career',
    icon: 'Award',
    condition: { type: 'custom', check: (s) => s.ownedWatchIds?.includes('jlc-master-ultra-thin-moon') === true },
  },
  {
    id: 'career-dedication',
    name: 'Dedication',
    description: 'Reach 100,000 career XP',
    category: 'career',
    icon: 'Target',
    condition: { type: 'custom', check: (s) => (s.careerXp ?? 0) >= 100000 },
  },

  // Mini-game Achievements
  {
    id: 'perfect-calibration',
    name: 'Perfect Calibration',
    description: 'Achieve 10 perfects in Quartz Calibration',
    category: 'minigame',
    icon: 'CheckCircle',
    condition: { type: 'miniGameScore', game: 'quartz-calibration', perfects: 10 },
  },
  {
    id: 'speed-winder',
    name: 'Speed Winder',
    description: 'Complete Manual Winding in under 30 seconds',
    category: 'minigame',
    icon: 'Zap',
    condition: { type: 'custom', check: (s) => {
      return s.interactionHistory?.some(r => 
        r.gameType === 'manual-winding' && (r.durationMs ?? Infinity) < 30000
      ) === true
    }},
  },
  {
    id: 'rhythm-master',
    name: 'Rhythm Master',
    description: 'Achieve 20 consecutive hits in Automatic Movement',
    category: 'minigame',
    icon: 'Activity',
    condition: { type: 'miniGameScore', game: 'automatic-movement', perfects: 20 },
  },
  {
    id: 'therapy-progress',
    name: 'Therapy Progress',
    description: 'Complete 10 therapy sessions',
    category: 'minigame',
    icon: 'MessageCircle',
    condition: { type: 'custom', check: (s) => {
      return (s.interactionHistory?.filter(r => 
        r.gameType === 'therapy-session'
      ).length ?? 0) >= 10
    }},
  },
  {
    id: 'mini-game-novice',
    name: 'Mini-game Novice',
    description: 'Play each mini-game type at least once',
    category: 'minigame',
    icon: 'Gamepad',
    condition: { type: 'custom', check: (s) => {
      const games = new Set(s.interactionHistory?.map(r => r.gameType) ?? [])
      return games.size >= 4
    }},
  },
  {
    id: 'mini-game-master',
    name: 'Mini-game Master',
    description: 'Achieve perfect scores in all mini-games',
    category: 'minigame',
    icon: 'Star',
    condition: { type: 'custom', check: (s) => {
      // Check for perfect sessions (all perfects, no misses)
      return s.interactionHistory?.some(r => 
        (r.perfects ?? 0) > 0 && (r.misses ?? 0) === 0
      ) === true
    }},
  },

  // Home Life Achievements
  {
    id: 'family-check-in',
    name: 'Family Check-in',
    description: 'Connect with family for the first time',
    category: 'home',
    icon: 'Home',
    condition: { type: 'custom', check: (s) => (s.lastFamilyCheckIn ?? 0) > 0 },
  },
  {
    id: 'gallery-beginner',
    name: 'Gallery Beginner',
    description: 'Unlock 5 home items',
    category: 'home',
    icon: 'Image',
    condition: { type: 'homeItems', count: 5 },
  },
  {
    id: 'gallery-intermediate',
    name: 'Gallery Intermediate',
    description: 'Unlock 15 home items',
    category: 'home',
    icon: 'Images',
    condition: { type: 'homeItems', count: 15 },
  },
  {
    id: 'gallery-complete',
    name: 'Gallery Complete',
    description: 'Unlock all home items',
    category: 'home',
    icon: 'PictureInPicture',
    condition: { type: 'homeItems', count: 30 },
  },
  {
    id: 'reconnected',
    name: 'Reconnected',
    description: 'Restore family bonds through the journey',
    category: 'home',
    icon: 'HeartHandshake',
    condition: { type: 'custom', check: (s) => (s.unlockedHomeItems?.length ?? 0) >= 20 },
  },

  // Secret Achievements
  {
    id: 'secret-midnight',
    name: 'Night Owl',
    description: '???',
    category: 'secret',
    icon: 'Moon',
    secret: true,
    condition: { type: 'custom', check: () => {
      const hour = new Date().getHours()
      return hour >= 0 && hour < 5
    }},
  },
  {
    id: 'secret-weekend',
    name: 'Weekend Warrior',
    description: '???',
    category: 'secret',
    icon: 'Calendar',
    secret: true,
    condition: { type: 'custom', check: () => {
      const day = new Date().getDay()
      return day === 0 || day === 6
    }},
  },
  {
    id: 'secret-patient',
    name: 'Patience',
    description: '???',
    category: 'secret',
    icon: 'Clock',
    secret: true,
    condition: { type: 'custom', check: (s) => (s.clockMs ?? 0) > 3600000 }, // 1 hour playtime
  },
  {
    id: 'secret-completionist',
    name: 'True Completionist',
    description: '???',
    category: 'secret',
    icon: 'Medal',
    secret: true,
    condition: { type: 'custom', check: (s) => {
      void s
      // Check if player has completed most achievements
      // This will be evaluated dynamically
      return false
    }},
  },
  {
    id: 'secret-first-click',
    name: 'First Click',
    description: '???',
    category: 'secret',
    icon: 'MousePointer',
    secret: true,
    condition: { type: 'custom', check: (s) => (s.interactionHistory?.length ?? 0) > 0 },
  },
  {
    id: 'at-last',
    name: 'At Last',
    description: 'Complete the journey. At last, a home complete. At last, the gift is ready. At last, love expressed.',
    category: 'secret',
    icon: 'Heart',
    secret: true,
    condition: { type: 'custom', check: (s) => s.careerStage === 'Retirement' },
  },
]

/** Get achievement by ID */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

/** Get achievements by category */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

/** Get all non-secret achievements */
export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => !a.secret)
}

/** Get secret achievements */
export function getSecretAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.secret)
}

/** Check if achievement is unlocked */
export function isAchievementUnlocked(state: GameState, achievementId: string): boolean {
  return state.unlockedAchievementIds?.includes(achievementId) ?? false
}
