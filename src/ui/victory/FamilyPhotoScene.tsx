/**
 * Family Photo Scene Component
 * Displays unlocked home items in a gallery
 */

import { motion } from 'motion/react'
import { ALL_HOME_LIFE_ITEMS } from '../../game/data/homeLife'
import type { GameState } from '../../game/types'
import './familyPhotoScene.css'

interface FamilyPhotoSceneProps {
  state: GameState
}

/**
 * Family Photo Scene
 * Shows all unlocked memories in a Ken Burns-style gallery
 */
export function FamilyPhotoScene({ state }: FamilyPhotoSceneProps) {
  const unlockedItems = ALL_HOME_LIFE_ITEMS.filter((item) => {
    const itemId =
      item.type === 'photo'
        ? item.data.id
        : item.type === 'drawing'
          ? item.data.id
          : item.data.id
    return state.unlockedHomeItems.includes(itemId)
  })

  return (
    <div className="family-photo-scene">
      <h2 className="scene-title">A Life in Memories</h2>

      <div className="photo-gallery">
        {unlockedItems.map((item, index) => (
          <motion.div
            key={`${item.type}-${item.data.id}`}
            className="photo-item"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.3, duration: 1 }}
          >
            <div className="photo-frame">
              {item.type === 'photo' && (
                <>
                  <img
                    src={item.data.imageUrl}
                    alt={item.data.title}
                    className="photo-image"
                  />
                  <p className="photo-caption">{item.data.title}</p>
                  <p className="photo-year">{item.data.year}</p>
                </>
              )}
              {item.type === 'drawing' && (
                <>
                  <div className="drawing-preview">{item.data.title}</div>
                  <p className="photo-caption">{item.data.artist}&apos;s Drawing</p>
                </>
              )}
              {item.type === 'message' && (
                <>
                  <div className="message-preview">&ldquo;{item.data.subject}&rdquo;</div>
                  <p className="photo-caption">From Ryan</p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {unlockedItems.length === 0 && (
        <p className="no-items-message">Your gallery is waiting to be filled...</p>
      )}
    </div>
  )
}
