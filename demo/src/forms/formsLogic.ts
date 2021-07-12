import { kea } from 'kea'
import { formsLogicType } from './formsLogicType'
import { validateEmail } from './utils'

export interface UserFormType {
  name: string
  email: string
}

export const formsLogic = kea<formsLogicType<UserFormType>>({
  forms: {
    userForm: {
      defaults: {
        name: '',
        email: '',
      } as UserFormType,
      validator: (values) => ({
        name: !values.name && 'Please enter a name',
        email: !values.email
          ? 'Please enter an email'
          : !validateEmail(values.email)
          ? 'Please enter a valid email'
          : null,
      }),
      submit: (formValues) => {
        console.log('submitting!', formValues)
      },
    },
  },
})
