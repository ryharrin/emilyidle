import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useSpring, AnimatePresence } from 'motion/react'
import type { WatchTier } from '../../game/data/watches'
import {
  evaluateGrade,
  INITIAL_JITTER,
  MIN_JITTER,
  JITTER_DECREMENT,
  TOTAL_ROUNDS,
  ANIMATION_SPEED,
  PERFECT_STREAK_THRESHOLD,
  getDifficultyForWatchTier,
  getThresholds,
  type CalibrationGrade,
} from './lib/quartzCalibration'

export type QuartzCalibrationResult = {
  perfects: number
  durationMs: number
}

type QuartzCalibrationGameProps = {
  onComplete: (result: QuartzCalibrationResult) => void
  watchTier?: WatchTier
}

export function QuartzCalibrationGame({ onComplete, watchTier = 'quartz' }: QuartzCalibrationGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(0)
  const animationRef = useRef<number>(0)

  const [round, setRound] = useState(1)
  const [perfects, setPerfects] = useState(0)
  const [jitterAmount, setJitterAmount] = useState(INITIAL_JITTER)
  const [lastGrade, setLastGrade] = useState<CalibrationGrade | null>(null)
  const [beatPhase, setBeatPhase] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)

  // Get difficulty based on watch tier (AC 3.5.1)
  const difficultyTier = useMemo(() => getDifficultyForWatchTier(watchTier), [watchTier])
  const { perfectWindow: PERFECT_THRESHOLD, goodWindow: GOOD_THRESHOLD } = useMemo(
    () => getThresholds(difficultyTier),
    [difficultyTier]
  )

  // Spring animation for the beat dot
  const springX = useSpring(0, {
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  })

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  // RAF loop for beat jitter animation
  useEffect(() => {
    if (!isAnimating) return

    const animate = () => {
      const time = Date.now() / 1000
      // Combine sine wave jitter with decreasing amplitude
      const jitter = Math.sin(time * ANIMATION_SPEED * Math.PI * 2) * jitterAmount
      setBeatPhase(jitter)
      springX.set(jitter)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [isAnimating, jitterAmount, springX])

  const instruction = useMemo(() => {
    if (!lastGrade) return 'Tap Calibrate when the dot crosses the center line.'
    if (lastGrade === 'Perfect') return 'Perfect! The beat is stabilizing.'
    if (lastGrade === 'Good') return 'Good! Try to hit the center more precisely.'
    return 'Miss. Watch the beat and tap when it crosses the center.'
  }, [lastGrade])

  const handleCalibrate = () => {
    if (!isAnimating) return

    const distanceFromCenter = Math.abs(beatPhase)
    const grade = evaluateGrade(distanceFromCenter, PERFECT_THRESHOLD, GOOD_THRESHOLD)
    setLastGrade(grade)

    if (grade === 'Perfect') {
      const newPerfects = perfects + 1
      setPerfects(newPerfects)
      // Progressive calming effect (AC 3.5.4) - reduce jitter more on success
      setJitterAmount((j) => Math.max(j - JITTER_DECREMENT, MIN_JITTER))

      // Celebration animation on Perfect streaks (AC 3.5.4)
      if (newPerfects >= PERFECT_STREAK_THRESHOLD) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 1500)
      }
    } else if (grade === 'Good') {
      // Slight reduction on good - still calming
      setJitterAmount((j) => Math.max(j - JITTER_DECREMENT / 2, MIN_JITTER))
    }
  }

  const handleNext = () => {
    setLastGrade(null)

    if (round >= TOTAL_ROUNDS) {
      setIsAnimating(false)
      onComplete({
        perfects,
        durationMs: Math.max(0, Date.now() - startTimeRef.current),
      })
      return
    }

    setRound((r) => r + 1)
  }

  return (
    <div ref={containerRef} className="quartz-calibration-game">
      <p className="app-subtitle" style={{ marginTop: 0 }}>
        Round {round}/{TOTAL_ROUNDS}
      </p>
      <p className="app-subtitle">{instruction}</p>

      {/* Beat visualization area */}
      <div
        style={{
          position: 'relative',
          height: 140,
          borderRadius: 18,
          border: '1px solid var(--color-border)',
          background:
            'linear-gradient(180deg, rgba(255, 253, 249, 0.92), rgba(251, 245, 234, 0.9))',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          marginTop: 16,
        }}
      >
        {/* Center line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 2,
            transform: 'translateX(-1px)',
            background: 'rgba(201, 146, 122, 0.65)',
          }}
          aria-hidden
        />

        {/* Perfect zone indicators */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(50% - ${PERFECT_THRESHOLD}px)`,
            width: `${PERFECT_THRESHOLD * 2}px`,
            background: 'rgba(76, 175, 80, 0.08)',
            borderLeft: '1px dashed rgba(76, 175, 80, 0.3)',
            borderRight: '1px dashed rgba(76, 175, 80, 0.3)',
          }}
          aria-hidden
        />

        {/* Celebration particles on perfect streak */}
        <AnimatePresence>
          {showCelebration && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`celebration-particle-${i}`}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    x: Math.cos((i * Math.PI) / 3) * 60,
                    y: Math.sin((i * Math.PI) / 3) * 60,
                    opacity: [1, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: i * 0.05,
                  }}
                  style={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'rgba(76, 175, 80, 0.6)',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Beat dot with spring animation */}
        <motion.div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid rgba(201, 146, 122, 0.55)',
            background:
              lastGrade === 'Perfect'
                ? 'rgba(76, 175, 80, 0.2)'
                : lastGrade === 'Good'
                  ? 'rgba(255, 193, 7, 0.2)'
                  : 'rgba(255, 253, 249, 0.92)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 20px rgba(16, 42, 67, 0.10)',
            x: springX,
          }}
          animate={
            lastGrade === 'Perfect'
              ? { scale: [1, 1.15, 1] }
              : lastGrade === 'Good'
                ? { scale: [1, 1.08, 1] }
                : { scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          aria-hidden
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background:
                lastGrade === 'Perfect'
                  ? 'rgba(76, 175, 80, 0.8)'
                  : lastGrade === 'Good'
                    ? 'rgba(255, 193, 7, 0.8)'
                    : 'rgba(16, 42, 67, 0.75)',
            }}
          />
        </motion.div>

        {/* Distance indicator (subtle) */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            fontSize: '0.75rem',
            color: 'rgba(16, 42, 67, 0.5)',
            fontFamily: 'monospace',
          }}
        >
          {Math.abs(beatPhase).toFixed(0)}px
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginTop: 14,
          alignItems: 'center',
        }}
      >
        <span className="pill" role="status" aria-live="polite">
          Perfects: {perfects}
        </span>
        {lastGrade && (
          <motion.span
            className="pill"
            role="status"
            aria-live="polite"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            style={{
              background:
                lastGrade === 'Perfect'
                  ? 'rgba(76, 175, 80, 0.2)'
                  : lastGrade === 'Good'
                    ? 'rgba(255, 193, 7, 0.2)'
                    : 'rgba(244, 67, 54, 0.1)',
              color:
                lastGrade === 'Perfect'
                  ? '#2e7d32'
                  : lastGrade === 'Good'
                    ? '#f57c00'
                    : '#c62828',
            }}
          >
            {lastGrade}
          </motion.span>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
        }}
      >
        <motion.button
          type="button"
          className="pill"
          onClick={handleCalibrate}
          disabled={!isAnimating}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          style={{
            fontSize: '1.1rem',
            padding: '12px 28px',
            opacity: isAnimating ? 1 : 0.5,
          }}
        >
          Calibrate
        </motion.button>

        <button
          type="button"
          className="pill"
          onClick={handleNext}
          style={{
            opacity: lastGrade ? 1 : 0.5,
          }}
        >
          {round >= TOTAL_ROUNDS ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
