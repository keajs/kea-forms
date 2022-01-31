import {kea, MakeLogicType} from 'kea'
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
  guest?: string
  accounts: AccountType[]
  subscribe?: boolean
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
      submit: (userForm) => {
        console.log('submitting!', userForm)
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

type ItemType = string
type SomeLogicValues<T> = { valueKey: T }
type SomeLogicActions<T> = { actionKey: () => { payloadKey: T } }

type SomeLogicType<T> = MakeLogicType<
  SomeLogicValues<T>,
  SomeLogicActions<T>
>;

export const SomeLogic = kea<SomeLogicType<ItemType>>({
  actions: {

  }
})

SomeLogic.actions.actionKey()