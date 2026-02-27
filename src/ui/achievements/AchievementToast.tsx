/**
 * Achievement Toast Component
 * Displays achievement unlock notifications
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getAchievement } from '../../game/achievements/registry'
import { playSfx } from '../../audio/audioService'
import type { Achievement } from '../../game/achievements/types'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AchievementToastProps {
  achievementId: string
  onDismiss: () => void
  duration?: number
}

/**
 * Achievement Toast
 * Shows when an achievement is unlocked
 */
export function AchievementToast({
  achievementId,
  onDismiss,
  duration = 5000,
}: AchievementToastProps) {
  const achievement = useMemo<Achievement | undefined>(() => getAchievement(achievementId), [achievementId])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (achievement) {
      // Play unlock sound
      if (achievement.secret) {
        playSfx('unlock.secret')
      } else {
        playSfx('unlock.achievement')
      }
    }

    // Auto-dismiss
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300) // Allow exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [achievement, duration, onDismiss])

  if (!achievement) return null

  // Get icon component dynamically
  const IconComponent = (Icons[achievement.icon as keyof typeof Icons] as LucideIcon) || Icons.Award

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`achievement-toast ${achievement.secret ? 'secret' : ''}`}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="achievement-toast-icon">
            <IconComponent size={32} />
          </div>
          <div className="achievement-toast-content">
            <p className="achievement-toast-label">
              {achievement.secret ? 'Secret Achievement Unlocked!' : 'Achievement Unlocked!'}
            </p>
            <h4 className="achievement-toast-title">{achievement.name}</h4>
            <p className="achievement-toast-description">{achievement.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
