import { useState } from 'react'
import { getCurrencyDisplay } from '../../game/economy'
import { getPassiveEnjoymentRatePerSecond } from '../../game/passiveIncome'
import {
  canCompleteTherapySession,
  getConsecutiveSessionCostState,
  getTherapyCooldownRemaining,
} from '../../game/career'
import { ownedWatches } from '../../game/watchSelectors'
import { getWatchById, type Watch, type WatchTier } from '../../game/data/watches'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { Modal } from '../components/Modal'
import { QuartzCalibrationGame, type QuartzCalibrationResult } from '../mini-games/QuartzCalibrationGame'
import { ManualWindingGame, type ManualWindingResult } from '../minigames/ManualWindingGame'
import { AutomaticMovementGame, type AutomaticMovementResult } from '../minigames/AutomaticMovementGame'
import { SettingsModal } from '../settings/SettingsModal'
import { FamilyCheckIn } from '../components/FamilyCheckIn'
import { AcceptanceLetter } from '../components/AcceptanceLetter'
import { TherapySessionGame } from '../minigames/TherapySessionGame'
import { HomeGallery } from '../components/HomeGallery'
import { getConsecutiveSessionProgress } from '../../game/selectors/consecutiveSessions'
import { ConsecutiveSessionIndicator } from '../components/ConsecutiveSessionIndicator'

type ActiveGame = {
  tier: WatchTier
  watch: Watch
} | null

export function HomeTab() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const [activeGame, setActiveGame] = useState<ActiveGame>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAcceptanceLetter, setShowAcceptanceLetter] = useState(false)
  const [showTherapyGame, setShowTherapyGame] = useState(false)

  const owned = ownedWatches(state)
  const ownedQuartz = owned.find((w) => w.tier === 'quartz') ?? null
  const ownedQuartzName = ownedQuartz?.name ?? 'Quartz Watch'
  const ownedManual = owned.find((w) => w.tier === 'manual') ?? null
  const ownedAutomatic = owned.find((w) => w.tier === 'automatic') ?? null
  const passiveRate = getPassiveEnjoymentRatePerSecond(state)

  // Onboarding state
  const isPrePhd = state.careerStage === 'pre-phd'
  const therapySessionCost = getConsecutiveSessionCostState(state)
  const consecutiveProgress = getConsecutiveSessionProgress(state)
  const canStartTherapy = state.onboardingComplete && !isPrePhd && canCompleteTherapySession(state, state.clockMs)

  const handleOpenGame = (watch: Watch, tier: WatchTier) => {
    setActiveGame({ tier, watch })
  }

  const handleCloseGame = () => {
    setActiveGame(null)
  }

  const handleQuartzComplete = (result: QuartzCalibrationResult) => {
    handleCloseGame()
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'quartz-calibration',
        perfects: result.perfects,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: Date.now(),
      },
    })
    dispatch({ type: 'GAIN_ENJOYMENT', delta: Math.max(1, result.perfects) })
  }

  const handleManualComplete = (result: ManualWindingResult) => {
    handleCloseGame()
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'manual-winding',
        perfects: result.perfects,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: Date.now(),
      },
    })
    dispatch({ type: 'GAIN_ENJOYMENT', delta: Math.max(1, result.perfects) })
  }

  const handleAutomaticComplete = (result: AutomaticMovementResult) => {
    handleCloseGame()
    dispatch({
      type: 'RECORD_INTERACTION',
      record: {
        id: crypto.randomUUID(),
        gameType: 'automatic-movement',
        perfects: result.perfects,
        goods: 0,
        misses: 0,
        durationMs: result.durationMs,
        createdAtMs: Date.now(),
      },
    })
    dispatch({ type: 'GAIN_ENJOYMENT', delta: Math.max(1, result.perfects) })
  }

  const getGameTitle = (tier: WatchTier): string => {
    switch (tier) {
      case 'quartz':
        return 'Quartz Calibration'
      case 'manual':
        return 'Manual Winding'
      case 'automatic':
        return 'Automatic Movement'
      case 'tourbillon':
        return 'Precision Care'
      default:
        return 'Watch Interaction'
    }
  }

  const getButtonLabel = (tier: WatchTier): string => {
    switch (tier) {
      case 'quartz':
        return 'Calibrate Quartz'
      case 'manual':
        return 'Wind Watch'
      case 'automatic':
        return 'Wind Rotor'
      case 'tourbillon':
        return 'Precision Care'
      default:
        return 'Interact'
    }
  }

  const renderGame = () => {
    if (!activeGame) return null

    const { tier, watch } = activeGame

    switch (tier) {
      case 'quartz':
        return (
          <QuartzCalibrationGame
            onComplete={handleQuartzComplete}
            watchTier={watch.tier}
          />
        )
      case 'manual':
        return <ManualWindingGame onComplete={handleManualComplete} />
      case 'automatic':
        return <AutomaticMovementGame onComplete={handleAutomaticComplete} />
      case 'tourbillon':
        // Tourbillon uses quartz calibration game as placeholder
        return (
          <QuartzCalibrationGame
            onComplete={handleQuartzComplete}
            watchTier={watch.tier}
          />
        )
      default:
        return null
    }
  }

  return (
    <section className="app-body" aria-label="Home tab">
      <h2 className="tab-section-title">Home</h2>
      <p className="app-subtitle">
        Hi Emily. This is the calm hub for an active incremental game.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span className="pill">
          {getCurrencyDisplay(state)}
        </span>
        <span className="pill">
          Enjoyment: {state.enjoyment}
        </span>
        <span className="pill">
          Passive: {passiveRate.toFixed(2)}/s
        </span>
        <span className="pill">
          Love: {state.love}
        </span>
        <button type="button" className="pill" onClick={() => setShowSettings(true)}>
          Settings
        </button>
      </div>

      <section style={{ marginTop: 16 }}>
        <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
          Passive Enjoyment
        </h3>
        <p className="app-subtitle" style={{ marginTop: 0 }}>
          Uncollected: {state.uncollectedEnjoyment.toFixed(2)}
        </p>
        <button
          type="button"
          className="pill"
          onClick={() => dispatch({ type: 'COLLECT_PASSIVE_ENJOYMENT' })}
          disabled={state.uncollectedEnjoyment <= 0}
        >
          Collect passive income
        </button>
      </section>

      {ownedQuartz ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            Quick Interaction
          </h3>
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            {ownedQuartzName}
          </p>
          <button type="button" className="pill" onClick={() => handleOpenGame(ownedQuartz, 'quartz')}>
            {getButtonLabel('quartz')}
          </button>
        </section>
      ) : null}

      {ownedManual ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            Quick Interaction
          </h3>
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            {ownedManual.name}
          </p>
          <button type="button" className="pill" onClick={() => handleOpenGame(ownedManual, 'manual')}>
            {getButtonLabel('manual')}
          </button>
        </section>
      ) : null}

      {ownedAutomatic ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            Quick Interaction
          </h3>
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            {ownedAutomatic.name}
          </p>
          <button type="button" className="pill" onClick={() => handleOpenGame(ownedAutomatic, 'automatic')}>
            {getButtonLabel('automatic')}
          </button>
        </section>
      ) : null}

      {/* Onboarding Section - Acceptance Letter */}
      {isPrePhd && state.mail.some((m) => m.type === 'acceptance-letter' && !m.read) ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            📬 New Mail
          </h3>
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            You have mail waiting in your inbox.
          </p>
          <button
            type="button"
            className="pill"
            onClick={() => setShowAcceptanceLetter(true)}
            style={{
              background: 'rgba(201, 146, 122, 0.2)',
              borderColor: 'rgba(201, 146, 122, 0.6)',
              fontWeight: 500,
            }}
          >
            Read Letter
          </button>
        </section>
      ) : isPrePhd && state.mail.some((m) => m.type === 'acceptance-letter' && m.read) && !state.onboardingComplete ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            Ready to Begin
          </h3>
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            Your journey awaits.
          </p>
          <button
            type="button"
            className="pill"
            onClick={() => dispatch({ type: 'COMPLETE_ONBOARDING' })}
            style={{
              background: 'rgba(76, 175, 80, 0.2)',
              borderColor: 'rgba(76, 175, 80, 0.6)',
              fontWeight: 500,
            }}
          >
            Begin PhD Program
          </button>
        </section>
      ) : null}

      {/* Therapy Session Section (only after onboarding) */}
      {state.onboardingComplete && !isPrePhd ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            🛋️ Therapy Session
          </h3>
          <p className="app-subtitle" style={{ marginTop: 0 }}>
            Cost: {therapySessionCost?.scaledCost ?? '-'} Enjoyment | Reward: Cash + Career XP
          </p>
          {therapySessionCost ? (
            <ConsecutiveSessionIndicator
              current={consecutiveProgress.current}
              max={consecutiveProgress.max}
              warningLevel={consecutiveProgress.warningLevel}
              baseCost={therapySessionCost.baseCost}
              scaledCost={therapySessionCost.scaledCost}
              multiplier={therapySessionCost.multiplier}
              decayRemainingMs={therapySessionCost.decayRemainingMs}
            />
          ) : null}
          <button
            type="button"
            className="pill"
            onClick={() => {
              if (canStartTherapy) {
                dispatch({ type: 'START_THERAPY_SESSION', enjoymentCost: therapySessionCost?.scaledCost ?? 0 })
                setShowTherapyGame(true)
              }
            }}
            disabled={!canStartTherapy}
            style={{
              opacity: canStartTherapy ? 1 : 0.5,
            }}
          >
            {therapySessionCost && state.enjoyment < therapySessionCost.scaledCost
              ? 'Not enough Enjoyment'
              : therapySessionCost?.isAtMaxConsecutive
                ? 'Max consecutive reached'
                : state.therapyCooldownUntilMs > state.clockMs
                  ? `Cooldown active (${Math.ceil(getTherapyCooldownRemaining(state) / 1000)}s)`
                : 'Start Therapy Session'}
          </button>
        </section>
      ) : null}

      <FamilyCheckIn />

      {/* Home Gallery - Story 6-1 */}
      <HomeGallery />

      {import.meta.env.DEV ? (
        <section style={{ marginTop: 16 }}>
          <h3 className="tab-section-title" style={{ fontSize: '1.05rem' }}>
            Dev Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="pill"
              onClick={() => dispatch({ type: 'EARN_CURRENCY_CENTS', amountCents: 25_00 })}
            >
              +$25
            </button>
            <button
              type="button"
              className="pill"
              onClick={() => dispatch({ type: 'GAIN_ENJOYMENT', delta: 1 })}
            >
              +Enjoyment
            </button>
            <button
              type="button"
              className="pill"
              onClick={() =>
                dispatch({
                  type: 'QUEUE_TOAST',
                  toast: {
                    id: crypto.randomUUID(),
                    message: 'Toast test',
                    createdAtMs: Date.now(),
                  },
                })
              }
            >
              Queue Toast
            </button>
            <button
              type="button"
              className="pill"
              onClick={() =>
                dispatch({
                  type: 'ADD_OWNED_WATCH',
                  watchId: getWatchById('cartier-tank-quartz')?.id ?? 'cartier-tank-quartz',
                })
              }
            >
              Own Quartz Watch
            </button>
          </div>
          <p className="app-subtitle" style={{ marginTop: 10 }}>
            PWA/offline support enabled (dev).
          </p>
        </section>
      ) : null}

      {activeGame ? (
        <Modal title={getGameTitle(activeGame.tier)} onClose={handleCloseGame}>
          {renderGame()}
        </Modal>
      ) : null}

      {showSettings ? (
        <SettingsModal
          state={state}
          dispatch={dispatch}
          onClose={() => setShowSettings(false)}
        />
      ) : null}

      {/* Acceptance Letter Modal */}
      {showAcceptanceLetter ? (
        <Modal title="PhD Program Acceptance" onClose={() => setShowAcceptanceLetter(false)}>
          <AcceptanceLetter
            onComplete={(result) => {
              if (result === 'enter-grad-school') {
                dispatch({ type: 'READ_ACCEPTANCE_LETTER' })
              }
              setShowAcceptanceLetter(false)
            }}
          />
        </Modal>
      ) : null}

      {/* Therapy Session Modal */}
      {showTherapyGame ? (
        <Modal title="Therapy Session" onClose={() => setShowTherapyGame(false)}>
          <TherapySessionGame
            stage={state.careerStage}
            onComplete={(result) => {
              setShowTherapyGame(false)
              dispatch({
                type: 'COMPLETE_THERAPY_SESSION',
                payload: {
                  cashCents: result.cashCents,
                  xp: result.xp,
                  // Cooldowns are measured on simulation time, not wall-clock time.
                  nowMs: state.clockMs,
                },
              })
            }}
            onCancel={() => setShowTherapyGame(false)}
          />
        </Modal>
      ) : null}
    </section>
  )
}
