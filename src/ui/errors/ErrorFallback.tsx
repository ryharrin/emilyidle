import type { FallbackProps } from 'react-error-boundary'
import { useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { exportSave } from './exportSave'

type Props = FallbackProps & {
  title?: string
}

export function ErrorFallback(props: Props) {
  const state = useGameState()
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportText, setExportText] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  const title = props.title ?? 'Something went wrong'

  function onReload() {
    location.reload()
  }

  async function onExportSave() {
    setExportError(null)
    setExportStatus(null)
    const result = exportSave(state)
    if (!result.ok) {
      setExportError(result.error)
      return
    }

    setExportText(result.value)
    try {
      await navigator.clipboard.writeText(result.value)
      setExportStatus('Copied to clipboard.')
    } catch {
      // Clipboard can fail (permission), but we can still show the text on-screen later if needed.
      // For now, surface a short message.
      setExportError('Could not copy to clipboard. The save text is shown below.')
    }
  }

  return (
    <main className="app-shell" role="alert">
      <h1>{title}</h1>
      <p>
        The app hit an unexpected issue. Your progress can still be exported and the app can be reloaded.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onExportSave}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          Export Save
        </button>
        <button type="button" onClick={onReload} style={{ minWidth: 44, minHeight: 44 }}>
          Reload
        </button>
      </div>

      {exportStatus ? <p>{exportStatus}</p> : null}
      {exportError ? <p>{exportError}</p> : null}
      {exportText ? (
        <textarea
          readOnly
          value={exportText}
          rows={6}
          style={{ width: '100%', marginTop: 12 }}
          aria-label="Exported save text"
        />
      ) : null}

      <details style={{ marginTop: 16 }}>
        <summary>Technical details</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{String(props.error)}</pre>
      </details>
    </main>
  )
}
