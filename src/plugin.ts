import { BreakPointFunction, KeaPlugin, Logic } from 'kea'
import { FormInput } from './types'
import { capitalizeFirstLetter, hasErrors } from './utils'

export const formsPlugin = (): KeaPlugin => {
  return {
    name: 'forms',

    defaults: () => ({
      forms: undefined,
    }),

    buildSteps: {
      forms(logic, input) {
        if (!input.forms) {
          return
        }
        const forms = typeof input.forms === 'function' ? input.forms(logic) : input.forms

        Object.entries(forms as Record<string, FormInput<Logic>>).forEach(([formKey, formObject]) => {
          const { showErrorsOnTouch } = formObject.options || {}
          const capitalizedFormKey = capitalizeFirstLetter(formKey)

          logic.extend({
            actions: {
              [`set${capitalizedFormKey}Value`]: (key: string, value: any) => ({ values: { [key]: value } }),
              [`set${capitalizedFormKey}Values`]: (values: Record<string, any>) => ({ values }),
              [`touch${capitalizedFormKey}Field`]: (key: string) => ({ key }),
              [`reset${capitalizedFormKey}`]: (values?: Record<string, any>) => ({ values }),
              [`submit${capitalizedFormKey}`]: true,
              [`submit${capitalizedFormKey}Request`]: (formValues: Record<string, any>) => ({ [formKey]: formValues }),
              [`submit${capitalizedFormKey}Success`]: (formValues: Record<string, any>) => ({ [formKey]: formValues }),
              [`submit${capitalizedFormKey}Failure`]: (error: Error) => ({ error }),
            },
            reducers: {
              [formKey]: [
                formObject.defaults || {},
                {
                  [`set${capitalizedFormKey}Value`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => ({ ...state, ...values }),
                  [`set${capitalizedFormKey}Values`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => ({ ...state, ...values }),
                  [`reset${capitalizedFormKey}`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => values || formObject.defaults || {},
                },
              ],
              [`${formKey}Changes`]: [
                {},
                {
                  [`set${capitalizedFormKey}Value`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => ({ ...state, ...values }),
                  [`set${capitalizedFormKey}Values`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => ({ ...state, ...values }),
                  [`reset${capitalizedFormKey}`]: () => {},
                },
              ],
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
              [`${formKey}Touches`]: [
                {} as Record<string, boolean>,
                {
                  [`reset${capitalizedFormKey}`]: () => ({}),
                  [`touch${capitalizedFormKey}Field`]: (state: Record<string, boolean>, { key }: { key: string }) =>
                    key in state ? state : { ...state, [key]: true },
                },
              ],
            },
            selectors: {
              [`${formKey}Changed`]: [
                (s) => [s[`${formKey}Changes`]],
                (changes: Record<string, any>) => Object.keys(changes).length > 0,
              ],
              [`${formKey}Touched`]: [
                (s) => [s[`${formKey}Touches`]],
                (touches: Record<string, any>) => Object.keys(touches).length > 0,
              ],
              [`${formKey}ValidationErrors`]: Array.isArray(formObject.validator)
                ? formObject.validator
                : [(s) => [s[formKey]], formObject.validator || (() => ({}))],
              [`${formKey}HasErrors`]: [
                (s) => [s[`${formKey}ValidationErrors`]],
                (validationErrors: Record<string, any>) => !!Object.values(validationErrors).find((a) => !!a),
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
            },
            listeners: ({ actions, values }) => ({
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
                  await formObject.submit?.(formValues, breakpoint)
                  actions[`submit${capitalizedFormKey}Success`](formValues)
                } catch (error) {
                  actions[`submit${capitalizedFormKey}Failure`](error)
                }
              },
            }),
          })
        })
      },
    },

    buildOrder: {
      forms: { after: 'defaults' },
    },
  }
}
