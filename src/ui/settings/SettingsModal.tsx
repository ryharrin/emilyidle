import { useState } from 'react'
import type { Action, GameState } from '../../game/types'
import { exportSaveString, importSaveString } from '../../game/saveBackup'
import { Modal } from '../components/Modal'

export function SettingsModal(props: {
  state: GameState
  dispatch: (action: Action) => void
  onClose: () => void
}) {
  const [exportText, setExportText] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importText, setImportText] = useState('')

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
    </Modal>
  )
}

