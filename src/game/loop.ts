import { MAX_FRAME_DELTA_MS, MAX_SIM_STEPS_PER_FRAME, SIM_TICK_MS } from './constants'

export type TickSchedule = {
  accumulatorMs: number
  ticks: number
}

export function accumulateSimTicks(
  prevAccumulatorMs: number,
  frameDeltaMs: number,
): TickSchedule {
  const clampedDeltaMs = Math.min(frameDeltaMs, MAX_FRAME_DELTA_MS)
  const accumulatorMs = prevAccumulatorMs + clampedDeltaMs
  const ticks = Math.min(
    Math.floor(accumulatorMs / SIM_TICK_MS),
    MAX_SIM_STEPS_PER_FRAME,
  )
  return { accumulatorMs: accumulatorMs - ticks * SIM_TICK_MS, ticks }
}

