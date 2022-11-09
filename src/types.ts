// TDDO: use the one from Kea directly
import { BreakPointFunction, Logic, LogicPropSelectors, SelectorDefinition } from 'kea'

export interface FormOptions {
  showErrorsOnTouch: boolean
}

export interface FormInput<L extends Logic, T extends Record<string, any> = Record<string, any>> {
  defaults?: T
  errors?:
    | ((formValues: T) => DeepPartialMap<T, ValidationErrorType>)
    | SelectorDefinition<L['selectors'], LogicPropSelectors<L>, any>
  preSubmit?: (formValues: T, breakpoint: BreakPointFunction) => void | Promise<void> | T | Promise<T>
  submit?: (formValues: T, breakpoint: BreakPointFunction) => void | Promise<void> | T | Promise<T>
  options?: Partial<FormOptions>
}

export type FormDefinitions<L extends Logic> = L['values'] extends Record<string, any>
  ? Partial<
      {
        [K in keyof L['values']]: FormInput<L, L['values'][K]>
      }
    >
  : Record<string, FormInput<L>>

export type FieldNameType = string | number
export type FieldNamePath = FieldNameType[]
export type FieldName = FieldNameType | FieldNamePath

export type ValidationErrorType = string | boolean | undefined | null

// https://stackoverflow.com/a/61233706
type NonAny = number | boolean | string | symbol | null
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends NonAny[] // checks for nested any[]
    ? T[P]
    : T[P] extends ReadonlyArray<NonAny> // checks for nested ReadonlyArray<any>
    ? T[P]
    : T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends Set<infer V> // checks for Sets
    ? Set<DeepPartial<V>>
    : T[P] extends Map<infer K, infer V> // checks for Maps
    ? Map<K, DeepPartial<V>>
    : T[P] extends NonAny // checks for primative values
    ? T[P]
    : DeepPartial<T[P]> // recurse for all non-array and non-primative values
}

export type DeepPartialMap<T, F> = {
  [P in keyof T]?: T[P] extends NonAny[] // checks for nested any[]
    ? T[P]
    : T[P] extends ReadonlyArray<NonAny> // checks for nested ReadonlyArray<any>
    ? T[P]
    : T[P] extends (infer U)[]
    ? DeepPartialMap<U, F>[]
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartialMap<U, F>>
    : T[P] extends Set<infer V> // checks for Sets
    ? Set<DeepPartialMap<V, F>>
    : T[P] extends Map<infer K, infer V> // checks for Maps
    ? Map<K, DeepPartialMap<V, F>>
    : T[P] extends NonAny // checks for primative values
    ? F
    : DeepPartialMap<T[P], F> // recurse for all non-array and non-primative values
}
