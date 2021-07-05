import { BuiltLogic, isBreakpoint, KeaPlugin, ListenerFunction, Logic, Selector } from 'kea'
import { FormInput } from './types'
import { capitalizeFirstLetter } from './utils'

// actions:
// - submitPluginDrawer
// - submitPluginDrawerRequest
// - submitPluginDrawerSuccess
// - submitPluginDrawerFailure
// - resetPluginDrawer(initialValues = undefined)
// - setPluginDrawerValue(key: string, value: any)
// - setPluginDrawerValues(values: Record<string, any>)
// values:
// - pluginDrawer = { id: 0, enabled: false, ... }
// - pluginDrawerChanges = { enabled: true }
// - pluginDrawerChanged = true
// - pluginDrawerTouches = { enabled: true }
// - pluginDrawerTouched = true
// - ${formKey}ValidationErrors
// - isPluginDrawerSubmitting
// - pluginDrawerHasErrors
// - canSubmitPluginDrawer

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
          const capitalizedFormKey = capitalizeFirstLetter(formKey)

          logic.extend({
            actions: {
              [`set${capitalizedFormKey}Value`]: (key: string, value: any) => ({ values: { [key]: value } }),
              [`set${capitalizedFormKey}Values`]: (values: Record<string, any>) => ({ values }),
            },
            reducers: {
              [formKey]: [
                formObject.default || {},
                {
                  [`set${capitalizedFormKey}Value`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => ({ ...state, ...values }),
                  [`set${capitalizedFormKey}Values`]: (
                    state: Record<string, any>,
                    { values }: { values: Record<string, any> },
                  ) => ({ ...state, ...values }),
                },
              ],
            },
            selectors: {
              [`${formKey}Changes`]: [(s) => [], () => []],
              [`${formKey}Changed`]: [
                (s) => [s[`${formKey}Changes`]],
                (changes: Record<string, any>) => Object.keys(changes).length > 0,
              ],
              [`${formKey}Touches`]: [(s) => [], () => []],
              [`${formKey}Touched`]: [
                (s) => [s[`${formKey}Touches`]],
                (touches: Record<string, any>) => Object.keys(touches).length > 0,
              ],
              [`${formKey}ValidationErrors`]: Array.isArray(formObject.validator)
                ? formObject.validator
                : [(s) => [s[formKey]], formObject.validator],
              [`is${capitalizedFormKey}Valid`]: [
                (s) => [s[`${formKey}ValidationErrors`]],
                (errors: Record<string, any>) => Object.keys(errors).length === 0,
              ],
            },
          })
        })
      },
    },

    buildOrder: {
      forms: { after: 'defaults' },
    },
  }
}
