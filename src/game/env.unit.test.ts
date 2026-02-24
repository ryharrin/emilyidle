import { describe, expect, it } from 'vitest'
import { isTestEnvironment } from './env'

describe('isTestEnvironment', () => {
  it('is true under vitest', () => {
    expect(isTestEnvironment()).toBe(true)
  })
})

