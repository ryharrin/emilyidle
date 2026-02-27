import { useEffect, useRef, type ReactNode } from 'react'

export function Modal(props: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={props.title}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        paddingTop: `calc(var(--safe-top) + 16px)`,
        paddingRight: `calc(var(--safe-right) + 16px)`,
        paddingBottom: `calc(var(--safe-bottom) + 16px)`,
        paddingLeft: `calc(var(--safe-left) + 16px)`,
        background: 'rgba(16, 42, 67, 0.36)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 2000,
      }}
      onMouseDown={(e) => {
        // Click outside closes.
        if (e.target === e.currentTarget) props.onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') props.onClose()
      }}
    >
      <div
        style={{
          width: 'min(42rem, 100%)',
          borderRadius: 18,
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 253, 249, 0.96)',
          boxShadow: 'var(--shadow-soft)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 14px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{props.title}</h2>
          <button type="button" className="pill" onClick={props.onClose}>
            Close
          </button>
        </header>
        <div style={{ padding: 14 }}>{props.children}</div>
      </div>
    </div>
  )
}
