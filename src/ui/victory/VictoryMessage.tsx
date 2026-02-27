/**
 * Victory Message Component
 * Displays Ryan's personalized message to Emily
 */

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { GameState } from '../../game/types'
import './victoryMessage.css'

interface VictoryMessageProps {
  state: GameState
}

/**
 * Generate personalized message based on playthrough
 */
function generateMessage(state: GameState): string[] {
  const lines: string[] = []

  // Opening
  lines.push('Dear Emily,')
  lines.push('')

  // Journey acknowledgment
  const hoursPlayed = Math.floor(state.clockMs / (1000 * 60 * 60))
  lines.push(
    `You've spent ${hoursPlayed} hours with this little world I made for you.`
  )
  lines.push('')

  // Collection milestone
  lines.push(
    `You've gathered ${state.ownedWatchIds.length} timepieces, each one marking a moment in your journey.`
  )
  lines.push('')

  // Career milestone
  lines.push('From pre-PhD all the way to Retirement,')
  lines.push("you've built a career that touched countless lives.")
  lines.push('')

  // Home milestone
  lines.push(`Your home gallery holds ${state.unlockedHomeItems.length} memories.`)
  lines.push('Each photo, each drawing, each message—')
  lines.push('all pieces of a life well-lived.')
  lines.push('')

  // Personal touch
  lines.push('I built this game to tell you something.')
  lines.push('');
  lines.push('At Last.')
  lines.push('');
  lines.push('At last, I can express what words alone could not.')
  lines.push('At last, you have the gift I always wanted to give you.')
  lines.push('');
  lines.push('Thank you for playing.')
  lines.push('Thank you for being you.')
  lines.push('');
  lines.push('With all my love,')
  lines.push('Ryan')

  return lines
}

/**
 * Victory Message
 * Typewriter-style reveal of the personal message
 */
export function VictoryMessage({ state }: VictoryMessageProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const lines = generateMessage(state)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((current) => {
        if (current >= lines.length) {
          clearInterval(interval)
          return current
        }
        return current + 1
      })
    }, 800) // Reveal a new line every 800ms

    return () => clearInterval(interval)
  }, [lines.length])

  return (
    <div className="victory-message">
      <div className="message-content">
        {lines.map((line, index) => (
          <motion.p
            key={index}
            className={`message-line ${line === '' ? 'empty' : ''} ${
              line === 'At Last.' ? 'highlight' : ''
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: index < visibleLines ? 1 : 0,
              y: index < visibleLines ? 0 : 10,
            }}
            transition={{ duration: 0.5 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  )
}
