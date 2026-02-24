export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export type LogEvent = {
  level: LogLevel
  scope: string
  msg: string
  tsMs: number
  data?: unknown
}

/**
 * Structured JSON logger.
 *
 * Intentionally minimal: one JSON object per call, with tsMs added automatically.
 */
export function log(event: Omit<LogEvent, 'tsMs'>): void {
  const withTimestamp: LogEvent = { ...event, tsMs: Date.now() }
  console.log(JSON.stringify(withTimestamp))
}

