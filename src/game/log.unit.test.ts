import { describe, expect, it, vi } from 'vitest'
import { log } from './log'

describe('log', () => {
  it('logs a single JSON object with required keys and tsMs', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(123)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    log({ level: 'INFO', scope: 'unit', msg: 'hello', data: { a: 1 } })

    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(expect.any(String))

    const raw = logSpy.mock.calls[0]?.[0]
    const parsed = JSON.parse(String(raw)) as Record<string, unknown>

    expect(parsed).toMatchObject({
      level: 'INFO',
      scope: 'unit',
      msg: 'hello',
      tsMs: 123,
    })
    expect(parsed).toHaveProperty('data')

    logSpy.mockRestore()
    nowSpy.mockRestore()
  })
})
