/**
 * Fade In Component
 * Smooth fade-in animation wrapper for content
 * Used for tab transitions and content reveals
 */

import { motion, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'
import './fadeIn.css'

interface FadeInProps {
  children: ReactNode
  delay?: number // Delay in seconds
  duration?: number // Duration in seconds
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number // Distance to slide in pixels
}

/**
 * Fade In wrapper component
 * Animates children with fade and optional slide effect
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  className = '',
  direction = 'up',
  distance = 20,
}: FadeInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance }
      case 'down':
        return { y: -distance }
      case 'left':
        return { x: distance }
      case 'right':
        return { x: -distance }
      case 'none':
      default:
        return {}
    }
  }

  return (
    <motion.div
      className={`fade-in ${className}`}
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1], // Material ease-out
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number // Delay between children in seconds
  className?: string
}

/**
 * Stagger Container
 * Animates children with staggered fade-in effect
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      className={`stagger-container ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

/**
 * Stagger Item
 * Child component for StaggerContainer
 */
export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      className={`stagger-item ${className}`}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface TabTransitionProps {
  children: ReactNode
  tabKey: string | number
  className?: string
}

/**
 * Tab Transition
 * Smooth crossfade between tab contents
 */
export function TabTransition({
  children,
  tabKey,
  className = '',
}: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        className={`tab-transition ${className}`}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  circle?: boolean
}

/**
 * Skeleton Loader
 * Loading placeholder with subtle animation
 */
export function Skeleton({
  className = '',
  width = '100%',
  height = '1rem',
  circle = false,
}: SkeletonProps) {
  return (
    <motion.div
      className={`skeleton ${circle ? 'circle' : ''} ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
