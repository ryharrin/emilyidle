export const SIM_TICK_MS = 100 as const

// Clamp large frame deltas to avoid runaway catch-up after tab switches/resume.
export const MAX_FRAME_DELTA_MS = 1_000 as const

// Additional guardrail: hard cap work per frame even if accumulator spikes.
export const MAX_SIM_STEPS_PER_FRAME = 10 as const

export const MAX_CURRENCY_CENTS = 999_999_999 as const

export const SAVE_KEY = 'emily-idle:save' as const
export const AUTOSAVE_INTERVAL_MS = 2_000 as const

// Manual Winding mini-game constants (Story 3.1)
export const MANUAL_WINDING = {
  OPTIMAL_HOLD_MS: 2_000,      // 2 seconds
  PERFECT_WINDOW_MS: 200,      // +/- 200ms
  GOOD_WINDOW_MS: 500,         // +/- 500ms
  ROTATION_PER_WIND: 45,       // Degrees per successful wind
  MAX_WINDS_PER_GAME: 3,       // Number of winding attempts per game
} as const

// Automatic Movement mini-game constants (Story 3.2)
export const AUTOMATIC_MOVEMENT = {
  BPM: 80,                     // Target beats per minute
  PERFECT_WINDOW_MS: 100,      // +/- 100ms
  POWER_MAX: 100,
  ROTOR_SPIN_DEGREES: 360,
} as const

// Derived: milliseconds per beat at 80 BPM
export const MS_PER_BEAT = 60_000 / AUTOMATIC_MOVEMENT.BPM

// Quartz Calibration mini-game constants (Story 2.3)
export const QUARTZ_CALIBRATION = {
  PERFECT_THRESHOLD_PX: 10 as const,
  GOOD_THRESHOLD_PX: 25 as const,
  INITIAL_JITTER_PX: 60 as const,
  MIN_JITTER_PX: 15 as const,
  JITTER_DECREMENT_PX: 8 as const,
  TOTAL_ROUNDS: 5 as const,
  ANIMATION_SPEED_HZ: 2.5 as const,
  BASE_ENJOYMENT_PER_PERFECT: 10 as const,
  BASE_CURRENCY_PER_PERFECT_CENTS: 50 as const,
} as const

export const CONSECUTIVE_CONFIG = {
  BASE_MULTIPLIER: 1.0,
  MULTIPLIER_INCREMENT: 0.5,
  MAX_CONSECUTIVE: 10,
  DECAY_INTERVAL_MS: 120_000,
  DECAY_PER_INTERVAL: 1,
} as const
