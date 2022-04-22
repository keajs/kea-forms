import { FieldName, FormDefinitions } from './types'
import {
  BreakPointFunction,
  BuiltLogic,
  isBreakpoint,
  Logic,
  LogicBuilder,
  actions,
  reducers,
  defaults,
  selectors,
  listeners,
} from 'kea'
import { capitalizeFirstLetter, deepAssign, deepTruthy, hasErrors } from './utils'

export function forms<L extends Logic = Logic>(
  input: FormDefinitions<L> | ((logic: BuiltLogic<L>) => FormDefinitions<L>),
): LogicBuilder<L> {
  return (logic) => {
    const forms = typeof input === 'function' ? input(logic) : input

    for (const [formKey, formObject] of Object.entries(forms)) {
      const { showErrorsOnTouch } = formObject.options || {}
      const capitalizedFormKey = capitalizeFirstLetter(formKey)

      actions({
        [`set${capitalizedFormKey}Value`]: (name: FieldName, value: any) => ({ name, value }),
        [`set${capitalizedFormKey}Values`]: (values: Record<string, any>) => ({ values }),
        // TODO: this should become nested and e.g. forget about deleted array indices
        [`touch${capitalizedFormKey}Field`]: (key: string) => ({ key }),
        [`reset${capitalizedFormKey}`]: (values?: Record<string, any>) => ({ values }),
        [`submit${capitalizedFormKey}`]: true,
        [`submit${capitalizedFormKey}Request`]: (formValues: Record<string, any>) => ({ [formKey]: formValues }),
        [`submit${capitalizedFormKey}Success`]: (formValues: Record<string, any>) => ({ [formKey]: formValues }),
        [`submit${capitalizedFormKey}Failure`]: (error: Error) => ({ error }),
      })(logic)

      if (formObject.defaults) {
        defaults({
          [formKey]: formObject.defaults,
        })(logic)
      }

      reducers({
        [formKey]: {
          [`set${capitalizedFormKey}Value`]: (
            state: Record<string, any>,
            { name, value }: { name: FieldName; value: any },
          ) => deepAssign(state, name, value),
          [`set${capitalizedFormKey}Values`]: (
            state: Record<string, any>,
            { values }: { values: Record<string, any> },
          ) => ({ ...state, ...values }),
          [`reset${capitalizedFormKey}`]: (state: Record<string, any>, { values }: { values: Record<string, any> }) =>
            values || formObject.defaults || {},
        },

        [`is${capitalizedFormKey}Submitting`]: [
          false,
          {
            [`reset${capitalizedFormKey}`]: () => false,
            [`submit${capitalizedFormKey}Request`]: () => true,
            [`submit${capitalizedFormKey}Success`]: () => false,
            [`submit${capitalizedFormKey}Failure`]: () => false,
          },
        ],
        [`show${capitalizedFormKey}Errors`]: [
          false,
          {
            [`reset${capitalizedFormKey}`]: () => false,
            [`submit${capitalizedFormKey}`]: () => true,
            [`submit${capitalizedFormKey}Success`]: () => false,
            [`submit${capitalizedFormKey}Failure`]: () => true,
          },
        ],
        [`${formKey}Changed`]: [
          false,
          {
            [`reset${capitalizedFormKey}`]: () => false,
            [`set${capitalizedFormKey}Value`]: () => true,
            [`set${capitalizedFormKey}Values`]: () => true,
          },
        ],
        [`${formKey}Touches`]: [
          {} as Record<string, boolean>,
          {
            [`reset${capitalizedFormKey}`]: () => ({}),
            [`touch${capitalizedFormKey}Field`]: (state: Record<string, boolean>, { key }: { key: string }) =>
              key in state ? state : { ...state, [key]: true },
          },
        ],
      })(logic)
      selectors({
        [`${formKey}Touched`]: [
          (s) => [s[`${formKey}Touches`]],
          (touches: Record<string, any>) => Object.keys(touches).length > 0,
        ],
        [`${formKey}ValidationErrors`]: Array.isArray(formObject.errors)
          ? formObject.errors
          : [(s) => [s[formKey]], formObject.errors || (() => ({}))],
        [`${formKey}HasErrors`]: [
          (s) => [s[`${formKey}ValidationErrors`]],
          (validationErrors: Record<string, any>) => deepTruthy(validationErrors),
        ],
        [`${formKey}Errors`]: [
          (s) => [s[`${formKey}ValidationErrors`], s[`show${capitalizedFormKey}Errors`], s[`${formKey}Touches`]],
          (errors: Record<string, any>, showErrors: boolean, touches: Record<string, boolean>) =>
            showErrors
              ? errors
              : showErrorsOnTouch
              ? Object.fromEntries(Object.entries(errors).filter(([key]) => touches[key]))
              : {},
        ],
        [`is${capitalizedFormKey}Valid`]: [
          (s) => [s[`${formKey}ValidationErrors`]],
          (errors: Record<string, any>) => !hasErrors(errors),
        ],
      })(logic)
      listeners(({ actions, values }) => ({
        [`submit${capitalizedFormKey}`]: () => {
          const canSubmit = !values[`${formKey}HasErrors`]
          if (canSubmit) {
            actions[`submit${capitalizedFormKey}Request`](values[formKey])
          } else {
            actions[`submit${capitalizedFormKey}Failure`](new Error('Validation error'))
          }
        },
        [`submit${capitalizedFormKey}Request`]: async (
          { [formKey]: formValues }: Record<string, any>,
          breakpoint: BreakPointFunction,
        ) => {
          try {
            const newValues = await formObject.submit?.(formValues, breakpoint)
            actions[`submit${capitalizedFormKey}Success`](typeof newValues !== 'undefined' ? newValues : formValues)
          } catch (error: any) {
            if (!isBreakpoint(error)) {
              actions[`submit${capitalizedFormKey}Failure`](error)
            }
          }
        },
      }))(logic)
    }
  }
}
