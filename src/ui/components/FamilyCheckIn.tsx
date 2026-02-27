import { useState } from 'react'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { Modal } from './Modal'
import { getRandomFamilyMoment } from '../../game/data/familyMoments'
import { getFamilyCheckInCooldownRemaining } from '../../game/career'

export function FamilyCheckIn() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  
  // Family Check-in only available after Emily moves to Michigan (2015+)
  // which corresponds to VA Hospital stage and later (Chapter 3+)
  const isFamilyAvailable = ['VAHospital', 'PrivatePractice', 'GroupPractice', 'Retirement'].includes(state.careerStage)
  const [showMoment, setShowMoment] = useState(false)
  const [currentMoment, setCurrentMoment] = useState<{
    vignette: string
    loveGained: number
  } | null>(null)

  const nowMs = state.clockMs
  const cooldownRemaining = getFamilyCheckInCooldownRemaining(state)
  const canCheckIn = cooldownRemaining <= 0

  const formatCooldown = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleCheckIn = () => {
    if (!canCheckIn) return

    const moment = getRandomFamilyMoment()
    setCurrentMoment(moment)
    setShowMoment(true)

    dispatch({
      type: 'FAMILY_CHECKIN',
      loveGained: moment.loveGained,
      nowMs,
    })
  }

  const closeMoment = () => {
    setShowMoment(false)
    setCurrentMoment(null)
  }

  // Don't show Family Check-in until Emily moves to Michigan (2015+)
  if (!isFamilyAvailable) {
    return null
  }

  return (
    <>
      <section style={{ marginTop: 16 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Family Check-in
        </h3>
        <p className="app-subtitle" style={{ marginTop: 0 }}>
          Connect with loved ones to boost your enjoyment
        </p>
        <button
          type="button"
          className="pill"
          onClick={handleCheckIn}
          disabled={!canCheckIn}
          aria-label={canCheckIn ? 'Check in with family' : `Cooldown remaining: ${formatCooldown(cooldownRemaining)}`}
        >
          {canCheckIn ? 'Check in with family' : `Wait ${formatCooldown(cooldownRemaining)}`}
        </button>
        <p
          className="app-subtitle"
          style={{ marginTop: 8, fontSize: '0.8rem', opacity: 0.8 }}
        >
          Love multiplier: {(1 + state.love / 100).toFixed(2)}x enjoyment
        </p>
      </section>

      {showMoment && currentMoment && (
        <Modal title="A Family Moment" onClose={closeMoment}>
          <div style={{ padding: '16px 0' }}>
            <p
              style={{
                fontStyle: 'italic',
                lineHeight: 1.6,
                marginBottom: 16,
                color: 'var(--color-text)',
              }}
            >
              {currentMoment.vignette}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface, rgba(201,146,122,0.15))',
                borderRadius: 8,
                color: 'var(--color-text)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>♥</span>
              <span>+{currentMoment.loveGained} Love</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="pill" onClick={closeMoment}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
