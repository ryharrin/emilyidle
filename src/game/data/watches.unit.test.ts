import { describe, expect, it } from 'vitest'
import { WATCH_CATALOG, getWatchById, isAwardedWatch } from './watches'

describe('WATCH_CATALOG', () => {
  it('contains at least 10 quartz watches (Chapter 1 starter set)', () => {
    const quartz = WATCH_CATALOG.filter((w) => w.tier === 'quartz')
    expect(quartz.length).toBeGreaterThanOrEqual(10)
  })

  it('has required fields for each watch', () => {
    for (const w of WATCH_CATALOG) {
      expect(typeof w.id).toBe('string')
      expect(w.id.length).toBeGreaterThan(0)
      expect(typeof w.name).toBe('string')
      expect(typeof w.priceCents).toBe('number')
      expect(typeof w.tier).toBe('string')
      expect(typeof w.imageUrl).toBe('string')
      expect(typeof w.enjoymentRate).toBe('number')
      expect(typeof w.isFavorite).toBe('boolean')
    }
  })
})

describe('JLC Milestone Watch', () => {
  it('includes JLC Master Ultra Thin Moon in catalog', () => {
    const jlc = getWatchById('jlc-master-ultra-thin-moon')
    expect(jlc).not.toBeNull()
  })

  it('JLC watch is marked as awarded (not purchasable)', () => {
    const jlc = getWatchById('jlc-master-ultra-thin-moon')
    expect(jlc).not.toBeNull()
    expect(jlc!.isAwarded).toBe(true)
  })

  it('JLC watch has correct properties', () => {
    const jlc = getWatchById('jlc-master-ultra-thin-moon')
    expect(jlc).not.toBeNull()
    expect(jlc!.name).toBe('Jaeger-LeCoultre Master Ultra Thin Moon')
    expect(jlc!.size).toBe('34mm')
    expect(jlc!.material).toBe('rose gold')
    expect(jlc!.complication).toBe('moon phase')
  })

  it('isAwardedWatch returns true for awarded watches', () => {
    const jlc = getWatchById('jlc-master-ultra-thin-moon')
    expect(jlc).not.toBeNull()
    expect(isAwardedWatch(jlc!.id)).toBe(true)
  })

  it('isAwardedWatch returns false for regular watches', () => {
    expect(isAwardedWatch('cartier-tank-quartz')).toBe(false)
  })
})

