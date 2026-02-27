import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { getWatchById } from '../../game/data/watches'

const JLC_WATCH_ID = 'jlc-master-ultra-thin-moon'

/**
 * Special celebration screen that appears when the player receives the JLC watch award.
 * This is triggered when the JLC unlock is pending and shows a personalized celebration
 * with Ryan's message.
 */
export function JLCAwardCelebration() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const [isVisible, setIsVisible] = useState(false)

  const jlcWatch = getWatchById(JLC_WATCH_ID)
  const hasJLCAward = state.pendingUnlocks.includes('career-VAHospital-jlc-award')

  useEffect(() => {
    if (hasJLCAward && !isVisible) {
      const timer = window.setTimeout(() => {
        setIsVisible(true)
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [hasJLCAward, isVisible])

  if (!hasJLCAward || !jlcWatch) return null

  const handleDismiss = () => {
    setIsVisible(false)
    // Dismiss the unlock after animation
    setTimeout(() => {
      dispatch({ type: 'ACKNOWLEDGE_UNLOCK', unlockId: 'career-VAHospital-jlc-award' })
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          role="dialog"
          aria-label="JLC Award Celebration"
          style={{
            position: 'fixed',
            inset: 0,
            paddingTop: `calc(var(--safe-top) + 16px)`,
            paddingRight: `calc(var(--safe-right) + 16px)`,
            paddingBottom: `calc(var(--safe-bottom) + 16px)`,
            paddingLeft: `calc(var(--safe-left) + 16px)`,
            background: 'rgba(16, 42, 67, 0.85)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleDismiss()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{
              width: 'min(28rem, 100%)',
              borderRadius: 20,
              border: '1px solid #c9a962',
              background: 'linear-gradient(180deg, rgba(255, 252, 245, 0.98) 0%, rgba(255, 248, 235, 0.98) 100%)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(201, 169, 98, 0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Header with celebration */}
            <div
              style={{
                background: 'linear-gradient(135deg, #c9a962 0%, #a8863d 50%, #c9a962 100%)',
                padding: '28px 24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative shimmer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transform: 'skewX(-20deg)',
                }}
              />

              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                style={{
                  fontSize: '2.5rem',
                  marginBottom: 8,
                }}
              >
                🌙
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontFamily: 'ui-serif, Georgia, serif',
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                PhD Milestone Award
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: "'Avenir Next', Avenir, sans-serif",
                }}
              >
                Congratulations, Dr. Emily!
              </motion.p>
            </div>

            {/* Watch Display */}
            <div style={{ padding: '24px' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  background: 'rgba(16, 42, 67, 0.04)',
                  borderRadius: 16,
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                {/* Watch Image Placeholder */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                  style={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c9a962 0%, #e8d5a3 50%, #c9a962 100%)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 8px 24px rgba(201, 169, 98, 0.4), inset 0 2px 4px rgba(255,255,255,0.5)',
                    fontSize: '3rem',
                  }}
                >
                  🌙
                </motion.div>

                <h3
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '1.15rem',
                    fontFamily: 'ui-serif, Georgia, serif',
                    color: '#2a3f54',
                  }}
                >
                  {jlcWatch.name}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: "'Avenir Next', Avenir, sans-serif",
                  }}
                >
                  {jlcWatch.size} • {jlcWatch.material} • {jlcWatch.complication}
                </p>
              </motion.div>

              {/* Ryan's Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{
                  background: 'rgba(201, 169, 98, 0.1)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  marginBottom: 20,
                  borderLeft: '3px solid #c9a962',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: 'var(--color-text)',
                    fontFamily: "'Avenir Next', Avenir, sans-serif",
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  "Emily, watching you become Dr. Emily has been the honor of my life.
                  This moon phase reminds us that time flows in cycles—and you've completed
                  yours. The best is yet to come."
                </p>
                <p
                  style={{
                    margin: '12px 0 0 0',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: "'Avenir Next', Avenir, sans-serif",
                    textAlign: 'right',
                  }}
                >
                  — Ryan
                </p>
              </motion.div>

              {/* Moon Phase Symbolism */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                style={{
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: "'Avenir Next', Avenir, sans-serif",
                  }}
                >
                  🌙 The moon symbolizes completion—and new beginnings
                </p>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <button
                  type="button"
                  className="pill"
                  onClick={handleDismiss}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #c9a962 0%, #a8863d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(168, 134, 61, 0.4)',
                  }}
                >
                  Accept with Gratitude
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
