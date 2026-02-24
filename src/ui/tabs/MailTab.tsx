import { useEffect, useMemo, useState } from 'react'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { getWatchById } from '../../game/data/watches'
import { Modal } from '../components/Modal'
import { PackageTrackingCard } from '../components/PackageTrackingCard'
import { TrackingDetailView } from '../components/TrackingDetailView'
import { inTransitPackages } from '../../game/selectors/tracking'

export function MailTab() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  
  // Sort mail by date (newest first)
  const sortedMail = useMemo(() => {
    return [...state.mail].sort((a, b) => b.receivedAtMs - a.receivedAtMs)
  }, [state.mail])
  
  const unreadCount = state.mail.filter((m) => !m.read).length
  const [nowMs, setNowMs] = useState(() => Date.now())
  const trackingPackages = inTransitPackages(state)

  const [selectedMailId, setSelectedMailId] = useState<string | null>(null)
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null)
  const selectedMail = selectedMailId 
    ? state.mail.find((m) => m.id === selectedMailId) 
    : null
  const selectedTracking = selectedTrackingId
    ? trackingPackages.find((item) => item.id === selectedTrackingId) ?? null
    : null

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Handle marking mail as read
  const handleMailClick = (mailId: string) => {
    const mail = state.mail.find((m) => m.id === mailId)
    if (!mail) return
    
    // If it's a package-arrived mail, open package instead
    if (mail.type === 'package-arrived' && mail.watchId) {
      const tracking = state.packageTracking
      const packageId =
        state.pendingPackages.find((p) => p.watchId === mail.watchId)?.id ??
        tracking?.inTransit.find((p) => p.watchId === mail.watchId)?.id ??
        tracking?.delivered.find((p) => p.watchId === mail.watchId)?.id
      if (packageId) {
        dispatch({ type: 'OPEN_PACKAGE', packageId })
      }
      return
    }
    
    // Mark as read and show detail
    if (!mail.read) {
      dispatch({ type: 'MARK_MAIL_READ', mailId })
    }
    setSelectedMailId(mailId)
  }

  const handleCloseDetail = () => {
    setSelectedMailId(null)
  }

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Now'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getMailIcon = (type: string) => {
    switch (type) {
      case 'acceptance-letter': return '📬'
      case 'shipping-notification': return '📦'
      case 'package-arrived': return '🎁'
      case 'ryan-message': return '💌'
      case 'family-message': return '👨‍👩‍👧'
      default: return '📧'
    }
  }

  return (
    <section className="app-body" aria-label="Mail tab">
      <h2 className="tab-section-title">Mail</h2>
      <p className="app-subtitle">
        {unreadCount > 0 
          ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}.`
          : 'No unread messages.'
        }
      </p>

      {trackingPackages.length > 0 ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            In Transit
          </h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {trackingPackages.map((tracking) => (
              <PackageTrackingCard
                key={tracking.id}
                tracking={tracking}
                nowMs={nowMs}
                onOpen={() => setSelectedTrackingId(tracking.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: 16,
        }}
      >
        {sortedMail.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--color-text-muted)',
            }}
          >
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📭</p>
            <p>No mail yet.</p>
          </div>
        ) : (
          sortedMail.map((mail) => (
            <button
              key={mail.id}
              type="button"
              onClick={() => handleMailClick(mail.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 14,
                background: mail.read 
                  ? 'rgba(255, 253, 249, 0.6)' 
                  : 'rgba(201, 146, 122, 0.1)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {getMailIcon(mail.type)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontWeight: mail.read ? 400 : 600,
                      fontSize: '0.95rem',
                      color: 'var(--color-text)',
                    }}
                  >
                    {mail.subject}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {formatDate(mail.receivedAtMs)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mail.from}
                </div>
                {mail.trackingNumber && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: 4,
                    }}
                  >
                    Tracking: {mail.trackingNumber}
                  </div>
                )}
              </div>
              {!mail.read && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
              )}
            </button>
          ))
        )}
      </div>

      {/* Mail Detail Modal */}
      {selectedMail && (
        <Modal title={selectedMail.subject} onClose={handleCloseDetail}>
          <div style={{ padding: '8px 0' }}>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              From: {selectedMail.from}
            </div>
            
            {selectedMail.type === 'acceptance-letter' && (
              <div>
                <p style={{ marginBottom: 12 }}>
                  Dear Emily,
                </p>
                <p style={{ marginBottom: 12 }}>
                  We are pleased to inform you that you have been accepted into our Clinical
                  Psychology Ph.D. program. Your application stood out among a competitive
                  pool of candidates.
                </p>
                <p style={{ marginBottom: 12 }}>
                  This journey will challenge you, change you, and ultimately prepare you
                  for a meaningful career helping others.
                </p>
                <p style={{ marginBottom: 16, fontStyle: 'italic' }}>
                  We look forward to welcoming you this fall.
                </p>
                <div style={{ marginTop: 20, textAlign: 'right' }}>
                  <p>Sincerely,</p>
                  <p><strong>Lisa García Bedolla</strong></p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Vice Provost for Graduate Studies<br />
                    Dean of the Graduate Division
                  </p>
                </div>
              </div>
            )}
            
            {selectedMail.type === 'shipping-notification' && (
              <div>
                <p style={{ marginBottom: 12 }}>
                  Your order has shipped!
                </p>
                {selectedMail.trackingNumber && (
                  <div
                    style={{
                      background: 'rgba(16, 42, 67, 0.05)',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <strong>Tracking Number:</strong><br />
                    <span style={{ fontFamily: 'monospace' }}>
                      {selectedMail.trackingNumber}
                    </span>
                  </div>
                )}
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Estimated arrival: 30 seconds
                </p>
              </div>
            )}
            
            {selectedMail.type === 'package-arrived' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', margin: '0 0 16px' }}>🎁</p>
                <p style={{ marginBottom: 16 }}>
                  Your package has arrived!
                </p>
                {selectedMail.watchId && (
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    {getWatchById(selectedMail.watchId)?.name}
                  </p>
                )}
                <button
                  type="button"
                  className="pill"
                  onClick={() => {
                    const tracking = state.packageTracking
                    const packageId =
                      state.pendingPackages.find((p) => p.watchId === selectedMail.watchId)?.id ??
                      tracking?.inTransit.find((p) => p.watchId === selectedMail.watchId)?.id ??
                      tracking?.delivered.find((p) => p.watchId === selectedMail.watchId)?.id
                    if (packageId) {
                      dispatch({ type: 'OPEN_PACKAGE', packageId })
                      handleCloseDetail()
                    }
                  }}
                  style={{
                    background: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  Open Package
                </button>
              </div>
            )}
            
            {selectedMail.type !== 'acceptance-letter' && 
             selectedMail.type !== 'shipping-notification' && 
             selectedMail.type !== 'package-arrived' && (
              <p>{selectedMail.body}</p>
            )}
          </div>
        </Modal>
      )}

      {selectedTracking ? (
        <Modal title="Tracking Details" onClose={() => setSelectedTrackingId(null)}>
          <TrackingDetailView tracking={selectedTracking} nowMs={nowMs} />
        </Modal>
      ) : null}
    </section>
  )
}
