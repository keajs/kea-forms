import { KeaPlugin } from 'kea'
import { forms } from './builder'

export const formsPlugin = (): KeaPlugin => {
  return {
    name: 'forms',

    defaults: () => ({
      forms: undefined,
    }),

    events: {
      legacyBuild: (logic, input) => {
        'forms' in input && input.forms && forms(input.forms)(logic)
      },
    },
  }
}
