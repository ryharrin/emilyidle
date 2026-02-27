import { useEffect } from 'react'
import { motion } from 'motion/react'
import { getWatchById } from '../../game/data/watches'
import type { Toast } from '../../game/types'

interface MailToastProps {
  toast: Toast
  onDismiss: () => void
}

export function MailToast({ toast, onDismiss }: MailToastProps) {
  const durationMs = toast.durationMs ?? 4000

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss()
    }, durationMs)

    return () => window.clearTimeout(timer)
  }, [durationMs, onDismiss])

  const icon = toast.kind === 'letter' ? '✉️' : toast.kind === 'package' ? '📦' : '🔔'
  const title = toast.title ?? 'Notification'
  const tone = toast.kind ?? 'system'
  const watch = toast.watchId ? getWatchById(toast.watchId) : null

  return (
    <motion.article
      role="alert"
      className={`mail-toast mail-toast--${tone}`}
      aria-label={title}
      initial={{
        opacity: 0,
        x: 100,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: 50,
        scale: 0.95,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      }}
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
            onDismiss()
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
      <div style={{ opacity: 0.88, marginTop: 6 }}>{toast.message}</div>
      {toast.sender ? <div style={{ opacity: 0.75, marginTop: 2 }}>From: {toast.sender}</div> : null}
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
    </motion.article>
  )
}
