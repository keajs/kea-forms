import { kea } from 'kea'
import { formsLogicType } from './formsLogicType'
// @ts-ignore
import { FormInput } from 'kea-loaders'

export interface UserFormType {
  name: string
  email: string
}

export const formsLogic = kea<formsLogicType>({
  forms: {
    userForm: {
      defaults: () =>
        ({
          name: '',
          email: '',
        } as UserFormType),
      validator: (values: UserFormType) => ({
        name: !values.name && 'Please enter a name',
        email: !values.email && 'Please enter an email',
      }),
    },
  } as FormInput<any>,
})
