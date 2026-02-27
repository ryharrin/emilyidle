import { describe, it, expect, vi } from 'vitest'
import { createSelector, shallowEqual, createWeakSelector } from './createSelector'

describe('createSelector', () => {
  interface TestState {
    count: number
    items: string[]
    nested: { value: number }
  }

  const initialState: TestState = {
    count: 5,
    items: ['a', 'b', 'c'],
    nested: { value: 10 },
  }

  it('should compute result from input selectors', () => {
    const getCount = (state: TestState) => state.count
    const getItems = (state: TestState) => state.items

    const selectTotal = createSelector<TestState, number>(
      [getCount, getItems],
      (count, items) => (count as number) + (items as string[]).length,
    )

    expect(selectTotal(initialState)).toBe(8) // 5 + 3
  })

  it('should memoize results when inputs unchanged', () => {
    const getCount = (state: TestState) => state.count
    const combiner = vi.fn((count: unknown) => count)

    const selector = createSelector([getCount], combiner)

    // First call
    selector(initialState)
    expect(combiner).toHaveBeenCalledTimes(1)

    // Second call with same state - should not recompute
    selector(initialState)
    expect(combiner).toHaveBeenCalledTimes(1)

    // Third call with different count - should recompute
    selector({ ...initialState, count: 10 })
    expect(combiner).toHaveBeenCalledTimes(2)
  })

  it('should handle multiple input selectors', () => {
    const getCount = (state: TestState) => state.count
    const getItems = (state: TestState) => state.items
    const getNested = (state: TestState) => state.nested

    const selector = createSelector<TestState, { total: number; summary: string }>(
      [getCount, getItems, getNested],
      (count, items, nested) => ({
        total: (count as number) + (items as string[]).length + (nested as { value: number }).value,
        summary: `${count as number} count, ${(items as string[]).length} items`,
      }),
    )

    const result = selector(initialState)
    expect(result.total).toBe(18) // 5 + 3 + 10
    expect(result.summary).toBe('5 count, 3 items')
  })

  it('should handle array reference equality', () => {
    const getItems = (state: TestState) => state.items

    const selector = createSelector<TestState, number>([getItems], (items) => (items as string[]).length)

    const state1: TestState = { ...initialState, items: ['a', 'b'] }
    const state2: TestState = { ...initialState, items: ['a', 'b'] }

    // Same array reference - memoized
    selector(state1)
    const combiner = vi.fn((items: unknown) => (items as string[]).length)
    const memoizedSelector = createSelector<TestState, number>([getItems], combiner)

    memoizedSelector(state1)
    expect(combiner).toHaveBeenCalledTimes(1)

    // Different array with same values - will recompute (by design)
    memoizedSelector(state2)
    expect(combiner).toHaveBeenCalledTimes(2)
  })
})

describe('shallowEqual', () => {
  it('should return true for same references', () => {
    const obj = { a: 1, b: 2 }
    expect(shallowEqual(obj, obj)).toBe(true)
  })

  it('should return true for shallow equal objects', () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
  })

  it('should return false for different values', () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false)
  })

  it('should return false for different key counts', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it('should handle null values', () => {
    expect(shallowEqual(null, null)).toBe(true)
    expect(shallowEqual(null, { a: 1 })).toBe(false)
    expect(shallowEqual({ a: 1 }, null)).toBe(false)
  })

  it('should handle primitives', () => {
    expect(shallowEqual(1, 1)).toBe(true)
    expect(shallowEqual('hello', 'hello')).toBe(true)
    expect(shallowEqual(1, 2)).toBe(false)
  })
})

describe('createWeakSelector', () => {
  it('should memoize based on object key', () => {
    interface Key { id: number }
    const compute = vi.fn((key: Key, multiplier: number) => key.id * multiplier)

    const selector = createWeakSelector<Key, [Key, number], number>(
      (key) => key,
      compute,
    )

    const key1 = { id: 5 }
    const key2 = { id: 5 }

    selector(key1, 2)
    expect(compute).toHaveBeenCalledTimes(1)

    // Same key object - should use cache
    selector(key1, 2)
    expect(compute).toHaveBeenCalledTimes(1)

    // Different key object - should recompute
    selector(key2, 2)
    expect(compute).toHaveBeenCalledTimes(2)
  })
})
