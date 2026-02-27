import './App.css'
import { GameProvider } from './context/GameProvider'
import { useGameRuntime } from './hooks/useGameRuntime'
import { usePersistence } from './hooks/usePersistence'
import { FeatureErrorBoundary } from './errors/FeatureErrorBoundary'
import { RootErrorBoundary } from './errors/RootErrorBoundary'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BottomNav, type TabId, type TabDefinition } from './components/BottomNav'
import { UnlockToasts } from './components/UnlockToasts'
import { JLCAwardCelebration } from './components/JLCAwardCelebration'
import { MailToastManager } from './components/MailToastManager'
import { AchievementToastManager } from './achievements/AchievementToastManager'
import { Modal } from './components/Modal'
import { RetirementLocationSelector } from './components/RetirementLocationSelector'
import { HomeTab } from './tabs/HomeTab'
import { MailTab } from './tabs/MailTab'
import { CollectionTab } from './tabs/CollectionTab'
import { CareerTab } from './tabs/CareerTab'
import { MarketTab } from './tabs/MarketTab'
import { useGameDispatch, useGameState } from './hooks/useGameState'
import DebugPanel from './debug/DebugPanel'
import { SAVE_KEY } from '../game/constants'
import { initialGameState } from '../game/types'
import { unopenedMailCount } from '../game/selectors/mail'
import { AudioUnlock } from '../audio/AudioUnlock'
import { setMusic, stopAllAudio } from '../audio/audioService'
import { getMusicForCareerStage } from '../audio/careerMusic'

function renderTab(tab: TabId) {
  switch (tab) {
    case 'home':
      return <HomeTab />
    case 'mail':
      return <MailTab />
    case 'collection':
      return <CollectionTab />
    case 'career':
      return <CareerTab />
    case 'market':
      return <MarketTab />
    default:
      return null
  }
}

function GameRoot() {
  useGameRuntime()
  usePersistence()
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [showRetirementLocationSelector, setShowRetirementLocationSelector] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const state = useGameState()
  const dispatch = useGameDispatch()

  const unreadCount = useMemo(() => unopenedMailCount(state), [state])

  // Define tabs with mail badge
  const tabs: TabDefinition[] = useMemo(() => [
    { id: 'home', label: 'Home' },
    { id: 'mail', label: 'Mail', badge: unreadCount },
    { id: 'collection', label: 'Collection' },
    { id: 'career', label: 'Career' },
    { id: 'market', label: 'Market' },
  ], [unreadCount])

  // Update music when career stage changes
  useEffect(() => {
    if (audioUnlocked) {
      const musicTrack = getMusicForCareerStage(state.careerStage)
      setMusic(musicTrack)
    }
  }, [state.careerStage, audioUnlocked])

  useEffect(() => {
    if (state.careerStage !== 'Retirement') return
    if (state.packageTracking?.playerLocation.type === 'custom') return
    const timer = window.setTimeout(() => {
      setShowRetirementLocationSelector(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [state.careerStage, state.packageTracking?.playerLocation.type])

  const handleAudioUnlock = useCallback(() => {
    setAudioUnlocked(true)
    // Start playing music for current career stage
    const musicTrack = getMusicForCareerStage(state.careerStage)
    setMusic(musicTrack)
  }, [state.careerStage])

  return (
    <div className="app-root">
      <div className="app-content">
        <main className="app-shell">
          <header>
            <h1 className="app-title">Emily At Last</h1>
            <p className="app-subtitle">Foundation shell (Epic 1) is live.</p>
          </header>

          <FeatureErrorBoundary title="This tab had an issue">
            {renderTab(activeTab)}
          </FeatureErrorBoundary>
        </main>
      </div>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} tabs={tabs} />
      <MailToastManager />
      <AchievementToastManager />
      <UnlockToasts />
      <JLCAwardCelebration />
      {showRetirementLocationSelector ? (
        <Modal title="Choose Retirement Location" onClose={() => setShowRetirementLocationSelector(false)}>
          <RetirementLocationSelector
            onConfirm={(location) => {
              dispatch({ type: 'SET_RETIREMENT_LOCATION', location })
              setShowRetirementLocationSelector(false)
            }}
          />
        </Modal>
      ) : null}
      {import.meta.env.DEV ? (
        <DebugPanel
          enabled
          state={state}
          dispatch={dispatch}
          onClearSave={() => {
            localStorage.removeItem(SAVE_KEY)
            stopAllAudio()
            dispatch({ type: 'LOAD_SAVE', state: initialGameState })
          }}
        />
      ) : null}
      <AudioUnlock onUnlock={handleAudioUnlock} />
    </div>
  )
}

function App() {
  return (
    <GameProvider>
      <RootErrorBoundary>
        <GameRoot />
      </RootErrorBoundary>
    </GameProvider>
  )
}

export default App
