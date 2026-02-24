import type { GameState } from '../types'
import type { HomeLifeItem } from '../data/homeLife'
import { getAllHomeLifeItemsSorted, getHomeSceneForStage, type HomeScene } from '../data/homeLife'

// Selector to get unlocked home item IDs
export function unlockedHomeItemIds(state: GameState): string[] {
  return state.unlockedHomeItems
}

// Selector to get all home life items with their unlock status
export function getHomeGalleryItems(state: GameState): Array<{
  item: HomeLifeItem
  unlocked: boolean
}> {
  const unlockedIds = new Set(state.unlockedHomeItems)
  const allItems = getAllHomeLifeItemsSorted()

  return allItems.map((item) => {
    const id = item.data.id
    return {
      item,
      unlocked: unlockedIds.has(id),
    }
  })
}

// Selector to get the current home scene based on career stage
export function getCurrentHomeScene(state: GameState): HomeScene {
  return getHomeSceneForStage(state.careerStage)
}

// Selector to check if a specific home item is unlocked
export function isHomeItemUnlocked(state: GameState, itemId: string): boolean {
  return state.unlockedHomeItems.includes(itemId)
}

// Selector to get count of unlocked vs total items
export function getHomeGalleryProgress(state: GameState): {
  unlocked: number
  total: number
} {
  const allItems = getAllHomeLifeItemsSorted()
  const unlockedIds = new Set(state.unlockedHomeItems)

  return {
    unlocked: allItems.filter((item) => unlockedIds.has(item.data.id)).length,
    total: allItems.length,
  }
}
