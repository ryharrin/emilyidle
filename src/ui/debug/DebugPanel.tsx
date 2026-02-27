import { useMemo, useState, useRef, useEffect } from 'react'
import type { Action, GameState } from '../../game/types'
import { SAVE_KEY } from '../../game/constants'
import { exportSave } from '../errors/exportSave'

export type DebugPanelProps = {
  enabled?: boolean
  state: GameState
  dispatch: (action: Action) => void
  onClearSave?: () => void
}

export default function DebugPanel(props: DebugPanelProps) {
  const enabled = props.enabled ?? import.meta.env.DEV
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  // Draggable state
  const [position, setPosition] = useState({ x: 12, y: 12 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const panelRef = useRef<HTMLElement>(null)

  const stateJson = useMemo(() => {
    // Keep this stable-ish and readable; any redaction can be added later.
    try {
      return JSON.stringify(props.state, null, 2)
    } catch {
      return '[unserializable state]'
    }
  }, [props.state])

  // Global mouse event handlers for dragging
  useEffect(() => {
    if (!isDragging) return

    function handleMouseMove(e: MouseEvent) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }

    function handleMouseUp() {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!enabled) return null

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    setIsDragging(true)
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  function onClearSave() {
    if (props.onClearSave) {
      props.onClearSave()
    } else {
      localStorage.removeItem(SAVE_KEY)
    }
    setExportError(null)
    setExportStatus(`Cleared localStorage key: ${SAVE_KEY}`)
  }

  function onAddMoney() {
    props.dispatch({ type: 'EARN_CURRENCY_CENTS', amountCents: 1_000 })
  }

  function onEnqueueToast() {
    props.dispatch({
      type: 'QUEUE_TOAST',
      toast: { id: `debug-${Date.now()}`, message: 'Debug toast', createdAtMs: Date.now() },
    })
  }

  function onEnqueueUnlock() {
    props.dispatch({ type: 'QUEUE_UNLOCK', unlockId: 'debug-unlock' })
  }

  async function onExportSave() {
    setExportError(null)
    setExportStatus(null)
    const result = exportSave(props.state)
    if (!result.ok) {
      setExportError(result.error)
      return
    }

    try {
      await navigator.clipboard.writeText(result.value)
      setExportStatus('Copied save to clipboard.')
    } catch {
      setExportError('Could not copy to clipboard. See console for export text.')
      // Still make it easy to recover in devtools.
      console.log(result.value)
    }
  }

  return (
    <section
      ref={panelRef}
      aria-label="Debug panel"
      onMouseDown={onMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 'min(520px, calc(100vw - 24px))',
        maxHeight: 'min(70vh, 720px)',
        overflow: 'auto',
        padding: 12,
        border: '1px solid rgba(0,0,0,0.2)',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.95)',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1000,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <h2 style={{ margin: 0, cursor: 'grab' }}>Debug Panel (DEV)</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" onClick={onClearSave} style={{ minWidth: 44, minHeight: 44 }}>
          Clear Save
        </button>
        <button type="button" onClick={onAddMoney} style={{ minWidth: 44, minHeight: 44 }}>
          +$10
        </button>
        <button type="button" onClick={onEnqueueToast} style={{ minWidth: 44, minHeight: 44 }}>
          Toast
        </button>
        <button type="button" onClick={onEnqueueUnlock} style={{ minWidth: 44, minHeight: 44 }}>
          Unlock
        </button>
        <button type="button" onClick={onExportSave} style={{ minWidth: 44, minHeight: 44 }}>
          Export Save
        </button>
      </div>

      {exportStatus ? <p>{exportStatus}</p> : null}
      {exportError ? <p>{exportError}</p> : null}

      <details style={{ marginTop: 12 }}>
        <summary>State</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{stateJson}</pre>
      </details>
    </section>
  )
}
