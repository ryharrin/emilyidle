/**
 * Watch Purchase Animation Component
 * Celebratory animation for watch acquisition
 * Shows scale bounce, sparkle effects, and watch reveal
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getWatchById } from '../../game/data/watches'
import { getWatchImageUrl } from '../../game/catalog'
import './watchPurchaseAnimation.css'

interface WatchPurchaseAnimationProps {
  watchId: string
  onComplete?: () => void
  duration?: number // Total animation duration in ms
}

/**
 * Watch Purchase Animation
 * Displays a satisfying acquisition celebration with:
 * - Scale bounce effect (spring physics)
 * - Watch image reveal with sparkle overlay
 * - Success message
 */
export function WatchPurchaseAnimation({
  watchId,
  onComplete,
  duration = 2500,
}: WatchPurchaseAnimationProps) {
  const [phase, setPhase] = useState<'entering' | 'celebrating' | 'exiting'>('entering')
  const watch = getWatchById(watchId)

  useEffect(() => {
    if (!watch) {
      onComplete?.()
      return
    }

    // Animation sequence timing
    const enteringTimer = setTimeout(() => {
      setPhase('celebrating')
    }, 300)

    const exitTimer = setTimeout(() => {
      setPhase('exiting')
    }, duration - 300)

    const completeTimer = setTimeout(() => {
      onComplete?.()
    }, duration)

    return () => {
      clearTimeout(enteringTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [watch, duration, onComplete])

  if (!watch) return null

  return (
    <AnimatePresence>
      {phase !== 'exiting' && (
        <motion.div
          className="watch-purchase-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background blur */}
          <motion.div
            className="watch-purchase-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Main content */}
          <div className="watch-purchase-content">
            {/* Title */}
            <motion.div
              className="watch-purchase-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              ✨ New Watch Acquired! ✨
            </motion.div>

            {/* Watch card with spring bounce */}
            <motion.div
              className="watch-purchase-card"
              initial={{ scale: 0, rotate: -10 }}
              animate={{
                scale: phase === 'celebrating' ? 1 : 0.8,
                rotate: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              {/* Sparkle effects */}
              <div className="sparkles">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="sparkle"
                    initial={{
                      scale: 0,
                      opacity: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos((i * Math.PI) / 3) * 60,
                      y: Math.sin((i * Math.PI) / 3) * 60,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.5 + i * 0.1,
                      ease: 'easeOut',
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              {/* Watch image */}
              <motion.div
                className="watch-purchase-image-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <img
                  src={getWatchImageUrl(watch)}
                  alt={watch.name}
                  className="watch-purchase-image"
                />
              </motion.div>

              {/* Glow effect */}
              <motion.div
                className="watch-purchase-glow"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Watch details */}
            <motion.div
              className="watch-purchase-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="watch-purchase-name">{watch.name}</div>
              <div className="watch-purchase-brand">{watch.brand}</div>
              <div className="watch-purchase-tier" style={{ textTransform: 'capitalize' }}>
                {watch.tier} Movement
              </div>
            </motion.div>

            {/* Pulse rings */}
            <div className="pulse-rings">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="pulse-ring"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{
                    scale: 2.5,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.4 + i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
