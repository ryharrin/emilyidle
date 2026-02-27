/**
 * Achievement Gallery Component
 * Displays all achievements with unlock status
 */

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  ACHIEVEMENTS,
  getAchievementsByCategory,
  isAchievementUnlocked,
} from '../../game/achievements/registry'
import type { Achievement, AchievementCategory } from '../../game/achievements/types'
import type { GameState } from '../../game/types'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './achievementGallery.css'

interface AchievementGalleryProps {
  state: GameState
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  collection: 'Collection',
  career: 'Career',
  minigame: 'Mini-Games',
  home: 'Home Life',
  secret: 'Secret',
}

const CATEGORY_ORDER: AchievementCategory[] = [
  'collection',
  'career',
  'minigame',
  'home',
  'secret',
]

/**
 * Achievement Gallery
 * Shows achievements organized by category
 */
export function AchievementGallery({ state }: AchievementGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return ACHIEVEMENTS
    return getAchievementsByCategory(selectedCategory)
  }, [selectedCategory])

  const stats = useMemo(() => {
    const visible = ACHIEVEMENTS.filter((a) => !a.secret)
    const unlocked = visible.filter((a) => isAchievementUnlocked(state, a.id))
    return {
      unlocked: unlocked.length,
      total: visible.length,
      percentage: Math.round((unlocked.length / visible.length) * 100),
    }
  }, [state])

  return (
    <div className="achievement-gallery">
      <header className="achievement-gallery-header">
        <h2>Achievements</h2>
        <div className="achievement-stats">
          <span className="achievement-progress">{stats.percentage}%</span>
          <span className="achievement-count">
            {stats.unlocked} / {stats.total}
          </span>
        </div>
      </header>

      <nav className="achievement-categories">
        <button
          className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
          type="button"
        >
          All
        </button>
        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            type="button"
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </nav>

      <div className="achievement-list">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={isAchievementUnlocked(state, achievement.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  unlocked: boolean
}

function AchievementCard({ achievement, unlocked }: AchievementCardProps) {
  const IconComponent = (Icons[achievement.icon as keyof typeof Icons] as LucideIcon) || Icons.Award

  // Secret achievements show as ??? until unlocked
  const displayName = achievement.secret && !unlocked ? '???' : achievement.name
  const displayDescription = achievement.secret && !unlocked ? '???' : achievement.description

  return (
    <motion.div
      className={`achievement-card ${unlocked ? 'unlocked' : 'locked'} ${achievement.secret ? 'secret' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="achievement-card-icon">
        <IconComponent size={24} />
      </div>
      <div className="achievement-card-content">
        <h4 className="achievement-card-title">{displayName}</h4>
        <p className="achievement-card-description">{displayDescription}</p>
      </div>
      <div className="achievement-card-status">
        {unlocked ? (
          <Icons.CheckCircle size={20} className="status-icon unlocked" />
        ) : (
          <Icons.Lock size={20} className="status-icon locked" />
        )}
      </div>
    </motion.div>
  )
}
