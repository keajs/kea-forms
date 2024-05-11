/* global test, expect, beforeEach */
import { deepAssign, deepTruthy, hasErrors, pathSelector, splitPathKey, getTouchErrors } from '../utils'

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

  test('deepAssign', () => {
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.b.c', 234)).toEqual({ a: { b: { c: 234 } } })
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.b.c'.split('.'), 234)).toEqual({ a: { b: { c: 234 } } })
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.b', 234)).toEqual({ a: { b: 234 } })
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.b'.split('.'), 234)).toEqual({ a: { b: 234 } })
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.x.y', 234)).toEqual({ a: { b: { c: 123 }, x: { y: 234 } } })
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.x.y'.split('.'), 234)).toEqual({ a: { b: { c: 123 }, x: { y: 234 } } })
    expect(deepAssign({ a: { b: { c: 123 } } }, '', 234)).toEqual(234)
    expect(deepAssign({ a: { b: { c: 123 } } }, [], 234)).toEqual(234)
    expect(deepAssign({ a: { b: { c: 123 } } }, [''], 234)).toEqual(234)

    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, ['a', 'b', 0], 444)).toEqual({
      a: { b: [444, { c: 234 }] },
    })
    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, ['a', 'b', 1, 'c'], 444)).toEqual({
      a: { b: [{ c: 123 }, { c: 444 }] },
    })

    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, 'a.b.0', 444)).toEqual({ a: { b: [444, { c: 234 }] } })
    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, 'a.b.1.c', 444)).toEqual({
      a: { b: [{ c: 123 }, { c: 444 }] },
    })

    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, 'a.b.bla', 444)).toEqual({
      a: { b: [{ c: 123 }, { c: 234 }] },
    })
    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, 'a.b.4', 444)).toEqual({
      a: { b: [{ c: 123 }, { c: 234 }, undefined, undefined, 444] },
    })

    expect(deepAssign([{ c: 123 }, { c: 234 }], '1', 444)).toEqual([{ c: 123 }, 444])

    expect(deepAssign([{ c: 123 }], '1.b.y.c', 444)).toEqual([{ c: 123 }, { b: { y: { c: 444 } } }])
  })

  test('deepTruthy', () => {
    expect(deepTruthy(true)).toBe(true)
    expect(deepTruthy(false)).toBe(false)
    expect(deepTruthy(null)).toBe(false)
    expect(deepTruthy('')).toBe(false)
    expect(deepTruthy(undefined)).toBe(false)
    expect(deepTruthy(123)).toBe(true)
    expect(deepTruthy('123')).toBe(true)
    expect(deepTruthy({ a: false })).toBe(false)
    expect(deepTruthy({ a: true })).toBe(true)
    expect(deepTruthy({ a: false, b: true })).toBe(true)
    expect(deepTruthy({ a: false, b: 'string' })).toBe(true)
    expect(deepTruthy({ a: false, b: null })).toBe(false)
    expect(deepTruthy({ a: false, b: { c: false } })).toBe(false)
    expect(deepTruthy({ a: false, b: { c: false, d: true } })).toBe(true)
    expect(deepTruthy({ a: false, b: [] })).toBe(false)
    expect(deepTruthy({ a: false, b: [{ a: true }] })).toBe(true)
    expect(deepTruthy({ a: false, b: [{ a: false }, [{ b: false }]] })).toBe(false)
    expect(deepTruthy({ a: false, b: [{ a: false }, [{ b: true }]] })).toBe(true)
  })

  test('pathSelector', () => {
    expect(pathSelector([], [1, 2, 3])).toEqual([1, 2, 3])
    expect(pathSelector([1, 2], [1, 2, 3])).toEqual(undefined)
    expect(pathSelector([1, 2], [1, [1, 2, 3, 4], 3])).toEqual(3)
    expect(pathSelector(['1', '2'], [1, 2, 3])).toEqual(undefined)
    expect(pathSelector(['1', '2'], [1, [1, 2, 3, 4], 3])).toEqual(3)
    expect(pathSelector([1, 2], { 1: { 2: 3 } })).toEqual(3)
    expect(pathSelector(['1', '2'], { 1: { 2: 3 } })).toEqual(3)
    expect(pathSelector(['a', 'b', '2'], { a: { b: [1, 2, 3] } })).toEqual(3)
    expect(pathSelector(['a', 'b', '2'], { a: { b: undefined } })).toEqual(undefined)
  })

  test('splitPathKey', () => {
    expect(splitPathKey([])).toEqual([])
    expect(splitPathKey([1, '2', 3])).toEqual([1, '2', 3])
    expect(splitPathKey('')).toEqual([])
    expect(splitPathKey(3)).toEqual([3])
    expect(splitPathKey('1.2.3')).toEqual(['1', '2', '3'])
    expect(splitPathKey('a.b.3')).toEqual(['a', 'b', '3'])
  })

  test('getTouchErrors', () => {
    let allErrors = {
      name: 'You have to enter a name',
      description: 'You have to enter a description',
      params: {
        feature_flag_variants: [{ key: 'Variant 1 error message' }, { key: 'Variant 2 error message' }],
      },
    }
    let touches = {
      name: true,
      'params.feature_flag_variants.0': true,
    }
    let expectedTouchErrors = {
      name: 'You have to enter a name',
      params: {
        feature_flag_variants: [{ key: 'Variant 1 error message' }],
      },
    }
    expect(getTouchErrors(allErrors, touches)).toEqual(expectedTouchErrors)

    allErrors = {
      level0: {
        level1: {
          level2a: 'You have to enter a name',
          level2b: [
            { key: 'Nested error message 0' },
            { key: 'Nested error message 1' },
            { key: 'Nested error message 2' },
          ],
        },
      },
    }
    touches = {
      'level0.level1.level2a': true,
      'level0.level1.level2b.2': true,
    }
    expectedTouchErrors = {
      level0: {
        level1: {
          level2a: 'You have to enter a name',
          level2b: [undefined, undefined, { key: 'Nested error message 2' }],
        },
      },
    }
    expect(getTouchErrors(allErrors, touches)).toEqual(expectedTouchErrors)

    allErrors = {
      name: 'You have to enter a name',
      description: undefined,
      params: {
        feature_flag_variants: [{ key: undefined }, { key: 'Variant 2 error message' }],
      },
    }
    touches = {
      name: true,
      description: true,
      'params.feature_flag_variants.0': true,
      'params.feature_flag_variants.1': true,
    }
    expectedTouchErrors = {
      name: 'You have to enter a name',
      description: undefined,
      params: {
        feature_flag_variants: [{ key: undefined }, { key: 'Variant 2 error message' }],
      },
    }
    expect(getTouchErrors(allErrors, touches)).toEqual(expectedTouchErrors)
  })
})
