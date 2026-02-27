/**
 * Animated Progress Bar Component
 * Progress bar with spring physics animation
 * Used for career progress, collection completion, etc.
 */

import { motion, useSpring, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import './animatedProgressBar.css'

interface AnimatedProgressBarProps {
  progress: number // 0-1
  className?: string
  showPercentage?: boolean
  pulseOnComplete?: boolean
}

/**
 * Animated Progress Bar with spring physics
 */
export function AnimatedProgressBar({
  progress,
  className = '',
  showPercentage = false,
  pulseOnComplete = true,
}: AnimatedProgressBarProps) {
  const [isComplete, setIsComplete] = useState(progress >= 1)
  const springProgress = useSpring(0, {
    stiffness: 100,
    damping: 20,
  })
  const width = useTransform(springProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    springProgress.set(Math.max(0, Math.min(1, progress)))
  }, [progress, springProgress])

  useEffect(() => {
    const unsubscribe = springProgress.on('change', (latest) => {
      if (latest >= 0.99 && !isComplete) {
        setIsComplete(true)
      } else if (latest < 0.99 && isComplete) {
        setIsComplete(false)
      }
    })
    return unsubscribe
  }, [springProgress, isComplete])

  return (
    <div
      className={`animated-progress-bar ${className} ${isComplete && pulseOnComplete ? 'complete' : ''}`}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={showPercentage ? `${Math.round(progress * 100)}% complete` : 'Progress'}
    >
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          style={{ width }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
      {showPercentage && (
        <span className="progress-text">{Math.round(progress * 100)}%</span>
      )}
    </div>
  )
}

/**
 * Career Progress Bar
 * Specialized for career stage progress
 */
export function CareerProgressBar({
  currentXp,
  targetXp,
  className = '',
}: {
  currentXp: number
  targetXp: number
  className?: string
}) {
  const progress = targetXp > 0 ? currentXp / targetXp : 0

  return (
    <div className={`career-progress-container ${className}`}>
      <AnimatedProgressBar progress={progress} showPercentage />
      <div className="career-progress-labels">
        <span>{currentXp.toLocaleString()} XP</span>
        <span>{targetXp.toLocaleString()} XP</span>
      </div>
    </div>
  )
}

/**
 * Collection Progress Bar
 * Specialized for collection completion
 */
export function CollectionProgressBar({
  owned,
  total,
  className = '',
}: {
  owned: number
  total: number
  className?: string
}) {
  const progress = total > 0 ? owned / total : 0

  return (
    <div className={`collection-progress-container ${className}`}>
      <AnimatedProgressBar progress={progress} showPercentage />
      <div className="collection-progress-labels">
        <span>{owned} owned</span>
        <span>{total} total</span>
      </div>
    </div>
  )
}
