import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { MiniGameResult } from '../../game/selectors/rewards'
import { formatReward } from '../../game/selectors/rewards'

type GradeDisplay = 'Perfect' | 'Good' | 'Miss'

type ResultScreenProps = {
  result: MiniGameResult
  onClose: () => void
  onPlayAgain?: () => void
}

function getOverallGrade(result: MiniGameResult): GradeDisplay {
  if (result.misses === 0 && result.goods === 0 && result.perfects > 0) {
    return 'Perfect'
  }
  if (result.goods > 0 || result.perfects > 0) {
    return 'Good'
  }
  return 'Miss'
}

function getGradeColor(grade: GradeDisplay): string {
  switch (grade) {
    case 'Perfect':
      return 'var(--color-accent)'
    case 'Good':
      return '#4a90a4'
    case 'Miss':
      return '#8b6f6f'
  }
}

function getGradeMessage(grade: GradeDisplay): string {
  switch (grade) {
    case 'Perfect':
      return 'Excellent! Perfect timing!'
    case 'Good':
      return 'Good job! Keep practicing!'
    case 'Miss':
      return 'Keep trying! You will get it!'
  }
}

export function ResultScreen(props: ResultScreenProps) {
  const { result, onClose, onPlayAgain } = props
  const overallGrade = useMemo(() => getOverallGrade(result), [result])
  const gradeColor = useMemo(() => getGradeColor(overallGrade), [overallGrade])



  return (
    <div
      role="dialog"
      aria-label="Mini-game results"
      style={{
        position: 'fixed',
        inset: 0,
        paddingTop: `calc(var(--safe-top) + 16px)`,
        paddingRight: `calc(var(--safe-right) + 16px)`,
        paddingBottom: `calc(var(--safe-bottom) + 16px)`,
        paddingLeft: `calc(var(--safe-left) + 16px)`,
        background: 'rgba(16, 42, 67, 0.36)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: 'min(24rem, 100%)',
          borderRadius: 18,
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 253, 249, 0.96)',
          boxShadow: 'var(--shadow-soft)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '16px 18px',
            borderBottom: '1px solid var(--color-border)',
            background: `linear-gradient(135deg, ${gradeColor}20, transparent)`,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: gradeColor,
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 600,
              fontFamily: 'ui-serif, Georgia, serif',
            }}
          >
            {overallGrade.charAt(0)}
          </motion.div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontFamily: 'ui-serif, Georgia, serif',
                color: gradeColor,
              }}
            >
              {overallGrade}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                fontFamily: "'Avenir Next', Avenir, sans-serif",
              }}
            >
              {getGradeMessage(overallGrade)}
            </p>
          </div>
        </header>

        {/* Breakdown */}
        <div style={{ padding: '18px' }}>
          {/* Performance Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <StatBox label="Perfect" value={result.perfects} color="var(--color-accent)" />
            <StatBox label="Good" value={result.goods} color="#4a90a4" />
            <StatBox label="Miss" value={result.misses} color="#8b6f6f" />
          </div>

          {/* Reward Breakdown */}
          <div
            style={{
              background: 'rgba(16, 42, 67, 0.04)',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '0.9rem',
                fontFamily: "'Avenir Next', Avenir, sans-serif",
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              Rewards
            </h3>

            <RewardRow label="Base reward" value={result.baseReward} />
            {result.tierBonus > 0 && (
              <RewardRow label="Tier bonus" value={result.tierBonus} isBonus />
            )}
            {result.perfectRunBonus > 0 && (
              <RewardRow label="Perfect run bonus" value={result.perfectRunBonus} isBonus />
            )}

            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: "'Avenir Next', Avenir, sans-serif",
                  color: 'var(--color-text)',
                }}
              >
                Total
              </span>
              <motion.span
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: "'Avenir Next', Avenir, sans-serif",
                  color: 'var(--color-accent)',
                }}
              >
                +{formatReward(result.totalReward)}
              </motion.span>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {onPlayAgain && (
              <button
                type="button"
                className="pill"
                onClick={onPlayAgain}
                style={{
                  flex: 1,
                  minWidth: 44,
                  minHeight: 44,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Play Again
              </button>
            )}
            <button
              type="button"
              className="pill"
              onClick={onClose}
              style={{
                flex: 1,
                minWidth: 44,
                minHeight: 44,
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'var(--color-accent)',
                color: 'white',
                border: 'none',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function StatBox(props: { label: string; value: number; color: string }) {
  const { label, value, color } = props
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '10px 8px',
        borderRadius: 10,
        background: `${color}10`,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          fontFamily: "'Avenir Next', Avenir, sans-serif",
          color,
        }}
      >
        {value}
      </motion.div>
      <div
        style={{
          fontSize: '0.75rem',
          fontFamily: "'Avenir Next', Avenir, sans-serif",
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function RewardRow(props: { label: string; value: number; isBonus?: boolean }) {
  const { label, value, isBonus } = props
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontSize: '0.9rem',
          fontFamily: "'Avenir Next', Avenir, sans-serif",
          color: 'var(--color-text-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: "'Avenir Next', Avenir, sans-serif",
          color: isBonus ? '#2d8a4e' : 'var(--color-text)',
        }}
      >
        {isBonus ? '+' : ''}
        {formatReward(value)}
      </span>
    </div>
  )
}
