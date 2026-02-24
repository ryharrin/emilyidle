export interface GameInstructionData {
  goal: string
  howToPlay: string
  reward: string
}

type GameInstructionsProps = GameInstructionData

export function GameInstructions({ goal, howToPlay, reward }: GameInstructionsProps) {
  return (
    <div
      className="game-instructions"
      style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        background: 'rgba(251, 245, 234, 0.5)',
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h4
          style={{
            margin: '0 0 6px 0',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Goal
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.5,
            color: 'var(--color-text)',
          }}
        >
          {goal}
        </p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <h4
          style={{
            margin: '0 0 6px 0',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          How to Play
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.5,
            color: 'var(--color-text)',
          }}
        >
          {howToPlay}
        </p>
      </div>

      <div>
        <h4
          style={{
            margin: '0 0 6px 0',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Reward
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.5,
            color: 'var(--color-text)',
          }}
        >
          {reward}
        </p>
      </div>
    </div>
  )
}
