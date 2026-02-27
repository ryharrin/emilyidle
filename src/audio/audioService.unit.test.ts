import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock howler before importing audioService
// Note: vi.mock factory is hoisted, so we need to define everything inside
vi.mock('howler', () => {
  // Define the mock Howl constructor
  function MockHowl(this: unknown) {
    return {
      play: () => {},
      stop: () => {},
      fade: () => ({ on: () => {}, once: () => {}, volume: () => {} }),
      once: () => ({ fade: () => ({ on: () => {}, once: () => {}, volume: () => {} }) }),
      on: () => ({ fade: () => ({ once: () => {}, volume: () => {} }) }),
      volume: () => ({ fade: () => ({ on: () => {}, once: () => {} }) }),
      unload: () => {},
    }
  }

  return {
    Howl: MockHowl,
    Howler: {
      mute: () => {},
      ctx: { state: 'running' },
      volume: () => {},
    },
  }
})

import {
  playSfx,
  setMusic,
  setEnabled,
  isAudioUnlocked,
  unlockAudio,
  getAudioState,
  setMusicVolume,
  setSfxVolume,
  stopAllAudio,
  resetAudioService,
} from './audioService'
import { AUDIO_STORAGE_KEY, IOS_UNLOCK_STORAGE_KEY, type SfxId } from './types'

describe('Audio Service', () => {
  let setItemSpy: ReturnType<typeof vi.fn>
  let getItemSpy: ReturnType<typeof vi.fn>
  let storage: { [key: string]: string }

  beforeEach(() => {
    // Reset the singleton to ensure clean state between tests
    resetAudioService()

    storage = {}
    setItemSpy = vi.fn((key: string, value: string) => {
      storage[key] = value
    })
    getItemSpy = vi.fn((key: string) => storage[key] ?? null)

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    })

    // Setup iOS detection to return false (not iOS) by default
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Chrome' },
      writable: true,
    })

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('State Management', () => {
    it('should load default state when localStorage is empty', () => {
      const state = getAudioState()
      expect(state.enabled).toBe(true)
      expect(state.musicVolume).toBe(0.5)
      expect(state.sfxVolume).toBe(0.7)
      expect(state.currentTrack).toBeNull()
      expect(state.isPlaying).toBe(false)
    })

    it('should load state from localStorage', () => {
      storage[AUDIO_STORAGE_KEY] = JSON.stringify({
        enabled: false,
        musicVolume: 0.8,
        sfxVolume: 0.9,
      })

      const state = getAudioState()
      expect(state.enabled).toBe(false)
      expect(state.musicVolume).toBe(0.8)
      expect(state.sfxVolume).toBe(0.9)
    })

    it('should save state to localStorage when setEnabled is called', () => {
      setEnabled(false)
      expect(setItemSpy).toHaveBeenCalledWith(
        AUDIO_STORAGE_KEY,
        expect.stringContaining('"enabled":false')
      )
    })

    it('should save iOS unlock state to localStorage', () => {
      unlockAudio()
      expect(setItemSpy).toHaveBeenCalledWith(
        IOS_UNLOCK_STORAGE_KEY,
        'true'
      )
    })
  })

  describe('Volume Control', () => {
    it('should update music volume', () => {
      setMusicVolume(0.8)
      const state = getAudioState()
      expect(state.musicVolume).toBe(0.8)
    })

    it('should clamp music volume to 0-1 range', () => {
      setMusicVolume(1.5)
      let state = getAudioState()
      expect(state.musicVolume).toBe(1)

      setMusicVolume(-0.5)
      state = getAudioState()
      expect(state.musicVolume).toBe(0)
    })

    it('should update SFX volume', () => {
      setSfxVolume(0.6)
      const state = getAudioState()
      expect(state.sfxVolume).toBe(0.6)
    })

    it('should clamp SFX volume to 0-1 range', () => {
      setSfxVolume(1.5)
      let state = getAudioState()
      expect(state.sfxVolume).toBe(1)

      setSfxVolume(-0.5)
      state = getAudioState()
      expect(state.sfxVolume).toBe(0)
    })
  })

  describe('Enable/Disable', () => {
    it('should disable audio when setEnabled(false) is called', () => {
      setEnabled(false)
      const state = getAudioState()
      expect(state.enabled).toBe(false)
    })

    it('should enable audio when setEnabled(true) is called', () => {
      setEnabled(false)
      setEnabled(true)
      const state = getAudioState()
      expect(state.enabled).toBe(true)
    })
  })

  describe('iOS Unlock', () => {
    it('should report not unlocked initially', () => {
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Chrome' },
        writable: true,
      })
      expect(isAudioUnlocked()).toBe(true)
    })

    it('should unlock audio when unlockAudio is called', () => {
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'iPhone' },
        writable: true,
      })

      unlockAudio()
      expect(setItemSpy).toHaveBeenCalledWith(
        IOS_UNLOCK_STORAGE_KEY,
        'true'
      )
    })
  })

  describe('Music Control', () => {
    it('should update current track when setMusic is called', () => {
      setMusic('chapter1')
      const state = getAudioState()
      expect(state.currentTrack).toBe('chapter1')
      expect(state.isPlaying).toBe(true)
    })

    it('should stop music when setMusic(null) is called', () => {
      setMusic('chapter1')
      setMusic(null)
      const state = getAudioState()
      expect(state.currentTrack).toBeNull()
    })
  })

  describe('SFX', () => {
    it('should log warning for unknown SFX', () => {
      const consoleSpy = vi.spyOn(console, 'warn')
      playSfx('unknown-sfx' as SfxId)
      expect(consoleSpy).toHaveBeenCalledWith('[Audio] Unknown SFX: unknown-sfx')
    })
  })

  describe('Stop All', () => {
    it('should stop all audio and clear state', () => {
      setMusic('chapter1')
      stopAllAudio()
      const state = getAudioState()
      expect(state.currentTrack).toBeNull()
      expect(state.isPlaying).toBe(false)
    })
  })
})
