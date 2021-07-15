/* global test, expect, beforeEach */
import { deepAssign, hasErrors, pathSelector, splitPathKey } from '../utils'

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
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.x.y', 234)).toEqual({ a: { b: { c: 123 } } })
    expect(deepAssign({ a: { b: { c: 123 } } }, 'a.x.y'.split('.'), 234)).toEqual({ a: { b: { c: 123 } } })
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
    expect(deepAssign({ a: { b: [{ c: 123 }, { c: 234 }] } }, 'a.b.100', 444)).toEqual({
      a: { b: [{ c: 123 }, { c: 234 }] },
    })

    expect(deepAssign([{ c: 123 }, { c: 234 }], '1', 444)).toEqual([{ c: 123 }, 444])
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
})
