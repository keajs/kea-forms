// TDDO: use the one from Kea directly
import { Logic, Selector } from 'kea'

type SelectorTuple =
  | []
  | [Selector]
  | [Selector, Selector]
  | [Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]
  | [Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector, Selector]

// TDDO: use the one from Kea directly
export type SelectorDefinition<Selectors, SelectorFunction extends any> =
  | [(s: Selectors) => SelectorTuple, SelectorFunction]
  | [(s: Selectors) => SelectorTuple, SelectorFunction, any]

export interface FormInput<LogicType extends Logic> {
  defaults?: Record<string, any>
  validator?:
    | ((formValues: Record<string, any>) => Record<string, any>)
    | SelectorDefinition<LogicType['selectors'], any>
  submit?: (formValues: Record<string, any>) => void | Promise<void>
}
