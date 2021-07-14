[![NPM Version](https://img.shields.io/npm/v/kea-forms.svg)](https://www.npmjs.com/package/kea-forms)
[![minified](https://badgen.net/bundlephobia/min/kea-forms)](https://bundlephobia.com/result?p=kea-forms)
[![minified + gzipped](https://badgen.net/bundlephobia/minzip/kea-forms)](https://bundlephobia.com/result?p=kea-forms)
[![Backers on Open Collective](https://opencollective.com/kea/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/kea/sponsors/badge.svg)](#sponsors)

# kea-forms

This is an **experimental** plugin adding support for `forms` inside kea logic, with full TypeScript/TypeGen support.

## Installation

Same with all other kea plugins:

```ts
import { Provider, resetContext } from 'kea'
import { formsPlugin } from 'kea-forms'

resetContext({
  plugins: [formsPlugin],
})
```

## Usage

Code like this:

```ts
export interface UserFormType {
  name: string
  email: string
}

export const formsLogic = kea<formsLogicType<UserFormType>>({
  // ... actions, reducers, ...

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
    
  // ... other listeners, etc
})
```

Produces the following actions and values:

```ts
interface fomrsLogicType {
  actions: {
    setUserFormValue: (key: string, value: any) => void
    setUserFormValues: (values: Partial<UserFormType>) => void
    touchUserFormField: (key: string) => void
    resetUserForm: (values?: UserFormType) => void
    submitUserForm: () => void
    submitUserFormRequest: (userForm: UserFormType) => void
    submitUserFormSuccess: (userForm: UserFormType) => void
    submitUserFormFailure: (error: Error) => void
  },
  values: {
    userForm: UserFormType
    userFormChanges: DeepPartial<UserFormType>
    userFormTouches: DeepPartialMap<UserFormType, boolean>
    isUserFormSubmitting: boolean
    showUserFormErrors: boolean
    userFormChanged: boolean
    userFormTouched: boolean
    userFormValidationErrors: DeepPartialMap<UserFormType, ValidationErrorType>
    userFormHasErrors: boolean
    userFormErrors: DeepPartialMap<UserFormType, ValidationErrorType>
    isUserFormValid: boolean
  }
}
```

Then use the provided `Form` and `Field` helpers inside your component:


```tsx
import { formsLogic } from './formsLogic'
import { useActions, useValues } from 'kea'
import { Form, Field } from 'kea-forms'

function MyForm() {
  const { isUserFormSubmitting } = useValues(formsLogic)
  const { setUserFormValue } = useActions(formsLogic)

  return(
    <div>
      <p>Demonstrating a simple form below</p>
      <Form logic={formsLogic} form="userForm">
        <Field name="name" label="Name">
          {/* `value` and `onChange` added automatically */}
          <input className="form-input" />
        </Field>

        <button type="button" onClick={() => setUserFormValue('guest', '')}>No Guest</button>
        <button type="button" onClick={() => setUserFormValue('guest', 'Other Name')}>Other Guest</button>

        <Field name="subscribe">
          {({ onChange, value }) => (
            <label>
              <input type="checkbox" onChange={(e) => onChange(e.target.checked)} value={value} /> Subscribe to our
              newsletter!!
            </label>
          )}
        </Field>

        <div>
          <input type="submit" value={isUserFormSubmitting ? '... ' : 'Submit Form!'} className="form-submit" />
        </div>
      </Form>
    </div>
  )
}
```

See the code in the `demo` folder for more.

## Coming next on the roadmap

- Async validation of fields
- Nested fields (e.g. arrays of objects in the form)
