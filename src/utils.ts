import { FieldName, FieldNamePath } from './types'

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function hasErrors(object: any): boolean {
  if (Array.isArray(object)) {
    return object.some(hasErrors)
  } else if (typeof object === 'object' && object !== null) {
    return Object.values(object).some(hasErrors)
  }
  return !!object
}

export function deepAssign(state: any, key: FieldName, value: any): any {
  const path = splitPathKey(key)
  if (path.length === 0 || (path.length === 1 && path[0] === '')) {
    return value
  }
  const [current, ...nextPath] = path
  if (Array.isArray(state)) {
    const currentNumber = typeof current === 'string' ? parseInt(current) : current
    const newArray = [...state]
    if (String(currentNumber) !== 'NaN') {
      newArray[currentNumber] = deepAssign(state?.[currentNumber] ?? {}, nextPath, value)
    }
    return newArray
  }
  if (typeof state === 'object' && state !== null) {
    const currentString = String(current)
    return {
      ...state,
      [currentString]: deepAssign(state?.[currentString] ?? {}, nextPath, value)
    }
  }
  if (typeof state === 'undefined' || (typeof state === 'object' && state === null)) {
    const currentString = String(current)
    return {
      [currentString]: deepAssign(state?.[currentString] ?? {}, nextPath, value)
    }
  }
  return state
}

export function deepTruthy(state: any): boolean {
  if (Array.isArray(state)) {
    return state.some(deepTruthy)
  }
  if (!!state && typeof state === 'object') {
    return Object.values(state).some(deepTruthy)
  }
  return !!state
}

export function pathSelector(path: FieldNamePath, state: any) {
  return [state].concat(path).reduce((v, a) => {
    if (!v) {
      return undefined
    }
    if (typeof v === 'object' && a in v) {
      return v[a]
    } else if (Array.isArray(v) && typeof a === 'string' && parseInt(a) in v) {
      return v[parseInt(a)]
    }
    return undefined
  })
}

export function splitPathKey(key: FieldName): FieldNamePath {
  if (Array .isArray(key)) {
    return key
  }
  if (typeof key === 'number') {
    return [key]
  }
  if (key === '') {
    return []
  }
  return `${key}`.split('.')
}

export function getTouchErrors(errors: Record<string, any>, touches: Record<string, boolean>) {
  const target = {}

  for (const pathStr of Object.keys(touches)) {
    const path = pathStr.split('.')

    let pathIndex = 0
    let sourcePointer = errors
    let targetPointer: any = target

    while (pathIndex < path.length) {
      let pathElem = path[pathIndex]

      if (!targetPointer.hasOwnProperty(pathElem)) {
        // End of path, copy the remainder (may be an object like { key: 'Error message' })
        if (pathIndex === path.length - 1) {
          if (typeof sourcePointer?.[pathElem] === 'undefined') {
            targetPointer[pathElem] = undefined
          } else {
            targetPointer[pathElem] = JSON.parse(JSON.stringify(sourcePointer?.[pathElem]))
          }
        } else if (Array.isArray(sourcePointer?.[pathElem])) {
          targetPointer[pathElem] = []
        } else {
          targetPointer[pathElem] = {}
        }
      }

      targetPointer = targetPointer[pathElem]
      sourcePointer = sourcePointer?.[pathElem]
      pathIndex++
    }
  }

  return target
}
