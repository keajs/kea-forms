[![NPM Version](https://img.shields.io/npm/v/kea-forms.svg)](https://www.npmjs.com/package/kea-forms)
[![minified](https://badgen.net/bundlephobia/min/kea-forms)](https://bundlephobia.com/result?p=kea-forms)
[![minified + gzipped](https://badgen.net/bundlephobia/minzip/kea-forms)](https://bundlephobia.com/result?p=kea-forms)
[![Backers on Open Collective](https://opencollective.com/kea/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/kea/sponsors/badge.svg)](#sponsors)

# kea-forms

This is an **experimental** plugin adding support for `forms` inside kea logic, with full TypeScript/TypeGen support.

## Installation

`kea-forms` requires kea `3.0.1+`.

```bash
yarn add kea-forms
```

Set it up like all other kea plugins:

```ts
import { resetContext } from 'kea'
import { formsPlugin } from 'kea-forms'

resetContext({
  plugins: [formsPlugin],
})
```

## Type generation

This package ships its forms type builder as `lib/typegen.wasm` and registers it through
`lib/typegen.json`. With the Go engine, form defaults, actions, reducers and selectors are
inferred in the same process as the other Kea builders. Existing typegen versions and projects
using the JavaScript visitor can use `lib/typegen.js`.

Run `flox activate` to use the project's Node, npm, Yarn and Go versions. Run `yarn install --frozen-lockfile` and `npm run build:typegen` to build the module locally, and `go test -C typegen ./...` to test it.

To enable releases, sign into npm as a package maintainer and run `npm run release:setup` once. Complete npm's browser authentication prompt. In **Actions → Release**, select `main` and leave the version blank to publish the prepared release or next minor. [Release guide](https://github.com/keajs/kea-typegen/blob/main/docs/releases.md)

## Usage

Code like this:

```ts
import { kea } from 'kea'
import { forms } from 'kea-forms'

export interface UserFormType {
  name: string
  email: string
}

export const formsLogic = kea<formsLogicType>([
  // ... actions, reducers, ...

  forms({
    userForm: {
      defaults: {
        name: '',
        email: '',
      } as UserFormType,
      errors: (values) => ({
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
      options: { showErrorsOnTouch: true },
    },
  }),

  // ... other listeners, etc
])
```

Produces the following actions and values:

```ts
interface formsLogicType {
  actions: {
    setUserFormValue: (key: string, value: any) => void
    setUserFormValues: (values: Partial<UserFormType>) => void
    touchUserFormField: (key: string) => void
    resetUserForm: (values?: UserFormType) => void
    submitUserForm: () => void
    submitUserFormRequest: (userForm: UserFormType) => void
    submitUserFormSuccess: (userForm: UserFormType) => void
    submitUserFormFailure: (error: Error, errors: Record<string, any>) => void
  }
  values: {
    userForm: UserFormType
    userFormTouches: Record<string, boolean>
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

With `options.showErrorsOnTouch`, a field shows its validation error on blur. Set `enableFormOnSubmit` to show all field errors when the HTML form is submitted.

```tsx
import { formsLogic } from './formsLogic'
import { useActions, useValues } from 'kea'
import { Form, Field } from 'kea-forms'

function MyForm() {
  const { isUserFormSubmitting } = useValues(formsLogic)
  const { setUserFormValue } = useActions(formsLogic)

  return (
    <div>
      <p>Demonstrating a simple form below</p>
      <Form logic={formsLogic} formKey="userForm" enableFormOnSubmit>
        <Field name="name" label="Name">
          {/* "value" and "onChange" added automatically */}
          <input className="form-input" />
        </Field>

        <button type="button" onClick={() => setUserFormValue('guest', '')}>
          No Guest
        </button>
        <button type="button" onClick={() => setUserFormValue('guest', 'Other Name')}>
          Other Guest
        </button>

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
