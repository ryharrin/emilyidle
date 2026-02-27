/**
 * Audio Unlock Component
 * Handles iOS Safari audio unlock requirement
 * Shows a subtle hint on first visit requiring user gesture
 */

import { useState, useEffect, useCallback } from 'react'
import { unlockAudio, getAudioState } from './audioService'
import './audioUnlock.css'

/**
 * Props for AudioUnlock component
 */
interface AudioUnlockProps {
  /** Called when audio is unlocked */
  onUnlock?: () => void
  /** Whether to show the unlock prompt immediately */
  autoShow?: boolean
}

/**
 * Audio Unlock Component
 * Displays a subtle prompt to unlock audio on iOS
 */
export function AudioUnlock({ onUnlock, autoShow = true }: AudioUnlockProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const [isVisible, setIsVisible] = useState(() => {
    if (!isIOS || !autoShow) {
      return false
    }

    return !getAudioState().iOSUnlocked
  })

  useEffect(() => {
    if (!isIOS || !autoShow || isVisible) {
      return
    }

    const state = getAudioState()
    if (state.iOSUnlocked) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(true)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [autoShow, isIOS, isVisible])

  const handleUnlock = useCallback(() => {
    unlockAudio()
    setIsVisible(false)
    onUnlock?.()
  }, [onUnlock])

  // Don't render if not iOS or already unlocked
  if (!isIOS || !isVisible) {
    return null
  }

  return (
    <button
      type="button"
      className="audio-unlock-overlay"
      onClick={handleUnlock}
      aria-label="Tap to enable audio"
    >
      <div className="audio-unlock-content">
        <div className="audio-unlock-icon">🔊</div>
        <p className="audio-unlock-text">Tap to enable audio</p>
        <p className="audio-unlock-subtext">Music enhances the experience</p>
      </div>
    </button>
  )
}
