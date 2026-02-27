/**
 * Animated Number Component
 * Smoothly animates number changes with counting effect
 * Used for currency, XP, and other numeric displays
 */

import { useEffect, useState, useRef } from 'react'
import { motion, useSpring } from 'motion/react'
import './animatedNumber.css'

interface AnimatedNumberProps {
  value: number
  duration?: number // Animation duration in ms, default 800
  formatter?: (value: number) => string
  className?: string
}

/**
 * Formats a number as currency (e.g., 10000 -> "100.00")
 */
function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2)
}

/**
 * Formats a number as whole number (e.g., 1000 -> "1,000")
 */
function formatWholeNumber(value: number): string {
  return Math.round(value).toLocaleString()
}

/**
 * Animated Number Component
 * Animates smoothly between values using spring physics
 */
export function AnimatedNumber({
  value,
  duration = 800,
  formatter = formatWholeNumber,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValueRef = useRef(value)
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    duration: duration / 1000,
  })

  useEffect(() => {
    if (value !== previousValueRef.current) {
      spring.set(value)
      previousValueRef.current = value
    }
  }, [value, spring])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [spring])

  return (
    <motion.span
      className={`animated-number ${className}`}
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {formatter(displayValue)}
    </motion.span>
  )
}

/**
 * Currency display with animated value
 */
export function AnimatedCurrency({
  cents,
  duration = 800,
  className = '',
}: {
  cents: number
  duration?: number
  className?: string
}) {
  return (
    <span className={`currency-display ${className}`}>
      $<AnimatedNumber value={cents} duration={duration} formatter={formatCurrency} />
    </span>
  )
}

/**
 * XP display with animated value
 */
export function AnimatedXP({
  xp,
  duration = 600,
  className = '',
}: {
  xp: number
  duration?: number
  className?: string
}) {
  return (
    <span className={`xp-display ${className}`}>
      <AnimatedNumber value={xp} duration={duration} formatter={formatWholeNumber} /> XP
    </span>
  )
}

/**
 * Number change indicator - shows +XX or -XX when value changes
 */
export function NumberChangeIndicator({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const [indicator, setIndicator] = useState<{ value: number; key: number } | null>(null)
  const previousValueRef = useRef(value)

  useEffect(() => {
    const diff = value - previousValueRef.current
    if (diff !== 0) {
      setIndicator({ value: diff, key: Date.now() })
    }
    previousValueRef.current = value
  }, [value])

  if (!indicator) return null

  const isPositive = indicator.value > 0
  const displayValue = isPositive ? `+${indicator.value}` : `${indicator.value}`

  return (
    <motion.span
      key={indicator.key}
      className={`number-change-indicator ${isPositive ? 'positive' : 'negative'} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: -20 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {displayValue}
    </motion.span>
  )
}
