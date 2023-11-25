// TDDO: use the one from Kea directly
import { BreakPointFunction, BuiltLogic, Logic, LogicPropSelectors, SelectorDefinition, MakeLogicType } from 'kea'

export type MakeFormLogicType<
  TForms extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>,
  TValues extends Record<string, unknown> = Record<string, unknown>,
  TActions = Record<string, AnyFunction>,
  TProps = Record<string, unknown>,
> = MakeLogicType<TValues & FormValues<TForms>, TActions & FormActions<TForms>, TProps>

export type FormValues<
  TFormData extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>,
> = {
  [K in keyof TFormData]: K extends string ? SingleFormValues<K, TFormData[K]> : never
}

type SingleFormValues<
  TFormName extends string,
  TFormData extends Pick<FormInput<Logic>, 'defaults'> = Pick<FormInput<Logic>, 'defaults'>,
> = ObjectEntries<InterpolatedFormValueTuples<TFormName, TFormData>>

type InterpolatedFormValueTuples<
  TFormName extends string,
  TFormData extends Pick<FormInput<Logic>, 'defaults'> = Pick<FormInput<Logic>, 'defaults'>,
> = [
  [TFormName, TFormData],
  [`${TFormName}Changes`, DeepPartial<TFormData>],
  [`${TFormName}Touches`, DeepPartialMap<TFormData, boolean>],
  [`is${PascalCase<TFormName>}Submitting`, boolean],
  [`show${PascalCase<TFormName>}Errors`, boolean],
  [`${TFormName}Changed`, boolean],
  [`${TFormName}Touched`, boolean],
  [`${TFormName}ValidationErrors`, DeepPartialMap<TFormData, ValidationErrorType>],
  [`${TFormName}HasErrors`, boolean],
  [`${TFormName}Errors`, DeepPartialMap<TFormData, ValidationErrorType>],
  [`is${PascalCase<TFormName>}Valid`, boolean],
]

export type FormActions<
  TFormData extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>,
> = {
  [K in keyof TFormData]: K extends string ? SingleFormActions<K, TFormData[K]> : never
}

type SingleFormActions<
  TFormName extends string,
  TFormData extends Pick<FormInput<Logic>, 'defaults'> = Pick<FormInput<Logic>, 'defaults'>,
> = ObjectEntries<InterpolatedFormValueTuples<TFormName, TFormData>>

type InterpolatedFormActionTuples<
  TFormName extends string,
  TFormData extends Pick<FormInput<Logic>, 'defaults'> = Pick<FormInput<Logic>, 'defaults'>,
> = [
  [`set${PascalCase<TFormName>}Value`, (key: keyof TFormData, value: any) => void],
  [`set${PascalCase<TFormName>}Values`, (values: Partial<TFormData>) => void],
  [`touch${PascalCase<TFormName>}Field`, (key: keyof TFormData) => void],
  [`reset${PascalCase<TFormName>}`, (values?: TFormData) => void],
  [`submit${PascalCase<TFormName>}`, () => void],
  [`submit${PascalCase<TFormName>}Request`, (formData: TFormData) => void],
  [`submit${PascalCase<TFormName>}Success`, (formData: TFormData) => void],
  [`submit${PascalCase<TFormName>}Failure`, (error: Error) => void],
]

export type AnyFunction = (...args: any) => any

type ObjectEntries<T extends [string, ...unknown[]][]> = { [K in T[number] as K[0]]: K[1] }

type PascalCase<T extends string> = T extends `${infer FirstChar}${infer Rest}`
  ? `${Capitalize<FirstChar>}${Rest}`
  : never

export interface FormOptions {
  showErrorsOnTouch: boolean
  alwaysShowErrors: boolean
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
