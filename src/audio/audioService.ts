/**
 * Audio Service
 * Thin interface for game audio using howler.js
 * Provides: playSfx(id), setMusic(track), setEnabled(boolean)
 */

import { Howl, Howler } from 'howler'
import type { MusicTrack, SfxId, AudioState } from './types'
import {
  MUSIC_ASSETS,
  defaultAudioState,
  AUDIO_STORAGE_KEY,
  IOS_UNLOCK_STORAGE_KEY,
} from './types'
import { getSfx, hasSfx } from './sfxCatalog'

// Singleton instance
let audioService: AudioService | null = null

/**
 * Audio Service class
 * Manages all audio playback and state
 */
class AudioService {
  private state: AudioState
  private currentMusic: Howl | null = null
  private musicFadeDuration = 1500 // ms for crossfade
  private sfxInstances: Map<string, Howl> = new Map()
  private musicInstances: Map<MusicTrack, Howl> = new Map()
  private lastSfxPlayTime: Map<string, number> = new Map()

  constructor() {
    this.state = this.loadState()
    this.preloadMusic()
  }

  /**
   * Load audio state from localStorage
   */
  private loadState(): AudioState {
    if (typeof window === 'undefined') {
      return { ...defaultAudioState }
    }

    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY)
      const iOSUnlocked = localStorage.getItem(IOS_UNLOCK_STORAGE_KEY) === 'true'

      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...defaultAudioState,
          ...parsed,
          iOSUnlocked,
        }
      }
    } catch {
      // Ignore storage errors
    }

    return { ...defaultAudioState }
  }

  /**
   * Save audio state to localStorage
   */
  private saveState(): void {
    if (typeof window === 'undefined') return

    try {
      const { iOSUnlocked, ...stateToSave } = this.state
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(stateToSave))
      localStorage.setItem(IOS_UNLOCK_STORAGE_KEY, String(iOSUnlocked))
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Preload music tracks for smooth transitions
   */
  private preloadMusic(): void {
    if (!this.state.enabled) return

    for (const [track, config] of Object.entries(MUSIC_ASSETS)) {
      if (!config.preload) continue

      const howl = new Howl({
        src: config.src,
        volume: 0,
        loop: config.loop ?? false,
        preload: true,
        html5: true, // Use HTML5 Audio for better mobile support
      })

      // Handle load errors for preloaded music
      howl.on('loaderror', (_id, error) => {
        console.warn(`[Audio] Failed to preload music track "${track}":`, error)
      })

      this.musicInstances.set(track as MusicTrack, howl)
    }
  }

  /**
   * Check if running on iOS
   */
  private isIOS(): boolean {
    if (typeof window === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  /**
   * Check if audio is unlocked (iOS requires user gesture)
   */
  isUnlocked(): boolean {
    if (!this.isIOS()) return true
    return this.state.iOSUnlocked
  }

  /**
   * Unlock audio on iOS (must be called from user gesture handler)
   */
  unlock(): void {
    if (this.state.iOSUnlocked) return

    this.state.iOSUnlocked = true
    this.saveState()

    // Resume AudioContext if suspended
    if (Howler.ctx?.state === 'suspended') {
      Howler.ctx.resume()
    }
  }

  /**
   * Play a sound effect
   * Thin interface: playSfx(id)
   */
  playSfx(id: SfxId, volume?: number): void {
    if (!this.state.enabled) return
    if (this.isIOS() && !this.state.iOSUnlocked) return

    // Validate SFX ID
    if (!hasSfx(id)) {
      console.warn(`[Audio] Unknown SFX: ${id}`)
      return
    }

    console.log(`[Audio] SFX: ${id}`)

    const sfx = getSfx(id)
    if (!sfx) return

    // Check throttle
    if (sfx.throttleMs) {
      const lastPlay = this.lastSfxPlayTime.get(id) ?? 0
      const now = Date.now()
      if (now - lastPlay < sfx.throttleMs) {
        return // Skip if within throttle window
      }
      this.lastSfxPlayTime.set(id, now)
    }

    // Get or create Howl instance
    let howl = this.sfxInstances.get(id)
    if (!howl) {
      howl = new Howl({
        src: [sfx.file],
        volume: 0,
        html5: true,
      })

      // Handle load errors for SFX
      howl.on('loaderror', (_id, error) => {
        console.warn(`[Audio] Failed to load SFX "${id}":`, error)
      })

      this.sfxInstances.set(id, howl)
    }

    // Calculate effective volume
    const effectiveVolume = (volume ?? sfx.volume) * this.state.sfxVolume

    // Play with fade in
    howl.volume(0)
    howl.play()
    howl.fade(0, effectiveVolume, 50)

    // Auto cleanup after play
    howl.once('end', () => {
      // Keep instance for reuse but reset volume
      howl?.volume(0)
    })
  }

  /**
   * Set current music track
   * Thin interface: setMusic(track)
   */
  setMusic(track: MusicTrack | null): void {
    if (!this.state.enabled) return
    if (this.isIOS() && !this.state.iOSUnlocked) return

    // Don't restart same track
    if (this.state.currentTrack === track && this.state.isPlaying) {
      return
    }

    // Fade out current music
    if (this.currentMusic) {
      this.currentMusic.fade(
        this.state.musicVolume,
        0,
        this.musicFadeDuration
      )
      this.currentMusic.once('fade', () => {
        this.currentMusic?.stop()
        this.playNewTrack(track)
      })
    } else {
      this.playNewTrack(track)
    }

    this.state.currentTrack = track
    this.state.isPlaying = track !== null
    this.saveState()
  }

  /**
   * Play a new music track
   */
  private playNewTrack(track: MusicTrack | null): void {
    if (!track) return

    const config = MUSIC_ASSETS[track]
    if (!config) return

    // Get or create Howl instance
    let howl = this.musicInstances.get(track)
    if (!howl) {
      howl = new Howl({
        src: config.src,
        volume: 0,
        loop: config.loop ?? false,
        html5: true,
      })

      // Handle load errors for music tracks
      howl.on('loaderror', (_id, error) => {
        console.warn(`[Audio] Failed to load music track "${track}":`, error)
      })

      this.musicInstances.set(track, howl)
    }

    this.currentMusic = howl

    // Fade in
    howl.volume(0)
    howl.play()
    howl.fade(0, this.state.musicVolume, this.musicFadeDuration)
  }

  /**
   * Enable or disable all audio
   * Thin interface: setEnabled(boolean)
   */
  setEnabled(enabled: boolean): void {
    if (this.state.enabled === enabled) return

    this.state.enabled = enabled

    if (!enabled) {
      // Stop all audio
      this.currentMusic?.fade(this.state.musicVolume, 0, 500)
      this.currentMusic?.once('fade', () => {
        this.currentMusic?.stop()
        this.currentMusic = null
      })
      Howler.mute(true)
    } else {
      Howler.mute(false)
      // Resume music if track is set
      if (this.state.currentTrack && this.isUnlocked()) {
        this.setMusic(this.state.currentTrack)
      }
    }

    this.saveState()
  }

  /**
   * Get current audio state
   */
  getState(): AudioState {
    return { ...this.state }
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this.state.musicVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(this.state.enabled ? this.state.musicVolume : 0)
    this.saveState()
  }

  /**
   * Set SFX volume (0-1)
   */
  setSfxVolume(volume: number): void {
    this.state.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveState()
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.currentMusic?.stop()
    this.currentMusic = null
    this.state.currentTrack = null
    this.state.isPlaying = false
    this.saveState()
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAll()
    for (const howl of this.musicInstances.values()) {
      howl.unload()
    }
    for (const howl of this.sfxInstances.values()) {
      howl.unload()
    }
    this.musicInstances.clear()
    this.sfxInstances.clear()
  }
}

/**
 * Get the audio service singleton instance
 */
export function getAudioService(): AudioService {
  if (!audioService) {
    audioService = new AudioService()
  }
  return audioService
}

/**
 * Reset the audio service singleton (for testing only)
 */
export function resetAudioService(): void {
  audioService?.destroy()
  audioService = null
}

/**
 * Thin interface exports
 * These are the primary API for other modules
 */

/** Play a sound effect by ID */
export function playSfx(id: SfxId, volume?: number): void {
  getAudioService().playSfx(id, volume)
}

/** Set the current music track */
export function setMusic(track: MusicTrack | null): void {
  getAudioService().setMusic(track)
}

/** Enable or disable all audio */
export function setEnabled(enabled: boolean): void {
  getAudioService().setEnabled(enabled)
}

/** Check if audio is unlocked (iOS) */
export function isAudioUnlocked(): boolean {
  return getAudioService().isUnlocked()
}

/** Unlock audio (call from user gesture) */
export function unlockAudio(): void {
  getAudioService().unlock()
}

/** Get current audio state */
export function getAudioState(): AudioState {
  return getAudioService().getState()
}

/** Set music volume (0-1) */
export function setMusicVolume(volume: number): void {
  getAudioService().setMusicVolume(volume)
}

/** Set SFX volume (0-1) */
export function setSfxVolume(volume: number): void {
  getAudioService().setSfxVolume(volume)
}

/** Stop all audio */
export function stopAllAudio(): void {
  getAudioService().stopAll()
}

// Re-export types
export type { MusicTrack, SfxId, AudioState }
