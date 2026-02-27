import { useEffect, useState, useCallback } from 'react'
import { getPerformanceMonitor, getBatteryUsageTracker } from '../../utils/performance'

export interface BatteryMonitorState {
  level: number
  charging: boolean
  saveMode: boolean
  supported: boolean
  estimatedHoursRemaining: number | null
}

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

/**
 * Hook to monitor battery status
 * Story 7.7: Battery Optimization - detects battery save mode and level
 * @returns BatteryMonitorState with current battery status
 */
export function useBatteryMonitor(): BatteryMonitorState {
  const [batteryState, setBatteryState] = useState<BatteryMonitorState>({
    level: 1,
    charging: true,
    saveMode: false,
    supported: false,
    estimatedHoursRemaining: null,
  })

  const updateBatteryState = useCallback(async () => {
    const monitor = getPerformanceMonitor()
    const tracker = getBatteryUsageTracker()
    const status = monitor.getBatteryStatus()

    if (status.supported) {
      tracker.record(status.level)
      const estimatedHours = tracker.getEstimatedPlayTime(status.level)

      setBatteryState({
        level: status.level,
        charging: status.charging,
        saveMode: status.saveMode,
        supported: true,
        estimatedHoursRemaining: estimatedHours,
      })
    }
  }, [])

  useEffect(() => {
    let battery: BatteryManager | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    const initBattery = async () => {
      if (!('getBattery' in navigator)) {
        return
      }

      try {
        battery = await (navigator as unknown as { getBattery(): Promise<BatteryManager> }).getBattery()

        const handleBatteryChange = () => {
          updateBatteryState()
        }

        battery.addEventListener('levelchange', handleBatteryChange)
        battery.addEventListener('chargingchange', handleBatteryChange)

        // Initial update
        updateBatteryState()

        // Track battery samples every 5 minutes
        intervalId = setInterval(updateBatteryState, 5 * 60 * 1000)

        return () => {
          battery?.removeEventListener('levelchange', handleBatteryChange)
          battery?.removeEventListener('chargingchange', handleBatteryChange)
        }
      } catch {
        // Battery API not supported or failed
      }
    }

    initBattery()

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [updateBatteryState])

  return batteryState
}

/**
 * Check if battery save mode should be active
 * Story 7.7: Returns true when battery < 20% and not charging
 */
export function shouldUseBatterySaveMode(level: number, charging: boolean): boolean {
  return level < 0.2 && !charging
}
