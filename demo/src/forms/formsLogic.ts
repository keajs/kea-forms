import { kea } from 'kea'
import { formsLogicType } from './formsLogicType'

export const formsLogic = kea<formsLogicType>({
  forms: {
    userForm: {
      defaults: () => ({
        name: '',
        email: '',
      }),
    },
  },
})
