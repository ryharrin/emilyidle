import { useMemo, useState } from 'react'
import {
  getCareerProgress,
  canCompleteTherapySession,
  getTherapySessionBaseIncomeCents,
  getTherapyCooldownRemaining,
  getConsecutiveSessionCostState,
} from '../../game/career'
import { getCurrencyDisplay } from '../../game/economy'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { Modal } from '../components/Modal'
import { TherapySessionGame } from '../minigames/TherapySessionGame'
import { CAREER_STAGES } from '../../game/data/careers'
import { getConsecutiveSessionProgress } from '../../game/selectors/consecutiveSessions'
import { ConsecutiveSessionIndicator } from '../components/ConsecutiveSessionIndicator'

export function CareerTab() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const [showSession, setShowSession] = useState(false)

  const progress = useMemo(() => getCareerProgress(state), [state])
  const canStart = canCompleteTherapySession(state, state.clockMs)
  const remainingMs = getTherapyCooldownRemaining(state)
  const incomePerSec = getTherapySessionBaseIncomeCents(state)
  const sessionCostState = getConsecutiveSessionCostState(state)
  const consecutiveProgress = getConsecutiveSessionProgress(state)

  function openSession() {
    setShowSession(true)
  }

  function handleSessionComplete(result: {
    cashCents: number
    xp: number
    durationMs: number
    vignetteId: string
  }) {
    setShowSession(false)

    // Dispatch therapy session completion with stage-specific rewards
    dispatch({
      type: 'COMPLETE_THERAPY_SESSION',
      payload: {
        cashCents: result.cashCents,
        xp: result.xp,
        // Keep cooldown math in game-time units to avoid wall-clock drift/overflow.
        nowMs: state.clockMs,
      },
    })

    // Record interaction
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'therapy-session',
        perfects: 0,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: state.clockMs,
      },
    })
  }

  return (
    <section className="app-body" aria-label="Career tab">
      <h2 className="tab-section-title">Career</h2>
      <p className="app-subtitle">
        {state.careerStage === 'PhDStudent'
          ? 'PhD Student. Sessions earn cash so you can keep building your collection.'
          : `${state.careerStage.replace(/([A-Z])/g, ' $1').trim()}. Advanced sessions yield greater rewards.`}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span className="pill" aria-label="Cash">
          {getCurrencyDisplay(state)}
        </span>
        <span className="pill" aria-label="Enjoyment">
          Enjoyment: {state.enjoyment}
        </span>
        {incomePerSec !== null && (
          <span className="pill" aria-label="Income rate">
            Income: ${(incomePerSec / 100).toFixed(2)}/sec
          </span>
        )}
      </div>

      <section style={{ marginTop: 16 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Progress
        </h3>
        <div
          style={{
            height: 14,
            borderRadius: 999,
            border: '1px solid var(--color-border)',
            background: 'rgba(255, 253, 249, 0.8)',
            overflow: 'hidden',
          }}
          aria-label="Career progress bar"
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round(progress.ratio * 100)}%`,
              background: 'rgba(201, 146, 122, 0.75)',
            }}
          />
        </div>
        <p className="app-subtitle" style={{ marginTop: 8 }}>
          XP: {progress.xp}
          {progress.nextTargetXp ? ` / ${progress.nextTargetXp}` : ''}
        </p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Therapy Session
        </h3>
        {remainingMs > 0 ? (
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            Cooldown: {Math.ceil(remainingMs / 1000)}s (consecutive mode can bypass)
          </p>
        ) : (
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            Ready when you are.
          </p>
        )}

        {sessionCostState ? (
          <ConsecutiveSessionIndicator
            current={consecutiveProgress.current}
            max={consecutiveProgress.max}
            warningLevel={consecutiveProgress.warningLevel}
            baseCost={sessionCostState.baseCost}
            scaledCost={sessionCostState.scaledCost}
            multiplier={sessionCostState.multiplier}
            decayRemainingMs={sessionCostState.decayRemainingMs}
          />
        ) : null}

        <button type="button" className="pill" onClick={openSession} disabled={!canStart}>
          {sessionCostState?.isAtMaxConsecutive
            ? 'Max consecutive reached'
            : `Start Session${sessionCostState ? ` (${sessionCostState.scaledCost})` : ''}`}
        </button>
        {!canStart ? (
          <p className="app-subtitle" style={{ marginTop: 8 }}>
            {sessionCostState?.isAtMaxConsecutive
              ? 'Maximum consecutive sessions reached. Wait for decay.'
              : 'You need more Enjoyment to start.'}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Career Timeline
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 12,
          }}
          aria-label="Career timeline"
        >
          {CAREER_STAGES.map((stage, index) => {
            const isCompleted = state.careerXp >= stage.xpRequired
            const isCurrent = state.careerStage === stage.id
            return (
              <div
                key={stage.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: isCurrent
                    ? 'rgba(201, 146, 122, 0.2)'
                    : isCompleted
                      ? 'rgba(46, 125, 50, 0.1)'
                      : 'rgba(128, 128, 128, 0.05)',
                  border: isCurrent
                    ? '1px solid rgba(201, 146, 122, 0.5)'
                    : '1px solid transparent',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: isCompleted
                      ? 'var(--color-success, #2e7d32)'
                      : 'var(--color-border, #ccc)',
                    color: isCompleted ? '#fff' : '#666',
                  }}
                  aria-label={isCompleted ? 'Completed' : 'Locked'}
                >
                  {isCompleted ? '✓' : index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      fontSize: '0.95rem',
                    }}
                  >
                    {stage.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary, #666)',
                      marginLeft: 8,
                    }}
                  >
                    {stage.xpRequired > 0 ? `${stage.xpRequired.toLocaleString()} XP` : 'Start'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {showSession ? (
        <Modal title="Therapy Session" onClose={() => setShowSession(false)}>
          <TherapySessionGame
            stage={state.careerStage}
            onComplete={handleSessionComplete}
            onCancel={() => setShowSession(false)}
          />
        </Modal>
      ) : null}
    </section>
  )
}
