/**
 * Simple memoized selector utility
 * Creates selectors that only recompute when inputs change
 */

type Selector<State, Result> = (state: State) => Result

/**
 * Creates a memoized selector
 * @param inputSelectors - Array of input selectors
 * @param combiner - Function that combines input values
 * @returns Memoized selector
 */
export function createSelector<State, Result>(
  inputSelectors: Array<Selector<State, unknown>>,
  combiner: (...args: unknown[]) => Result,
): Selector<State, Result> {
  let lastInputs: unknown[] | undefined
  let lastResult: Result

  return (state: State): Result => {
    const currentInputs = inputSelectors.map((selector) => selector(state))

    // Check if inputs have changed
    const hasChanged = lastInputs === undefined ||
      currentInputs.length !== lastInputs.length ||
      currentInputs.some((val, idx) => val !== lastInputs![idx])

    if (hasChanged) {
      lastInputs = currentInputs
      lastResult = combiner(...currentInputs)
    }

    return lastResult
  }
}

/**
 * Creates a shallow equality comparator for objects
 * Useful for comparing object references in selectors
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (a === null || b === null) return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  return keysA.every((key) => (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key])
}

/**
 * Creates a weak memoized selector that uses WeakMap
 * Useful for selectors with object keys
 */
export function createWeakSelector<Key extends object, Args extends unknown[], Result>(
  keySelector: (...args: Args) => Key,
  compute: (...args: Args) => Result,
): (...args: Args) => Result {
  const cache = new WeakMap<Key, Result>()

  return (...args: Args): Result => {
    const key = keySelector(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = compute(...args)
    cache.set(key, result)
    return result
  }
}
