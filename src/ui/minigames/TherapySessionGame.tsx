import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { CareerStage } from '../../game/types'
import { getRandomVignetteForStage, getRandomTherapistResponses, type TherapyVignette } from '../../game/data/therapyVignettes'
import { playSfx } from '../../audio/audioService'

export type TherapySessionResult = {
  cashCents: number
  xp: number
  durationMs: number
  vignetteId: string
}

export function TherapySessionGame(props: {
  stage: CareerStage
  onComplete: (result: TherapySessionResult) => void
  onCancel?: () => void
}) {
  const startedAtMsRef = useRef<number>(0)
  const [exchangeIndex, setExchangeIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [vignette, setVignette] = useState<TherapyVignette | null>(null)
  const [responseOptions, setResponseOptions] = useState<string[]>([])

  // Initialize vignette and timestamp on mount
  useEffect(() => {
    // Avoid impure calls during render; set once on mount.
    startedAtMsRef.current = Date.now()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init pattern per React docs
    setVignette(getRandomVignetteForStage(props.stage))
    // Play vignette sound when session starts
    playSfx('therapy.vignette')
  }, [props.stage])

  // Initialize response options when vignette changes
  useEffect(() => {
    if (vignette) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- regenerate randomized responses when vignette changes
      setResponseOptions(getRandomTherapistResponses())
    }
  }, [vignette])

  // Calculate progress
  const progress = useMemo(() => {
    if (!vignette) return 0
    return Math.min(1, exchangeIndex / (vignette.exchangeCount - 1))
  }, [exchangeIndex, vignette])

  // Current patient text based on exchange index
  const currentPatientText = useMemo(() => {
    if (!vignette) return null
    return vignette.patientText[exchangeIndex] ?? null
  }, [vignette, exchangeIndex])

  // Check if this is the final exchange
  const isFinalExchange = useMemo(() => {
    if (!vignette) return false
    return exchangeIndex >= vignette.exchangeCount - 1
  }, [vignette, exchangeIndex])

  function handleAdvance() {
    if (!vignette) return

    if (isFinalExchange) {
      // Play session complete sound
      playSfx('therapy.complete')
      // Complete the session
      setIsComplete(true)
      const durationMs = Math.max(0, Date.now() - (startedAtMsRef.current || Date.now()))
      props.onComplete({
        cashCents: vignette.reward.cashCents,
        xp: vignette.reward.xp,
        durationMs,
        vignetteId: vignette.id,
      })
      return
    }

    // Play progress sound for advancing in session
    playSfx('therapy.progress')
    // Advance to next exchange
    setExchangeIndex((idx) => idx + 1)
    // Get new response options for next exchange
    setResponseOptions(getRandomTherapistResponses())
  }

  // Loading state while selecting vignette
  if (!vignette) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p className="app-subtitle">Preparing session...</p>
      </div>
    )
  }

  // Completion state
  if (isComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="app-subtitle" style={{ marginTop: 0, fontWeight: 500 }}>
            Session Complete
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              marginTop: 16,
              flexWrap: 'wrap',
            }}
          >
            <span
              className="pill"
              style={{
                background: 'rgba(201, 146, 122, 0.15)',
                borderColor: 'rgba(201, 146, 122, 0.35)',
              }}
            >
              +${(vignette.reward.cashCents / 100).toFixed(2)}
            </span>
            <span
              className="pill"
              style={{
                background: 'rgba(201, 146, 122, 0.15)',
                borderColor: 'rgba(201, 146, 122, 0.35)',
              }}
            >
              +{vignette.reward.xp} XP
            </span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 4px' }}>
      {/* Progress indicator */}
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: 'rgba(16, 42, 67, 0.1)',
          overflow: 'hidden',
          marginBottom: 20,
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'rgba(201, 146, 122, 0.75)',
            borderRadius: 2,
          }}
        />
      </div>

      {/* Exchange counter */}
      <p className="app-subtitle" style={{ marginTop: 0, marginBottom: 16, fontSize: '0.9rem' }}>
        Exchange {exchangeIndex + 1} of {vignette.exchangeCount}
      </p>

      {/* Patient dialog bubble */}
      <motion.div
        key={exchangeIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'rgba(255, 253, 249, 0.95)',
          border: '1px solid var(--color-border)',
          borderRadius: 18,
          padding: 20,
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(16, 42, 67, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Patient avatar placeholder */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(201, 146, 122, 0.2)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              fontSize: '1.2rem',
            }}
          >
            🧑
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            >
              {currentPatientText}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Therapist response area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          background: 'rgba(201, 146, 122, 0.08)',
          border: '1px dashed rgba(201, 146, 122, 0.4)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: 0,
            fontStyle: 'italic',
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
          }}
        >
          You nod thoughtfully, maintaining a warm, accepting presence...
        </p>
      </motion.div>

      {/* Therapist response options - 3 choices, all advance the conversation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {responseOptions.map((response, index) => (
          <motion.button
            key={index}
            type="button"
            className="pill"
            onClick={handleAdvance}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '0.95rem',
              background: 'rgba(201, 146, 122, 0.12)',
              borderColor: 'rgba(201, 146, 122, 0.4)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {response}
          </motion.button>
        ))}
      </div>

      {/* Cancel option */}
      {props.onCancel && (
        <button
          type="button"
          onClick={props.onCancel}
          style={{
            marginTop: 12,
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          End session early (no rewards)
        </button>
      )}
    </div>
  )
}
