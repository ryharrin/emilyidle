import { useState, useCallback } from 'react'
import type { Action, GameState } from '../../game/types'
import { exportSaveString, importSaveString } from '../../game/saveBackup'
import { Modal } from '../components/Modal'
import { Credits } from '../components/Credits'
import {
  getAudioState,
  setEnabled as setAudioEnabled,
  setMusicVolume,
  setSfxVolume,
} from '../../audio/audioService'

export function SettingsModal(props: {
  state: GameState
  dispatch: (action: Action) => void
  onClose: () => void
}) {
  const [exportText, setExportText] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importText, setImportText] = useState('')
  const [audioState, setAudioState] = useState(getAudioState())
  const [showCredits, setShowCredits] = useState(false)

  const handleAudioToggle = useCallback(() => {
    setAudioEnabled(!audioState.enabled)
    setAudioState(getAudioState())
  }, [audioState.enabled])

  const handleMusicVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value, 10) / 100
    setMusicVolume(volume)
    setAudioState(getAudioState())
  }, [])

  const handleSfxVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value, 10) / 100
    setSfxVolume(volume)
    setAudioState(getAudioState())
  }, [])

  async function onExport() {
    setError(null)
    setStatus(null)
    const raw = exportSaveString(props.state)
    setExportText(raw)
    try {
      await navigator.clipboard.writeText(raw)
      setStatus('Copied save to clipboard.')
    } catch {
      setError('Could not copy to clipboard. The save text is shown below.')
    }
  }

  function onImport() {
    setError(null)
    setStatus(null)
    const result = importSaveString(importText.trim())
    if (!result.ok) {
      setError(`Invalid save string. ${result.error}`)
      return
    }
    props.dispatch({ type: 'LOAD_SAVE', state: result.value })
    setStatus('Imported save.')
  }

  return (
    <Modal title="Settings" onClose={props.onClose}>
      <section style={{ marginBottom: 24 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Audio
        </h3>
        <p className="app-subtitle" style={{ marginTop: 0 }}>
          Control music and sound effects volume
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button
            type="button"
            className="pill"
            onClick={handleAudioToggle}
            aria-label={audioState.enabled ? 'Disable audio' : 'Enable audio'}
          >
            {audioState.enabled ? 'Disable Audio' : 'Enable Audio'}
          </button>
          <span className="app-subtitle">
            {audioState.enabled ? 'Audio enabled' : 'Audio disabled'}
          </span>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="app-subtitle" htmlFor="music-volume">
            Music Volume: {Math.round(audioState.musicVolume * 100)}%
          </label>
          <input
            id="music-volume"
            type="range"
            min="0"
            max="100"
            value={Math.round(audioState.musicVolume * 100)}
            onChange={handleMusicVolumeChange}
            disabled={!audioState.enabled}
            style={{ width: '100%', marginTop: 6 }}
            aria-label="Music volume"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="app-subtitle" htmlFor="sfx-volume">
            Sound Effects Volume: {Math.round(audioState.sfxVolume * 100)}%
          </label>
          <input
            id="sfx-volume"
            type="range"
            min="0"
            max="100"
            value={Math.round(audioState.sfxVolume * 100)}
            onChange={handleSfxVolumeChange}
            disabled={!audioState.enabled}
            style={{ width: '100%', marginTop: 6 }}
            aria-label="Sound effects volume"
          />
        </div>
      </section>

      <section>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Backup
        </h3>
        <p className="app-subtitle" style={{ marginTop: 0 }}>
          Export a save string for safe keeping, or import one to restore progress.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="pill" onClick={onExport}>
            Export Save
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="app-subtitle" style={{ display: 'block' }} htmlFor="import-save-text">
            Import Save
          </label>
          <textarea
            id="import-save-text"
            aria-label="Import save text"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            style={{ width: '100%', marginTop: 6 }}
            placeholder="Paste exported save text here"
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <button type="button" className="pill" onClick={onImport}>
              Import Save
            </button>
          </div>
        </div>

        {status ? <p className="app-subtitle">{status}</p> : null}
        {error ? <p className="app-subtitle">{error}</p> : null}

        {exportText ? (
          <details style={{ marginTop: 12 }}>
            <summary>Exported save text</summary>
            <textarea
              readOnly
              value={exportText}
              rows={6}
              style={{ width: '100%', marginTop: 8 }}
            />
          </details>
        ) : null}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Credits
        </h3>
        <p className="app-subtitle" style={{ marginTop: 0 }}>
          View the credits and personal acknowledgments.
        </p>
        <button
          type="button"
          className="pill"
          onClick={() => setShowCredits(true)}
          style={{
            background: 'rgba(167, 184, 208, 0.2)',
            borderColor: 'rgba(167, 184, 208, 0.5)',
          }}
        >
          View Credits
        </button>
      </section>

      {/* Credits Modal */}
      {showCredits && (
        <Credits
          onComplete={() => setShowCredits(false)}
          onSkip={() => setShowCredits(false)}
        />
      )}
    </Modal>
  )
}

