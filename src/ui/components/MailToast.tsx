import { useEffect } from 'react'
import { getWatchById } from '../../game/data/watches'
import type { Toast } from '../../game/types'

export function MailToast(props: { toast: Toast; onDismiss: () => void }) {
  const durationMs = props.toast.durationMs ?? 4000

  useEffect(() => {
    const timer = window.setTimeout(() => {
      props.onDismiss()
    }, durationMs)

    return () => window.clearTimeout(timer)
  }, [durationMs, props.onDismiss])

  const icon = props.toast.kind === 'letter' ? '✉️' : props.toast.kind === 'package' ? '📦' : '🔔'
  const title = props.toast.title ?? 'Notification'
  const tone = props.toast.kind ?? 'system'
  const watch = props.toast.watchId ? getWatchById(props.toast.watchId) : null

  return (
    <article
      role="alert"
      className={`mail-toast mail-toast--${tone}`}
      aria-label={title}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <strong>
          {icon} {title}
        </strong>
        <button
          type="button"
          className="pill"
          onClick={(event) => {
            event.stopPropagation()
            props.onDismiss()
          }}
          aria-label="Dismiss mail notification"
          style={{ minWidth: 34, minHeight: 34 }}
        >
          x
        </button>
      </div>
      {watch ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <img src={watch.imageUrl} alt={watch.name} width={48} height={36} style={{ borderRadius: 8 }} />
          <div style={{ opacity: 0.85 }}>{watch.name}</div>
        </div>
      ) : null}
      <div style={{ opacity: 0.88, marginTop: 6 }}>{props.toast.message}</div>
      {props.toast.sender ? <div style={{ opacity: 0.75, marginTop: 2 }}>From: {props.toast.sender}</div> : null}
      <div
        style={{
          height: 3,
          borderRadius: 99,
          marginTop: 8,
          background: 'linear-gradient(90deg, rgba(201,146,122,0.9), rgba(201,146,122,0.2))',
          transformOrigin: 'left',
          animation: `mail-toast-progress ${durationMs}ms linear forwards`,
        }}
      />
    </article>
  )
}
