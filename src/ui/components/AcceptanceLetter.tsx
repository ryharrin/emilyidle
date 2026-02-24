import { motion } from 'motion/react'

export type AcceptanceLetterResult = 'enter-grad-school' | 'close'

interface AcceptanceLetterProps {
  onComplete: (result: AcceptanceLetterResult) => void
}

export function AcceptanceLetter({ onComplete }: AcceptanceLetterProps) {
  return (
    <div style={{ padding: '8px 4px' }}>
      {/* Letter header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            marginBottom: 8,
          }}
          aria-hidden
        >
          📬
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          You've Got Mail
        </h3>
      </motion.div>

      {/* Letter content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          background: 'rgba(255, 253, 249, 0.95)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(16, 42, 67, 0.06)',
        }}
      >
        <div
          style={{
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Office of the Vice Provost for Graduate Studies
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            Graduate Division
          </p>
        </div>

        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          Dear Emily,
        </p>

        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          We are pleased to inform you that you have been accepted into our Clinical
          Psychology Ph.D. program. Your application stood out among a competitive
          pool of candidates.
        </p>

        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          This journey will challenge you, change you, and ultimately prepare you
          for a meaningful career helping others.
        </p>

        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          We look forward to welcoming you this fall.
        </p>

        <div
          style={{
            marginTop: 20,
            textAlign: 'right',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
            }}
          >
            Sincerely,
          </p>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Lisa García Bedolla
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            Vice Provost for Graduate Studies<br />
            Dean of the Graduate Division
          </p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <motion.button
          type="button"
          className="pill"
          onClick={() => onComplete('enter-grad-school')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: '1.05rem',
            background: 'rgba(201, 146, 122, 0.2)',
            borderColor: 'rgba(201, 146, 122, 0.6)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Accept Offer & Begin PhD
        </motion.button>

        <button
          type="button"
          onClick={() => onComplete('close')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '8px',
          }}
        >
          Read again later
        </button>
      </motion.div>
    </div>
  )
}
