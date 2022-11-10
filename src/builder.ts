import { FieldName, FormDefinitions, FormInput } from './types'
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
    const forms: FormDefinitions<L> = typeof input === 'function' ? input(logic) : input

    for (const [formKey, formInput] of Object.entries(forms) as [string, FormInput<L>][]) {
      const { showErrorsOnTouch, alwaysShowErrors } = formInput.options || {}
      const capitalizedFormKey = capitalizeFirstLetter(formKey)

      actions({
        [`set${capitalizedFormKey}Value`]: (name: FieldName, value: any) => ({ name, value }),
        [`set${capitalizedFormKey}Values`]: (values: Record<string, any>) => ({ values }),
        [`set${capitalizedFormKey}ManualErrors`]: (errors: Record<string, any>) => ({ errors }),
        // TODO: this should become nested and e.g. forget about deleted array indices
        [`touch${capitalizedFormKey}Field`]: (key: string) => ({ key }),
        [`reset${capitalizedFormKey}`]: (values?: Record<string, any>) => ({ values }),
        [`submit${capitalizedFormKey}`]: true,
        [`submit${capitalizedFormKey}Request`]: (formValues: Record<string, any>) => ({ [formKey]: formValues }),
        [`submit${capitalizedFormKey}Success`]: (formValues: Record<string, any>) => ({ [formKey]: formValues }),
        [`submit${capitalizedFormKey}Failure`]: (error: Error, errors: Record<string, any>) => ({ error, errors }),
      } as any)(logic)

      if (formInput.defaults) {
        defaults({
          [formKey]: formInput.defaults,
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
            values || formInput.defaults || {},
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
            [`set${capitalizedFormKey}ManualErrors`]: () => true,
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
        [`${formKey}ManualErrors`]: [
          {} as Record<string, any>,
          {
            [`reset${capitalizedFormKey}`]: () => ({}),
            [`set${capitalizedFormKey}ManualErrors`]: (_: any, { errors }: { errors: Record<string, any> }) => errors,
            [`touch${capitalizedFormKey}Field`]: (state: Record<string, any>, { key }: { key: string }) => {
              if (key in state) {
                const { [key]: _discard, ...rest } = state
                return rest
              }
              return state
            },
          },
        ],
      })(logic)
      selectors({
        [`${formKey}Touched`]: [
          (s) => [s[`${formKey}Touches`]],
          (touches: Record<string, any>) => Object.keys(touches).length > 0,
        ],
        [`${formKey}ValidationErrors`]: Array.isArray(formInput.errors)
          ? formInput.errors
          : [(s) => [s[formKey]], formInput.errors || (() => ({}))],
        [`${formKey}AllErrors`]: [
          (s) => [s[`${formKey}ValidationErrors`], s[`${formKey}ManualErrors`]],
          (validationErrors: Record<string, any>, manualErrors: Record<string, any>) => ({
            ...validationErrors,
            ...manualErrors,
          }),
        ],
        [`${formKey}HasErrors`]: [
          (s) => [s[`${formKey}AllErrors`]],
          (allErrors: Record<string, any>) => deepTruthy(allErrors),
        ],
        [`${formKey}Errors`]: [
          (s) => [s[`${formKey}AllErrors`], s[`show${capitalizedFormKey}Errors`], s[`${formKey}Touches`]],
          (allErrors: Record<string, any>, showErrors: boolean, touches: Record<string, boolean>) =>
            alwaysShowErrors || showErrors
              ? allErrors
              : showErrorsOnTouch
              ? Object.fromEntries(Object.entries(allErrors).filter(([key]) => touches[key]))
              : {},
        ],
        [`is${capitalizedFormKey}Valid`]: [
          (s) => [s[`${formKey}ValidationErrors`]],
          (errors: Record<string, any>) => !hasErrors(errors),
        ],
      })(logic)
      listeners(({ actions, values }: any) => ({
        [`submit${capitalizedFormKey}`]: async (_: any, breakpoint: any) => {
          if (formInput.preSubmit) {
            await formInput.preSubmit?.(values[formKey], breakpoint)
          }
          const canSubmit = !values[`${formKey}HasErrors`]
          if (canSubmit) {
            actions[`submit${capitalizedFormKey}Request`](values[formKey])
          } else {
            actions[`submit${capitalizedFormKey}Failure`](new Error('Validation Failed'), values.allErrors)
          }
        },
        [`submit${capitalizedFormKey}Request`]: async (
          { [formKey]: formValues }: Record<string, any>,
          breakpoint: BreakPointFunction,
        ) => {
          try {
            const newValues = await formInput.submit?.(formValues, breakpoint)
            actions[`submit${capitalizedFormKey}Success`](typeof newValues !== 'undefined' ? newValues : formValues)
          } catch (error: any) {
            if (!isBreakpoint(error)) {
              actions[`submit${capitalizedFormKey}Failure`](error, values.allErrors)
            }
          }
        },
      }))(logic)
    }
  }
}
