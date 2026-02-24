import { useGameDispatch, useGameState } from '../hooks/useGameState'

function getUnlockPresentation(unlockId: string): { title: string; detail: string } {
  switch (unlockId) {
    case 'career-Externship-manual':
      return {
        title: 'Manual Watches Unlocked',
        detail: 'Chapter 2 begins. Manual watches are now available in the Market.',
      }
    case 'career-Externship-celebration':
      return {
        title: 'Chapter 2: Externship',
        detail: "Emily enters supervised practice. You're building confidence session by session.",
      }
    case 'home-photo-externship':
      return {
        title: 'New Home Memory',
        detail: 'A photo from this chapter has been added to your journey.',
      }
    case 'ryan-message-externship':
      return {
        title: 'Message from Ryan',
        detail: '"Proud of you, Em. You are becoming exactly who you hoped to be."',
      }
    // Story 4.3: VA Hospital unlocks
    case 'career-VAHospital-automatic':
      return {
        title: 'Automatic Watches Unlocked',
        detail: 'Chapter 3 begins. Automatic watches are now available in the Market.',
      }
    case 'career-VAHospital-celebration':
      return {
        title: 'Chapter 3: VA Hospital',
        detail: 'Emily serves veterans with deeper clinical responsibility. A milestone awaits.',
      }
    case 'career-VAHospital-jlc-award':
      return {
        title: 'Special Award: Jaeger-LeCoultre',
        detail: 'A gift to celebrate Emily\'s PhD completion. The Master Ultra Thin Moon.',
      }
    case 'home-photo-va-hospital':
      return {
        title: 'New Home Memory',
        detail: 'A photo from this chapter has been added to your journey.',
      }
    case 'ryan-message-va-hospital':
      return {
        title: 'Message from Ryan',
        detail: '"Emily, watching you become Dr. Emily has been the honor of my life. This moon is for you."',
      }
    default:
      return {
        title: 'Unlocked',
        detail: unlockId,
      }
  }
}

export function UnlockToasts() {
  const state = useGameState()
  const dispatch = useGameDispatch()

  if (state.pendingUnlocks.length === 0) return null

  return (
    <aside className="unlock-toasts" aria-label="Pending unlocks">
      {state.pendingUnlocks.map((unlockId) => {
        const copy = getUnlockPresentation(unlockId)
        return (
          <div key={unlockId} className="unlock-toast">
            <div>
              <strong>{copy.title}</strong>
            </div>
            <div style={{ opacity: 0.85 }}>{copy.detail}</div>
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                className="pill"
                onClick={() => dispatch({ type: 'ACKNOWLEDGE_UNLOCK', unlockId })}
              >
                OK
              </button>
            </div>
          </div>
        )
      })}
    </aside>
  )
}
