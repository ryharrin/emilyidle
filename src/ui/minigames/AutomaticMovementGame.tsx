import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import {
  AUTOMATIC_MOVEMENT,
  MS_PER_BEAT,
} from '../../game/constants'

export type TimingGrade = 'Perfect' | 'Good' | 'Miss'

export type AutomaticMovementResult = {
  perfects: number
  powerLevel: number
  durationMs: number
}

function gradeFromTiming(deltaMs: number): TimingGrade {
  const absDelta = Math.abs(deltaMs)
  if (absDelta <= AUTOMATIC_MOVEMENT.PERFECT_WINDOW_MS) return 'Perfect'
  if (absDelta <= AUTOMATIC_MOVEMENT.PERFECT_WINDOW_MS * 2) return 'Good'
  return 'Miss'
}

function powerGainFromGrade(grade: TimingGrade): number {
  switch (grade) {
    case 'Perfect':
      return 15
    case 'Good':
      return 8
    case 'Miss':
      return 3
  }
}

export function AutomaticMovementGame(props: {
  onComplete: (result: AutomaticMovementResult) => void
}) {
  const startedAtMsRef = useRef<number>(0)
  const beatStartTimeRef = useRef<number>(0)

  const [powerLevel, setPowerLevel] = useState(0)
  const [perfects, setPerfects] = useState(0)
  const [grade, setGrade] = useState<TimingGrade | null>(null)
  const [rotorRotation, setRotorRotation] = useState(0)
  const [lastTapTime, setLastTapTime] = useState<number | null>(null)

  useEffect(() => {
    startedAtMsRef.current = Date.now()
    beatStartTimeRef.current = Date.now()
  }, [])

  const instruction = useMemo(() => {
    if (!grade && !lastTapTime) {
      return 'Tap in rhythm with the beat to spin the rotor.'
    }
    if (grade === 'Perfect') return 'Perfect! Keep that rhythm.'
    if (grade === 'Good') return 'Good. Try to tap right on the beat.'
    return 'Miss. Listen for the beat and tap along.'
  }, [grade, lastTapTime])

  function handleTap() {
    const now = Date.now()
    setLastTapTime(now)

    // Calculate time since last beat
    const elapsed = now - beatStartTimeRef.current
    const beatPosition = elapsed % MS_PER_BEAT

    // Distance from nearest beat (either current or next)
    const deltaFromBeat = Math.min(
      beatPosition,
      MS_PER_BEAT - beatPosition
    )

    const g = gradeFromTiming(deltaFromBeat)
    setGrade(g)

    if (g === 'Perfect') {
      setPerfects((p) => p + 1)
    }

    // Update power level (capped at MAX)
    const gain = powerGainFromGrade(g)
    setPowerLevel((p) => Math.min(AUTOMATIC_MOVEMENT.POWER_MAX, p + gain))

    // Spin rotor
    setRotorRotation((r) => r + AUTOMATIC_MOVEMENT.ROTOR_SPIN_DEGREES)

    // Check if power is full
    if (powerLevel + gain >= AUTOMATIC_MOVEMENT.POWER_MAX) {
      // Small delay to show the final fill animation
      setTimeout(() => {
        props.onComplete({
          perfects,
          powerLevel: AUTOMATIC_MOVEMENT.POWER_MAX,
          durationMs: Math.max(0, now - (startedAtMsRef.current || now)),
        })
      }, 300)
    }
  }

  function handleFinish() {
    props.onComplete({
      perfects,
      powerLevel,
      durationMs: Math.max(
        0,
        Date.now() - (startedAtMsRef.current || Date.now())
      ),
    })
  }

  const isFull = powerLevel >= AUTOMATIC_MOVEMENT.POWER_MAX

  return (
    <div>
      <p className="app-subtitle" style={{ marginTop: 0 }}>
        Power Reserve
      </p>
      <p className="app-subtitle">{instruction}</p>

      {/* Metronome visual */}
      <div
        style={{
          position: 'relative',
          height: 60,
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          background:
            'linear-gradient(180deg, rgba(255, 253, 249, 0.92), rgba(251, 245, 234, 0.9))',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        {/* Beat indicator */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 60 / AUTOMATIC_MOVEMENT.BPM,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'rgba(201, 146, 122, 0.8)',
          }}
        />

        {/* Beat markers */}
        <div
          style={{
            position: 'absolute',
            left: '10%',
            width: 2,
            height: 20,
            background: 'rgba(16, 42, 67, 0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '10%',
            width: 2,
            height: 20,
            background: 'rgba(16, 42, 67, 0.2)',
          }}
        />
      </div>

      {/* Rotor visualization */}
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          marginBottom: 16,
        }}
      >
        <motion.div
          animate={{ rotate: rotorRotation }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 12,
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '2px solid rgba(16, 42, 67, 0.3)',
            background:
              'linear-gradient(135deg, rgba(255, 253, 249, 0.95), rgba(230, 220, 200, 0.9))',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 8px 24px rgba(16, 42, 67, 0.15)',
          }}
        >
          {/* Rotor weight */}
          <div
            style={{
              width: 70,
              height: 16,
              borderRadius: 8,
              background: 'rgba(201, 146, 122, 0.7)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(16, 42, 67, 0.8)',
            }}
          />
        </motion.div>
      </div>

      {/* Power reserve gauge */}
      <div
        style={{
          height: 24,
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          background: 'rgba(16, 42, 67, 0.05)',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${powerLevel}%` }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 20,
          }}
          style={{
            height: '100%',
            borderRadius: 12,
            background: isFull
              ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 1))'
              : 'linear-gradient(90deg, rgba(201, 146, 122, 0.6), rgba(201, 146, 122, 0.9))',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
          fontSize: 14,
          color: 'rgba(16, 42, 67, 0.7)',
        }}
      >
        <span>{powerLevel}%</span>
        <span>{isFull ? 'Full' : 'Charging...'}</span>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <span className="pill" aria-label="Perfect count">
          Perfects: {perfects}
        </span>
        {grade ? (
          <span className="pill" aria-label="Grade">
            {grade}
          </span>
        ) : null}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="pill"
          onClick={handleTap}
          disabled={isFull}
          style={{
            flex: 1,
            opacity: isFull ? 0.5 : 1,
          }}
        >
          Tap to Wind
        </button>
        <button type="button" className="pill" onClick={handleFinish}>
          Finish
        </button>
      </div>
    </div>
  )
}
