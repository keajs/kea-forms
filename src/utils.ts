import { FieldName, FieldNamePath } from './types'

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function hasErrors(object: any): boolean {
  if (Array.isArray(object)) {
    return object.some(hasErrors)
  } else if (typeof object === 'object') {
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
    return state.map((element, index) => (index === currentNumber ? deepAssign(element, nextPath, value) : element))
  }
  if (typeof state === 'object') {
    const currentString = typeof current !== 'string' ? current.toString() : current
    return {
      ...state,
      [currentString]: deepAssign(state[currentString], nextPath, value),
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
  if (Array.isArray(key)) {
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
