import './forms.scss'
import { formsLogic, Provider } from './formsLogic'
import { Logic, useActions, useValues } from 'kea'
import React from 'react'

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void
  value?: string
}

function Input({ onChange, value, ...props }: InputProps): JSX.Element {
  return <input {...props} value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
}

// TODO: this doesn't work for the "value" and "onChange"
type FieldProps<F extends Record<string, any>> = keyof F extends infer T
  ? T extends keyof F
    ? {
        name: T
        label?: string | React.ReactNode
        value?: F[T]
        hint?: string | React.ReactNode
        children: React.ReactNode | ((props: { value: F[T]; onChange: (value: F[T]) => void }) => JSX.Element)
      }
    : never
  : never

interface FieldType<F extends Record<string, any>> {
  (props: FieldProps<F>): JSX.Element
  nested<S extends Record<string, any>>(selector: (form: F) => S): FieldType<S>
}

function useForm<L extends Logic = Logic, F extends string = string, V extends Record<string, any> = L['values'][F]>(
  logic: L,
  form: F
): {
  Field: FieldType<V>
  Form: (props: { children: React.ReactNode }) => JSX.Element
} {
  // @ts-ignore
  return null
}

export function Forms() {
  const { isUserFormSubmitting, userForm } = useValues(formsLogic)
  const { setUserFormValue, setUserFormValues, removeAccount, submitUserForm } = useActions(formsLogic)

  const { Form, Field } = useForm(formsLogic, 'userForm')

  return (
    <div>
      <p>Demonstrating a simple form below</p>
      <Form>
        <Field name="subscribe" children={({ bla, onChange, value }) => <div />} />
        <Field name="subscribe">
          {({ onChange, value }) => (
            <Form>
              <br />
            </Form>
          )}
        </Field>
        <Field name="subscribe">
          {({ bla, onChange, value }) => (
            <label>
              <input type="checkbox" onChange={(e) => onChange(e.target.checked)} value={value} /> Subscribe to our
              newsletter!!
            </label>
          )}
        </Field>
        <Field name="name" label="Name">
          <input className="form-input" />
        </Field>
        <Field name="email" label="Email">
          <Input className="form-input" />
        </Field>
        <Field name="guest" label="Guest name">
          <select>
            <option value="" />
            <option value="My Name">My Name</option>
            <option value="Other Name">Other Name</option>
            <option value="Lolz">Lolz</option>
          </select>
        </Field>

        <button onClick={() => setUserFormValue('guest', '')}>No Guest</button>
        <button onClick={() => setUserFormValue('guest', 'Other Name')}>Other Guest</button>

        <h2>Accounts via &lt;Group /&gt;</h2>

        {userForm.accounts.map((account, index) => {
          const AccountField = Field.nested((f) => f.accounts[index])

          return (
            <React.Fragment key={index}>
              <h3>
                Account #{index + 1} <button onClick={() => removeAccount(index)}>Remove</button>
              </h3>

              <AccountField
                name="provider"
                label="Provider"
                hint={account.provider === Provider.Facebook ? 'Are you sure you trust this one?' : null}
              >
                <select>
                  <option value="" />
                  <option value={Provider.Facebook}>Facebook</option>
                  <option value={Provider.Google}>Google</option>
                  <option value={Provider.Twitter}>Twitter</option>
                </select>
              </AccountField>
              <AccountField name="url" label="Url">
                {({ value, onChange }) => <Input className="form-input" value={value} onChange={onChange} />}
              </AccountField>

              <AccountField
                name="provider"
                label="Provider"
                hint={account.provider === Provider.Facebook ? 'Are you sure you trust this one?' : null}
              >
                {({ value, onChange }) => <Input className="form-input" value={value} onChange={onChange} />}
              </AccountField>
            </React.Fragment>
          )
        })}

        <button onClick={() => setUserFormValues({ accounts: [...userForm.accounts, {}] })}>Add Account</button>

        <Field name="subscribe" value>
          {({ bla, onChange, value }) => (
            <label>
              <input type="checkbox" onChange={(e) => onChange(e.target.checked)} value={value} /> Subscribe to our
              newsletter!!
            </label>
          )}
        </Field>

        <div>
          <button onClick={submitUserForm} className="form-submit">
            {isUserFormSubmitting ? '... ' : 'Submit Form!'}
          </button>
        </div>
      </Form>
    </div>
  )
}
