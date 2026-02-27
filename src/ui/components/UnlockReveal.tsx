/**
 * Unlock Reveal Component
 * Card flip animation for discovery/unlock moments
 * Shows hidden content with satisfying reveal effect
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './unlockReveal.css'

interface UnlockRevealProps {
  children: React.ReactNode
  frontContent?: React.ReactNode
  isRevealed: boolean
  onRevealComplete?: () => void
  duration?: number // Animation duration in ms
  className?: string
}

/**
 * Unlock Reveal Component
 * Card flip animation that reveals content with:
 * - 3D card flip animation
 * - Particle burst effect on reveal
 * - Support for custom front and back content
 */
export function UnlockReveal({
  children,
  frontContent,
  isRevealed,
  onRevealComplete,
  duration = 600,
  className = '',
}: UnlockRevealProps) {
  const [showParticles, setShowParticles] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isRevealed && !isAnimating) {
      const startTimer = window.setTimeout(() => {
        setIsAnimating(true)
      }, 0)
      // Trigger particle burst at the flip midpoint
      const particleTimer = window.setTimeout(() => {
        setShowParticles(true)
      }, duration * 0.3)

      // Animation complete
      const completeTimer = window.setTimeout(() => {
        setIsAnimating(false)
        onRevealComplete?.()
      }, duration)

      return () => {
        window.clearTimeout(startTimer)
        window.clearTimeout(particleTimer)
        window.clearTimeout(completeTimer)
      }
    }
  }, [isRevealed, duration, onRevealComplete, isAnimating])

  return (
    <div className={`unlock-reveal-container ${className}`}>
      {/* Particle burst effect */}
      <AnimatePresence>
        {showParticles && (
          <ParticleBurst
            onComplete={() => setShowParticles(false)}
          />
        )}
      </AnimatePresence>

      {/* Card flip container */}
      <div
        className="unlock-reveal-card-wrapper"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="unlock-reveal-card"
          initial={false}
          animate={{
            rotateY: isRevealed ? 180 : 0,
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front of card (hidden content) */}
          <div
            className="unlock-reveal-front"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {frontContent || <DefaultFrontContent />}
          </div>

          {/* Back of card (revealed content) */}
          <div
            className="unlock-reveal-back"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Default front content showing a mystery/question mark
 */
function DefaultFrontContent() {
  return (
    <div className="unlock-reveal-mystery">
      <motion.div
        className="unlock-reveal-question"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ?
      </motion.div>
      <div className="unlock-reveal-hint">Tap to reveal</div>
    </div>
  )
}

/**
 * Particle burst effect component
 * Creates a burst of particles when content is revealed
 */
interface ParticleBurstProps {
  particleCount?: number
  onComplete?: () => void
}

const PARTICLE_COLORS = ['#c9927a', '#4ade80', '#60a5fa', '#fbbf24', '#f472b6']

function ParticleBurst({
  particleCount = 12,
  onComplete,
}: ParticleBurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const seeded = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453)
        const seededNext = Math.abs(Math.sin((i + 1) * 78.233) * 19341.3711)
        const distance = 80 + (seeded % 1) * 40
        const size = 4 + (seededNext % 1) * 6

        return {
          id: `particle-${i}`,
          angle,
          distance,
          size,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        }
      }),
    [particleCount],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onComplete?.()
    }, 800)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="particle-burst">
      {particles.map((particle) => (
        <motion.div
            key={particle.id}
            className="particle"
            initial={{
              scale: 0,
              opacity: 1,
              x: 0,
              y: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: Math.cos(particle.angle) * particle.distance,
              y: Math.sin(particle.angle) * particle.distance,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
            }}
          />
      ))}
    </div>
  )
}

/**
 * Simple unlock reveal with text content
 * Pre-configured for common unlock scenarios
 */
interface SimpleUnlockRevealProps {
  title: string
  description?: string
  icon?: string
  isRevealed: boolean
  onRevealComplete?: () => void
  className?: string
}

export function SimpleUnlockReveal({
  title,
  description,
  icon = '🔓',
  isRevealed,
  onRevealComplete,
  className = '',
}: SimpleUnlockRevealProps) {
  return (
    <UnlockReveal
      isRevealed={isRevealed}
      onRevealComplete={onRevealComplete}
      className={className}
      frontContent={
        <div className="simple-unlock-front">
          <div className="simple-unlock-icon">🔒</div>
          <div className="simple-unlock-text">Locked</div>
        </div>
      }
    >
      <div className="simple-unlock-back">
        <div className="simple-unlock-icon revealed">{icon}</div>
        <div className="simple-unlock-title">{title}</div>
        {description && (
          <div className="simple-unlock-description">{description}</div>
        )}
      </div>
    </UnlockReveal>
  )
}
