import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { MANUAL_WINDING } from '../../game/constants'
import { gradeFromHoldDuration, calculateRotation, type Grade } from './manualWindingEval'

export type ManualWindingResult = {
  perfects: number
  totalWinds: number
  durationMs: number
}

export function ManualWindingGame(props: {
  onComplete: (result: ManualWindingResult) => void
}) {
  const startedAtMsRef = useRef<number>(0)
  const holdStartMsRef = useRef<number>(0)
  const [windCount, setWindCount] = useState(0)
  const [perfects, setPerfects] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [holdDuration, setHoldDuration] = useState(0)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [crownRotation, setCrownRotation] = useState(0)
  const [pulseKey, setPulseKey] = useState(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    startedAtMsRef.current = Date.now()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Update hold duration while holding
  useEffect(() => {
    if (!isHolding) return

    const updateHoldDuration = () => {
      setHoldDuration(Date.now() - holdStartMsRef.current)
      animationFrameRef.current = requestAnimationFrame(updateHoldDuration)
    }

    animationFrameRef.current = requestAnimationFrame(updateHoldDuration)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isHolding])

  const instruction = useMemo(() => {
    if (!grade && !isHolding) return 'Hold to wind, release at the right time.'
    if (isHolding) return 'Release when you feel the tension...'
    if (grade === 'Perfect') return 'Perfect. The mainspring tightens smoothly.'
    if (grade === 'Good') return 'Good. A bit more precision next time.'
    return 'Miss. Wait for the optimal tension point.'
  }, [grade, isHolding])

  function onPointerDown() {
    if (grade || isHolding) return
    holdStartMsRef.current = Date.now()
    setIsHolding(true)
    setHoldDuration(0)
  }

  function onPointerUp() {
    if (!isHolding) return
    setIsHolding(false)

    const duration = Date.now() - holdStartMsRef.current
    const g = gradeFromHoldDuration(duration)
    setGrade(g)

    if (g === 'Perfect') {
      setPerfects((p) => p + 1)
      setPulseKey((k) => k + 1)
    }

    // Add rotation for successful winds
    const rotation = calculateRotation(g)
    if (rotation > 0) {
      setCrownRotation((r) => r + rotation)
    }

    setWindCount((w) => w + 1)
  }

  function onNext() {
    if (windCount >= MANUAL_WINDING.MAX_WINDS_PER_GAME) {
      props.onComplete({
        perfects,
        totalWinds: windCount,
        durationMs: Math.max(0, Date.now() - (startedAtMsRef.current || Date.now())),
      })
      return
    }
    setGrade(null)
    setHoldDuration(0)
  }

  // Calculate progress percentage for visual feedback (0-100%)
  const holdProgress = Math.min(100, (holdDuration / MANUAL_WINDING.OPTIMAL_HOLD_MS) * 100)

  // Determine if currently in the perfect zone
  const diffFromOptimal = Math.abs(holdDuration - MANUAL_WINDING.OPTIMAL_HOLD_MS)
  const isInPerfectZone = isHolding && diffFromOptimal <= MANUAL_WINDING.PERFECT_WINDOW_MS
  const isInGoodZone = isHolding && diffFromOptimal <= MANUAL_WINDING.GOOD_WINDOW_MS && !isInPerfectZone

  return (
    <div>
      <p className="app-subtitle" style={{ marginTop: 0 }}>
        Wind {windCount + (grade ? 0 : 1)}/{MANUAL_WINDING.MAX_WINDS_PER_GAME}
      </p>
      <p className="app-subtitle">{instruction}</p>

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
        }}
      >
        {/* Tension gauge */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            height: 8,
            borderRadius: 4,
            background: 'rgba(201, 146, 122, 0.2)',
            overflow: 'hidden',
          }}
          aria-hidden
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 4,
              background: isInPerfectZone
                ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                : isInGoodZone
                  ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, rgba(201, 146, 122, 0.8), rgba(201, 146, 122, 1))',
            }}
            animate={{ width: `${holdProgress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Optimal zone marker */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: `calc(50% - 4px)`,
            width: 8,
            height: 16,
            borderRadius: 2,
            background: 'rgba(34, 197, 94, 0.6)',
          }}
          aria-hidden
        />

        {/* Watch crown */}
        <motion.div
          key={pulseKey}
          initial={{ scale: 1 }}
          animate={grade === 'Perfect' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 999,
            border: '2px solid rgba(201, 146, 122, 0.55)',
            background: 'rgba(255, 253, 249, 0.92)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 20px rgba(16, 42, 67, 0.10)',
            position: 'relative',
          }}
          aria-hidden
        >
          {/* Crown with rotation */}
          <motion.div
            animate={{ rotate: crownRotation }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 999,
              position: 'relative',
            }}
          >
            {/* Crown grip lines */}
            {[0, 45, 90, 135].map((angle) => (
              <div
                key={angle}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 2,
                  height: 20,
                  background: 'rgba(16, 42, 67, 0.3)',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-28px)`,
                }}
              />
            ))}
            {/* Center dot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 12,
                height: 12,
                borderRadius: 999,
                background: 'rgba(201, 146, 122, 0.6)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Hold button */}
        <motion.button
          type="button"
          className="pill"
          style={{
            position: 'absolute',
            top: 16,
            cursor: grade ? 'default' : 'pointer',
            userSelect: 'none',
            opacity: grade ? 0.5 : 1,
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          whileTap={!grade ? { scale: 0.95 } : {}}
          disabled={!!grade}
        >
          {isHolding ? 'Winding...' : grade ? 'Released' : 'Hold to Wind'}
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <span className="pill" title="Perfect count">
          Perfects: {perfects}
        </span>
        <span className="pill" title="Winds completed">
          Winds: {windCount}/{MANUAL_WINDING.MAX_WINDS_PER_GAME}
        </span>
        {grade ? (
          <span className="pill" title="Grade">
            {grade}
          </span>
        ) : null}
      </div>

      {/* Navigation */}
      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        {grade && (
          <button type="button" className="pill" onClick={onNext}>
            {windCount >= MANUAL_WINDING.MAX_WINDS_PER_GAME ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
