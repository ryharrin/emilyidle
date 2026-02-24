// Collection and watch-related selectors
export {
  ownedWatches,
  affordableWatches,
  availableMarketWatches,
} from './collection'

// Home Life selectors
export {
  unlockedHomeItemIds,
  getHomeGalleryItems,
  getCurrentHomeScene,
  isHomeItemUnlocked,
  getHomeGalleryProgress,
} from './homeLife'

export { unopenedMailCount, activeToasts, inboxItems } from './mail'

export {
  inTransitPackages,
  currentLocation,
  getTrackingForPackage,
  estimatedDeliveryTime,
  trackingProgressPercent,
} from './tracking'

export { getTherapySessionCost, getConsecutiveSessionProgress } from './consecutiveSessions'

// For backward compatibility, also re-export from watchSelectors.ts
export {
  ownedWatches as ownedWatchesLegacy,
  affordableWatches as affordableWatchesLegacy,
  availableMarketWatches as availableMarketWatchesLegacy,
} from '../watchSelectors'
