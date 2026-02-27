/**
 * Achievement Showcase Component
 * Displays unlocked achievements during victory sequence
 */

import { motion } from 'motion/react'
import {
  ACHIEVEMENTS,
  isAchievementUnlocked,
} from '../../game/achievements/registry'
import type { GameState } from '../../game/types'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './achievementShowcase.css'

interface AchievementShowcaseProps {
  state: GameState
}

/**
 * Achievement Showcase
 * Shows achievements earned during the journey
 */
export function AchievementShowcase({ state }: AchievementShowcaseProps) {
  const unlockedAchievements = ACHIEVEMENTS.filter(
    (a) => !a.secret && isAchievementUnlocked(state, a.id)
  )

  const totalAchievements = ACHIEVEMENTS.filter((a) => !a.secret).length
  const unlockedCount = unlockedAchievements.length
  const percentage = Math.round((unlockedCount / totalAchievements) * 100)

  return (
    <div className="achievement-showcase">
      <h2 className="scene-title">Achievements Earned</h2>

      <div className="achievement-summary">
        <span className="achievement-count">
          {unlockedCount} of {totalAchievements}
        </span>
        <span className="achievement-percentage">{percentage}%</span>
      </div>

      <div className="showcase-grid">
        {unlockedAchievements.map((achievement, index) => {
          const IconComponent = (Icons[achievement.icon as keyof typeof Icons] as LucideIcon) ||
            Icons.Award

          return (
            <motion.div
              key={achievement.id}
              className="showcase-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <IconComponent size={24} />
              <span className="showcase-name">{achievement.name}</span>
            </motion.div>
          )
        })}
      </div>

      {unlockedAchievements.length === 0 && (
        <p className="no-achievements">Keep exploring to earn achievements!</p>
      )}
    </div>
  )
}
