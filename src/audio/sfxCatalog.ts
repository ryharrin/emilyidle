/**
 * Sound Effects Catalog
 * Defines all SFX IDs and their configuration
 * Used by Story 7.2: Sound Effects
 */

// SFX Catalog - defines all sound effects in the game

/** Sound effect categories */
export type SfxCategory = 'minigame' | 'unlock' | 'ui' | 'ambient'

/** Sound effect ID type - all valid SFX IDs */
export type SfxId =
  // Mini-game SFX
  | 'quartz.click'
  | 'quartz.miss'
  | 'quartz.complete'
  | 'winding.tick'
  | 'winding.complete'
  | 'winding.resistance'
  | 'auto.click'
  | 'auto.miss'
  | 'auto.complete'
  | 'therapy.progress'
  | 'therapy.vignette'
  | 'therapy.complete'
  // Unlock SFX
  | 'unlock.watch'
  | 'unlock.prestige'
  | 'unlock.photo'
  | 'unlock.drawing'
  | 'unlock.message'
  | 'unlock.achievement'
  | 'unlock.secret'
  // UI SFX
  | 'ui.tab'
  | 'ui.back'
  | 'ui.tap'
  | 'ui.toggle'
  | 'ui.swipe'
  | 'ui.toast'
  | 'ui.error'

/** SFX definition */
export interface SfxDefinition {
  id: SfxId
  category: SfxCategory
  file: string
  volume: number
  throttleMs?: number
}

/** Sound effects catalog */
export const SFX_CATALOG: Record<SfxId, SfxDefinition> = {
  // Mini-game SFX
  'quartz.click': {
    id: 'quartz.click',
    category: 'minigame',
    file: '/assets/audio/sfx/quartz-click.mp3',
    volume: 0.7,
    throttleMs: 50,
  },
  'quartz.miss': {
    id: 'quartz.miss',
    category: 'minigame',
    file: '/assets/audio/sfx/quartz-miss.mp3',
    volume: 0.5,
    throttleMs: 100,
  },
  'quartz.complete': {
    id: 'quartz.complete',
    category: 'minigame',
    file: '/assets/audio/sfx/quartz-complete.mp3',
    volume: 0.8,
  },
  'winding.tick': {
    id: 'winding.tick',
    category: 'minigame',
    file: '/assets/audio/sfx/winding-tick.mp3',
    volume: 0.6,
    throttleMs: 100,
  },
  'winding.complete': {
    id: 'winding.complete',
    category: 'minigame',
    file: '/assets/audio/sfx/winding-complete.mp3',
    volume: 0.8,
  },
  'winding.resistance': {
    id: 'winding.resistance',
    category: 'minigame',
    file: '/assets/audio/sfx/winding-resistance.mp3',
    volume: 0.5,
    throttleMs: 200,
  },
  'auto.click': {
    id: 'auto.click',
    category: 'minigame',
    file: '/assets/audio/sfx/auto-click.mp3',
    volume: 0.7,
    throttleMs: 50,
  },
  'auto.miss': {
    id: 'auto.miss',
    category: 'minigame',
    file: '/assets/audio/sfx/auto-miss.mp3',
    volume: 0.5,
    throttleMs: 100,
  },
  'auto.complete': {
    id: 'auto.complete',
    category: 'minigame',
    file: '/assets/audio/sfx/auto-complete.mp3',
    volume: 0.8,
  },
  'therapy.progress': {
    id: 'therapy.progress',
    category: 'minigame',
    file: '/assets/audio/sfx/therapy-progress.mp3',
    volume: 0.6,
    throttleMs: 100,
  },
  'therapy.vignette': {
    id: 'therapy.vignette',
    category: 'minigame',
    file: '/assets/audio/sfx/therapy-vignette.mp3',
    volume: 0.7,
  },
  'therapy.complete': {
    id: 'therapy.complete',
    category: 'minigame',
    file: '/assets/audio/sfx/therapy-complete.mp3',
    volume: 0.8,
  },

  // Unlock SFX
  'unlock.watch': {
    id: 'unlock.watch',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-watch.mp3',
    volume: 0.8,
  },
  'unlock.prestige': {
    id: 'unlock.prestige',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-prestige.mp3',
    volume: 0.9,
  },
  'unlock.photo': {
    id: 'unlock.photo',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-photo.mp3',
    volume: 0.7,
  },
  'unlock.drawing': {
    id: 'unlock.drawing',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-drawing.mp3',
    volume: 0.7,
  },
  'unlock.message': {
    id: 'unlock.message',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-message.mp3',
    volume: 0.7,
  },
  'unlock.achievement': {
    id: 'unlock.achievement',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-achievement.mp3',
    volume: 0.8,
  },
  'unlock.secret': {
    id: 'unlock.secret',
    category: 'unlock',
    file: '/assets/audio/sfx/unlock-secret.mp3',
    volume: 0.9,
  },

  // UI SFX
  'ui.tab': {
    id: 'ui.tab',
    category: 'ui',
    file: '/assets/audio/sfx/ui-tab.mp3',
    volume: 0.4,
    throttleMs: 100,
  },
  'ui.back': {
    id: 'ui.back',
    category: 'ui',
    file: '/assets/audio/sfx/ui-back.mp3',
    volume: 0.4,
    throttleMs: 100,
  },
  'ui.tap': {
    id: 'ui.tap',
    category: 'ui',
    file: '/assets/audio/sfx/ui-tap.mp3',
    volume: 0.3,
    throttleMs: 50,
  },
  'ui.toggle': {
    id: 'ui.toggle',
    category: 'ui',
    file: '/assets/audio/sfx/ui-toggle.mp3',
    volume: 0.4,
    throttleMs: 100,
  },
  'ui.swipe': {
    id: 'ui.swipe',
    category: 'ui',
    file: '/assets/audio/sfx/ui-swipe.mp3',
    volume: 0.3,
    throttleMs: 100,
  },
  'ui.toast': {
    id: 'ui.toast',
    category: 'ui',
    file: '/assets/audio/sfx/ui-toast.mp3',
    volume: 0.5,
  },
  'ui.error': {
    id: 'ui.error',
    category: 'ui',
    file: '/assets/audio/sfx/ui-error.mp3',
    volume: 0.6,
    throttleMs: 200,
  },
}

/** Get SFX definition by ID */
export function getSfx(id: SfxId): SfxDefinition | undefined {
  return SFX_CATALOG[id]
}

/** Get all SFX IDs for a category */
export function getSfxByCategory(category: SfxCategory): SfxId[] {
  return Object.values(SFX_CATALOG)
    .filter((sfx) => sfx.category === category)
    .map((sfx) => sfx.id)
}

/** Check if SFX exists */
export function hasSfx(id: string): id is SfxId {
  return id in SFX_CATALOG
}
