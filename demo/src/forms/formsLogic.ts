import {BreakPointFunction, kea} from 'kea'
import { formsLogicType } from './formsLogicType'
import { FormInput } from 'kea-forms'
import { validateEmail } from './utils'

export interface UserFormType {
  name: string
  email: string
}

export const formsLogic = kea<formsLogicType>({
  forms: {
    userForm: {
      defaults: {
        name: '',
        email: '',
      } as UserFormType,
      validator: (values: UserFormType) => ({
        name: !values.name && 'Please enter a name',
        email: !values.email
          ? 'Please enter an email'
          : !validateEmail(values.email)
          ? 'Please enter a valid email'
          : null,
      }),
      submit: async (formValues: Record<string, any>, breakpoint: BreakPointFunction) => {
        console.log('submitting!', formValues)
        await breakpoint(1000)
      }
    },
  } as FormInput<any>,
})
