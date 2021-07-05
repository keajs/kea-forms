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
