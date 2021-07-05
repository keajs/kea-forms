/* global test, expect, beforeEach */
import { resetContext, kea } from 'kea'
import { hasErrors } from '../utils'

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

describe('utils', () => {
  test('hasErrors', async () => {
    expect(hasErrors({ key: 'please enter value' })).toBe(true)
    expect(hasErrors({ key: undefined })).toBe(false)
    expect(hasErrors({ key: undefined, otherKey: true })).toBe(true)
    expect(hasErrors({ key: undefined, otherKey: 'error' })).toBe(true)
    expect(hasErrors({ key: undefined, otherKey: false })).toBe(false)

    expect(hasErrors({ key: {}, otherKey: false })).toBe(false)
    expect(hasErrors({ key: { anotherKey: false }, otherKey: false })).toBe(false)
    expect(hasErrors({ key: { anotherKey: true }, otherKey: false })).toBe(true)

    expect(hasErrors({ key: [], otherKey: false })).toBe(false)
    expect(hasErrors({ key: [{ anotherKey: false }], otherKey: false })).toBe(false)
    expect(hasErrors({ key: [{ anotherKey: false }, { bla: 'ha' }], otherKey: false })).toBe(true)
    expect(hasErrors({ key: [{ anotherKey: true }], otherKey: false })).toBe(true)
  })
})
