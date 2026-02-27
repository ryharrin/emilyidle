/**
 * Credits Component
 * Displays scrolling credits with personal acknowledgments
 * Enhanced with parallax effects, smooth animations, and handmade touches
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import './credits.css'

interface CreditsProps {
  onComplete?: () => void
  onSkip?: () => void
  showInModal?: boolean
}

interface CreditsSection {
  type: string
  content: string[]
  personalNote?: string
}

/**
 * Credits content sections with handmade personal touches
 */
const CREDITS_SECTIONS: CreditsSection[] = [
  {
    type: 'dedication',
    content: ['A Gift For', 'EMILY'],
    personalNote: 'For the one who deserves something made just for her',
  },
  {
    type: 'created',
    content: ['Created With Love By', 'RYAN'],
    personalNote: 'Every line of code written thinking of you',
  },
  {
    type: 'inspiration',
    content: ['Inspired By', 'The Joy of Watch Collecting', 'The Reward of Therapy Work', 'The Beauty of Family'],
    personalNote: 'Three threads that weave through our life together',
  },
  {
    type: 'acknowledgments',
    content: ['Acknowledgments', 'To the timepieces that sparked wonder', 'To the clients who taught patience', 'To the family who made it all worthwhile'],
    personalNote: 'To Emily specifically—thank you for your patience with this project',
  },
  {
    type: 'thanks',
    content: ['Special Thanks', 'For 6 hours of your time', 'For your curiosity', 'For being you'],
    personalNote: 'Six hours is a lot to ask. Thank you for giving them so generously.',
  },
  {
    type: 'meaning',
    content: ['At Last', 'A home complete', 'A journey ended', 'A love expressed'],
    personalNote: 'At last, I can tell you what you mean to me',
  },
  {
    type: 'signature',
    content: ['With Love,', 'Ryan', new Date().getFullYear().toString()],
  },
  {
    type: 'end',
    content: ['THANK YOU FOR PLAYING'],
    personalNote: 'I hope it was worth the wait',
  },
]

/**
 * Credits component
 * Auto-scrolling credits with personal touches and accessibility
 */
export function Credits({ onComplete, onSkip }: CreditsProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef<HTMLButtonElement>(null)
  const [progress, setProgress] = useState(0)
  const isPausedEffective = isPaused || !isVisible

  useEffect(() => {
    if (isPausedEffective) return

    const duration = 60000 // 60 seconds
    const interval = 100
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((p) => {
        const newProgress = p + increment
        if (newProgress >= 100) {
          onComplete?.()
          return 100
        }
        return newProgress
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPausedEffective, onComplete])

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleTogglePause()
    } else if (e.key === 'Escape') {
      onSkip?.()
    }
  }, [handleTogglePause, onSkip])

  return (
    <button
      ref={containerRef}
      className="credits-container"
      onClick={handleTogglePause}
      onKeyDown={handleKeyDown}
      type="button"
      aria-label={isPausedEffective ? 'Credits paused. Click or press space to resume.' : 'Credits playing. Click or press space to pause.'}
    >
      {/* Vignette overlay */}
      <div className="credits-vignette" />

      {/* Parallax background layers */}
      <div className="credits-parallax">
        <div 
          className="parallax-layer parallax-layer-1" 
          style={{ transform: `translateY(${progress * 0.5}px)` }}
        />
        <div 
          className="parallax-layer parallax-layer-2" 
          style={{ transform: `translateY(${progress * 1.5}px)` }}
        />
        <div 
          className="parallax-layer parallax-layer-3" 
          style={{ transform: `translateY(${progress * 3}px)` }}
        />
      </div>

      {/* Credits content */}
      <div 
        className="credits-content" 
        style={{ transform: `translateY(-${progress}%)` }}
      >
        {CREDITS_SECTIONS.map((section) => (
          <div key={section.type} className={`credits-section ${section.type}`}>
            {section.content.map((line, idx) => (
              <motion.p
                key={`${section.type}-${idx}`}
                className={`credits-line ${idx === 0 ? 'title' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: CREDITS_SECTIONS.indexOf(section) * 0.5 + idx * 0.1,
                  duration: 0.8,
                  ease: 'easeOut'
                }}
              >
                {line}
              </motion.p>
            ))}
            {section.personalNote && (
              <motion.p
                className="credits-personal-note"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: CREDITS_SECTIONS.indexOf(section) * 0.5 + 0.5 }}
              >
                {section.personalNote}
              </motion.p>
            )}
          </div>
        ))}
      </div>

      {/* Skip button */}
      {onSkip && (
        <button 
          className="credits-skip" 
          onClick={(e) => {
            e.stopPropagation()
            onSkip()
          }} 
          type="button"
          aria-label="Skip credits"
        >
          Skip
        </button>
      )}

      {/* Pause indicator */}
      {isPausedEffective && (
        <motion.div 
          className="credits-pause-indicator"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="pause-icon">⏸</span>
          <span>Paused</span>
          <span className="pause-hint">Tap to resume</span>
        </motion.div>
      )}

      {/* Decorative handmade elements */}
      <div className="credits-handmade-accent top-left" aria-hidden="true" />
      <div className="credits-handmade-accent bottom-right" aria-hidden="true" />
    </button>
  )
}

export default Credits
