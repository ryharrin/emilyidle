/**
 * Performance Monitoring Utilities
 * Tracks FPS, memory, battery, and performance metrics
 */

interface PerformanceMetrics {
  fps: number
  memoryMB: number
  timestamp: number
  batteryLevel?: number
  batteryCharging?: boolean
  batterySaveMode?: boolean
}

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

/**
 * Battery status type
 */
export interface BatteryStatus {
  level: number
  charging: boolean
  saveMode: boolean
  supported: boolean
}

/**
 * Performance monitor class
 * Enhanced with battery monitoring and adaptive throttling
 */
class PerformanceMonitor {
  private fps = 60
  private lastFrameTime = performance.now()
  private frameCount = 0
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = []
  private running = false
  private batteryStatus: BatteryStatus = { level: 1, charging: true, saveMode: false, supported: false }
  private batteryManager: BatteryManager | null = null
  private lowBatteryThreshold = 0.2 // 20%
  // Store handler references for cleanup
  private levelChangeHandler: (() => void) | null = null
  private chargingChangeHandler: (() => void) | null = null

  /**
   * Start monitoring
   */
  start(): void {
    if (this.running) return
    this.running = true
    this.initBatteryMonitoring()
    this.measure()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.running = false
    this.cleanupBatteryMonitoring()
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) this.callbacks.splice(index, 1)
    }
  }

  /**
   * Initialize battery monitoring
   */
  private async initBatteryMonitoring(): Promise<void> {
    if (!('getBattery' in navigator)) {
      this.batteryStatus.supported = false
      return
    }

    try {
      const battery = await (navigator as unknown as { getBattery(): Promise<BatteryManager> }).getBattery()
      this.batteryManager = battery
      this.batteryStatus.supported = true

      this.updateBatteryStatus(battery)

      // Create handler references for proper cleanup
      this.levelChangeHandler = () => this.updateBatteryStatus(battery)
      this.chargingChangeHandler = () => this.updateBatteryStatus(battery)

      // Listen for battery changes
      battery.addEventListener('levelchange', this.levelChangeHandler)
      battery.addEventListener('chargingchange', this.chargingChangeHandler)
    } catch {
      this.batteryStatus.supported = false
    }
  }

  /**
   * Clean up battery monitoring
   */
  private cleanupBatteryMonitoring(): void {
    if (this.batteryManager) {
      // Remove event listeners to prevent memory leaks
      if (this.levelChangeHandler) {
        this.batteryManager.removeEventListener('levelchange', this.levelChangeHandler)
        this.levelChangeHandler = null
      }
      if (this.chargingChangeHandler) {
        this.batteryManager.removeEventListener('chargingchange', this.chargingChangeHandler)
        this.chargingChangeHandler = null
      }
      this.batteryManager = null
    }
  }

  /**
   * Update battery status
   */
  private updateBatteryStatus(battery: BatteryManager): void {
    const level = battery.level
    const charging = battery.charging

    // Detect battery save mode (low battery + not charging)
    const saveMode = level < this.lowBatteryThreshold && !charging

    this.batteryStatus = {
      level,
      charging,
      saveMode,
      supported: true,
    }
  }

  /**
   * Measure performance
   */
  private measure(): void {
    if (!this.running) return

    const now = performance.now()
    this.frameCount++

    // Update FPS every second
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastFrameTime = now

      // Get memory usage if available
      const memoryMB = this.getMemoryUsage()

      const metrics: PerformanceMetrics = {
        fps: this.fps,
        memoryMB,
        timestamp: now,
        batteryLevel: this.batteryStatus.supported ? this.batteryStatus.level : undefined,
        batteryCharging: this.batteryStatus.supported ? this.batteryStatus.charging : undefined,
        batterySaveMode: this.batteryStatus.saveMode,
      }

      this.callbacks.forEach((cb) => { cb(metrics) })
    }

    requestAnimationFrame(() => this.measure())
  }

  /**
   * Get memory usage in MB
   */
  private getMemoryUsage(): number {
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
    if (memory?.usedJSHeapSize) {
      return Math.round(memory.usedJSHeapSize / 1024 / 1024)
    }
    return 0
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps
  }

  /**
   * Get battery status
   */
  getBatteryStatus(): BatteryStatus {
    return { ...this.batteryStatus }
  }

  /**
   * Check if battery save mode is active
   */
  isBatterySaveMode(): boolean {
    return this.batteryStatus.saveMode
  }

  /**
   * Check if performance should be throttled
   */
  shouldThrottle(): boolean {
    return this.batteryStatus.saveMode || (!this.batteryStatus.charging && this.batteryStatus.level < 0.3)
  }
}

// Singleton instance
let monitor: PerformanceMonitor | null = null

/**
 * Get performance monitor
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitor) {
    monitor = new PerformanceMonitor()
  }
  return monitor
}

/**
 * Performance budget targets
 * Aligned with Story 7.7 acceptance criteria
 */
export const PERFORMANCE_BUDGET = {
  fps: {
    target: 60,
    minimum: 55,
    stressTest: 45, // during particle effects
  },
  battery: {
    maxPercentPerHour: 5,
    targetPercentPerHour: 3,
  },
  memory: {
    maxMB: 100,
    targetMB: 80,
  },
  loadTime: {
    tti: 2000, // Time to Interactive (ms)
    fcp: 1000, // First Contentful Paint (ms)
  },
} as const

/**
 * Check if performance is within budget
 */
export function isPerformanceWithinBudget(metrics: PerformanceMetrics): boolean {
  return (
    metrics.fps >= PERFORMANCE_BUDGET.fps.minimum &&
    metrics.memoryMB <= PERFORMANCE_BUDGET.memory.maxMB
  )
}

/**
 * Load time tracker
 * Measures application startup performance
 */
class LoadTimeTracker {
  private startTime: number
  private marks: Map<string, number> = new Map()

  constructor() {
    this.startTime = performance.now()
  }

  /**
   * Mark a milestone in the loading process
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * Get time to interactive
   */
  getTimeToInteractive(): number {
    const tti = this.marks.get('interactive') ?? performance.now()
    return Math.round(tti - this.startTime)
  }

  /**
   * Get first contentful paint (if available via Performance API)
   */
  getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[]
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')
    return fcp ? Math.round(fcp.startTime) : null
  }

  /**
   * Get all timing metrics
   */
  getMetrics(): {
    total: number
    tti: number
    fcp: number | null
    marks: Record<string, number>
  } {
    const marksRecord: Record<string, number> = {}
    this.marks.forEach((time, name) => {
      marksRecord[name] = Math.round(time - this.startTime)
    })

    return {
      total: Math.round(performance.now() - this.startTime),
      tti: this.getTimeToInteractive(),
      fcp: this.getFirstContentfulPaint(),
      marks: marksRecord,
    }
  }

  /**
   * Check if load time is within budget
   */
  isWithinBudget(): boolean {
    const tti = this.getTimeToInteractive()
    return tti <= PERFORMANCE_BUDGET.loadTime.tti
  }
}

// Singleton load time tracker
let loadTimeTracker: LoadTimeTracker | null = null

/**
 * Get load time tracker
 */
export function getLoadTimeTracker(): LoadTimeTracker {
  if (!loadTimeTracker) {
    loadTimeTracker = new LoadTimeTracker()
  }
  return loadTimeTracker
}

/**
 * Battery usage tracker
 * Estimates battery consumption over time
 */
class BatteryUsageTracker {
  private samples: Array<{ timestamp: number; level: number }> = []
  private maxSamples = 100

  /**
   * Record a battery sample
   */
  record(level: number): void {
    this.samples.push({ timestamp: Date.now(), level })
    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }
  }

  /**
   * Calculate battery drain per hour
   */
  getDrainPerHour(): number | null {
    if (this.samples.length < 2) return null

    const first = this.samples[0]
    const last = this.samples[this.samples.length - 1]
    const durationHours = (last.timestamp - first.timestamp) / (1000 * 60 * 60)

    if (durationHours < 0.01) return null // Less than 36 seconds

    const drain = first.level - last.level
    return drain / durationHours
  }

  /**
   * Check if battery usage is within budget
   */
  isWithinBudget(): boolean {
    const drain = this.getDrainPerHour()
    if (drain === null) return true // Not enough data
    return drain <= PERFORMANCE_BUDGET.battery.maxPercentPerHour / 100
  }

  /**
   * Get estimated remaining play time
   */
  getEstimatedPlayTime(currentLevel: number): number | null {
    const drain = this.getDrainPerHour()
    if (drain === null || drain <= 0) return null

    const hoursRemaining = currentLevel / drain
    return Math.round(hoursRemaining * 10) / 10 // Round to 1 decimal
  }

  /**
   * Clear samples
   */
  clear(): void {
    this.samples = []
  }
}

// Singleton battery tracker
let batteryTracker: BatteryUsageTracker | null = null

/**
 * Get battery usage tracker
 */
export function getBatteryUsageTracker(): BatteryUsageTracker {
  if (!batteryTracker) {
    batteryTracker = new BatteryUsageTracker()
  }
  return batteryTracker
}
