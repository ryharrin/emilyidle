/**
 * Career Stage Music Mapping
 * Maps career progression to music tracks
 */

import type { CareerStage } from '../game/types'
import type { MusicTrack } from './types'

/**
 * Map career stage to music track
 */
export function getMusicForCareerStage(stage: CareerStage): MusicTrack {
  switch (stage) {
    case 'pre-phd':
      return 'chapter1'
    case 'PhDStudent':
      return 'chapter1'
    case 'Externship':
      return 'chapter2'
    case 'VAHospital':
      return 'chapter3'
    case 'PrivatePractice':
      return 'chapter4'
    case 'GroupPractice':
      return 'chapter5'
    case 'Retirement':
      return 'chapter6'
    default:
      return 'menu'
  }
}

/**
 * Get display name for music track
 */
export function getMusicTrackDisplayName(track: MusicTrack): string {
  const names: Record<MusicTrack, string> = {
    menu: 'Main Menu',
    chapter1: 'Chapter 1: Beginnings',
    chapter2: 'Chapter 2: Growth',
    chapter3: 'Chapter 3: Service',
    chapter4: 'Chapter 4: Independence',
    chapter5: 'Chapter 5: Community',
    chapter6: 'Chapter 6: At Last',
    ending: 'Ending Theme',
  }
  return names[track]
}
