/**
 * UI Sounds Hook
 * Provides consistent sound effects for UI interactions
 */

import { useCallback } from 'react'
import { playSfx } from '../../audio/audioService'
import type { SfxId } from '../../audio/sfxCatalog'

/**
 * Hook for UI sound effects
 * Returns functions to play common UI sounds
 */
export function useUiSounds() {
  const playTabSound = useCallback(() => {
    playSfx('ui.tab')
  }, [])

  const playBackSound = useCallback(() => {
    playSfx('ui.back')
  }, [])

  const playTapSound = useCallback(() => {
    playSfx('ui.tap')
  }, [])

  const playToggleSound = useCallback(() => {
    playSfx('ui.toggle')
  }, [])

  const playSwipeSound = useCallback(() => {
    playSfx('ui.swipe')
  }, [])

  const playToastSound = useCallback(() => {
    playSfx('ui.toast')
  }, [])

  const playErrorSound = useCallback(() => {
    playSfx('ui.error')
  }, [])

  const playCustomSound = useCallback((id: SfxId) => {
    playSfx(id)
  }, [])

  return {
    playTabSound,
    playBackSound,
    playTapSound,
    playToggleSound,
    playSwipeSound,
    playToastSound,
    playErrorSound,
    playCustomSound,
  }
}
