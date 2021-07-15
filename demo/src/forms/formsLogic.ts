import { kea } from 'kea'
import { formsLogicType } from './formsLogicType'
import { validateEmail } from './utils'

export enum Provider {
  Facebook = 'facebook',
  Google = 'google',
  Twitter = 'twitter',
}

export interface AccountType {
  provider: Provider
  url: string
}

export interface UserFormType {
  name: string
  email: string
  accounts: AccountType[]
}

export const formsLogic = kea<formsLogicType<UserFormType>>({
  forms: {
    userForm: {
      defaults: {
        name: '',
        email: '',
        accounts: [],
      } as UserFormType,
      validator: (values) => ({
        name: !values.name && 'Please enter a name',
        email: !values.email
          ? 'Please enter an email'
          : !validateEmail(values.email)
          ? 'Please enter a valid email'
          : null,
        accounts: values.accounts.map((a) => ({
          provider: !a.provider && 'Please enter a provider',
          url: !a.url && 'Please enter a url',
        })),
      }),
      submit: (formValues) => {
        console.log('submitting!', formValues)
      },
    },
  },
  actions: {
    removeAccount: (index: number) => ({ index }),
  },
  reducers: {
    userForm: {
      removeAccount: (state, { index }) => ({ ...state, accounts: state.accounts.filter((_, i) => i !== index) }),
    },
  },
})
