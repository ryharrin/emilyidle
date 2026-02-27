/**
 * Audio System Types
 * Defines the contract for the audio system
 */

/** Music tracks available in the game */
export type MusicTrack =
  | 'menu'
  | 'chapter1'
  | 'chapter2'
  | 'chapter3'
  | 'chapter4'
  | 'chapter5'
  | 'chapter6'
  | 'ending'

/** Sound effect IDs - defined in Story 7.2 */
export type SfxId = string

/** Audio asset configuration */
export interface AudioAssetConfig {
  src: string[]
  volume?: number
  loop?: boolean
  preload?: boolean
}

/** Music track assets */
export const MUSIC_ASSETS: Record<MusicTrack, AudioAssetConfig> = {
  menu: {
    src: ['/assets/audio/music/menu.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  chapter1: {
    src: ['/assets/audio/music/chapter1.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  chapter2: {
    src: ['/assets/audio/music/chapter2.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  chapter3: {
    src: ['/assets/audio/music/chapter3.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  chapter4: {
    src: ['/assets/audio/music/chapter4.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  chapter5: {
    src: ['/assets/audio/music/chapter5.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  chapter6: {
    src: ['/assets/audio/music/chapter6.mp3'],
    volume: 0.5,
    loop: true,
    preload: false,
  },
  ending: {
    src: ['/assets/audio/music/ending.mp3'],
    volume: 0.6,
    loop: false,
    preload: false,
  },
}

/** Audio state */
export interface AudioState {
  enabled: boolean
  musicVolume: number
  sfxVolume: number
  currentTrack: MusicTrack | null
  isPlaying: boolean
  iOSUnlocked: boolean
}

/** Default audio state */
export const defaultAudioState: AudioState = {
  enabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  currentTrack: null,
  isPlaying: false,
  iOSUnlocked: false,
}

/** Storage key for audio preferences */
export const AUDIO_STORAGE_KEY = 'emily-at-last-audio'

/** iOS unlock storage key */
export const IOS_UNLOCK_STORAGE_KEY = 'emily-at-last-ios-audio-unlocked'
