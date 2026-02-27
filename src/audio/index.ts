/**
 * Audio Module
 * Provides the thin interface: playSfx(id), setMusic(track), setEnabled(boolean)
 */

export {
  // Thin interface
  playSfx,
  setMusic,
  setEnabled,
  // Additional utilities
  isAudioUnlocked,
  unlockAudio,
  getAudioState,
  setMusicVolume,
  setSfxVolume,
  stopAllAudio,
  // Types
  type MusicTrack,
  type SfxId,
  type AudioState,
} from './audioService'

export {
  MUSIC_ASSETS,
  defaultAudioState,
  AUDIO_STORAGE_KEY,
  IOS_UNLOCK_STORAGE_KEY,
  type AudioAssetConfig,
} from './types'

export {
  SFX_CATALOG,
  getSfx,
  getSfxByCategory,
  hasSfx,
  type SfxCategory,
  type SfxDefinition,
} from './sfxCatalog'

export { AudioUnlock } from './AudioUnlock'
export { getMusicForCareerStage, getMusicTrackDisplayName } from './careerMusic'
