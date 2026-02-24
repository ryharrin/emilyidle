import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { gradeFromError, type Grade } from './quartzAlignmentEval'

export type QuartzAlignmentResult = {
  perfects: number
  durationMs: number
}

export function QuartzAlignmentGame(props: {
  onComplete: (result: QuartzAlignmentResult) => void
}) {
  const startedAtMsRef = useRef<number>(0)
  const [attempt, setAttempt] = useState(1)
  const [perfects, setPerfects] = useState(0)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  const [x, setX] = useState(0)

  useEffect(() => {
    // Avoid impure calls during render; set once on mount.
    startedAtMsRef.current = Date.now()
  }, [])

  const instruction = useMemo(() => {
    if (!grade) return 'Drag the hand, then release to check alignment.'
    if (grade === 'Perfect') return 'Perfect. That felt good.'
    if (grade === 'Good') return 'Good. Tiny adjustment next time.'
    return 'Miss. Try to land right in the center.'
  }, [grade])

  function onRelease() {
    // x is in px in [-120, 120]. Center is 0.
    const normalizedError = Math.min(0.5, Math.abs(x) / 120 / 2) // 0..0.5
    const g = gradeFromError(normalizedError)
    setGrade(g)
    if (g === 'Perfect') {
      setPerfects((p) => p + 1)
      setPulseKey((k) => k + 1)
    }
  }

  function onNext() {
    if (attempt >= 3) {
      props.onComplete({
        perfects,
        durationMs: Math.max(0, Date.now() - (startedAtMsRef.current || Date.now())),
      })
      return
    }
    setAttempt((a) => a + 1)
    setGrade(null)
    setX(0)
  }

  return (
    <div>
      <p className="app-subtitle" style={{ marginTop: 0 }}>
        Attempt {attempt}/3
      </p>
      <p className="app-subtitle">{instruction}</p>

      <div
        style={{
          position: 'relative',
          height: 110,
          borderRadius: 18,
          border: '1px solid var(--color-border)',
          background:
            'linear-gradient(180deg, rgba(255, 253, 249, 0.92), rgba(251, 245, 234, 0.9))',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
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

        <motion.div
          key={pulseKey}
          initial={{ scale: 1 }}
          animate={grade === 'Perfect' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            border: '1px solid rgba(201, 146, 122, 0.55)',
            background: 'rgba(255, 253, 249, 0.92)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 20px rgba(16, 42, 67, 0.10)',
          }}
          aria-hidden
        >
          <div style={{ width: 2, height: 22, background: 'rgba(16, 42, 67, 0.75)' }} />
        </motion.div>

        <motion.button
          type="button"
          className="pill"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'grab',
            userSelect: 'none',
          }}
          drag="x"
          dragConstraints={{ left: -120, right: 120 }}
          dragElastic={0.08}
          onDrag={(_, info) => setX(info.offset.x)}
          onDragEnd={() => onRelease()}
        >
          Drag
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <span className="pill" aria-label="Perfect count">
          Perfects: {perfects}
        </span>
        {grade ? (
          <span className="pill" aria-label="Grade">
            {grade}
          </span>
        ) : null}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <button type="button" className="pill" onClick={onNext}>
          {attempt >= 3 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
