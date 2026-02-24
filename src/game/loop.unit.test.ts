import { describe, expect, it } from 'vitest'
import { accumulateSimTicks } from './loop'
import { MAX_FRAME_DELTA_MS, SIM_TICK_MS } from './constants'

describe('accumulateSimTicks', () => {
  it('accumulates delta time and yields fixed-size ticks', () => {
    const a = accumulateSimTicks(0, SIM_TICK_MS - 10)
    expect(a.ticks).toBe(0)
    expect(a.accumulatorMs).toBe(SIM_TICK_MS - 10)

    const b = accumulateSimTicks(a.accumulatorMs, 20)
    expect(b.ticks).toBe(1)
    expect(b.accumulatorMs).toBe(10)
  })

  it('clamps large deltas to avoid runaway catch-up', () => {
    const { ticks, accumulatorMs } = accumulateSimTicks(0, 30_000)
    // 30s delta should be clamped to MAX_FRAME_DELTA_MS, yielding at most that many 100ms ticks.
    expect(ticks).toBe(Math.floor(MAX_FRAME_DELTA_MS / SIM_TICK_MS))
    expect(accumulatorMs).toBe(MAX_FRAME_DELTA_MS % SIM_TICK_MS)
  })
})

