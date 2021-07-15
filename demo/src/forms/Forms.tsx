import './forms.scss'
import { formsLogic, Provider } from './formsLogic'
import { useActions, useValues } from 'kea'
import { Form, Field } from 'kea-forms'

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void
  value?: string
}

function Input({ onChange, value, ...props }: InputProps): JSX.Element {
  return <input {...props} value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
}

export function Forms() {
  const { isUserFormSubmitting, userForm } = useValues(formsLogic)
  const { setUserFormValue, setUserFormValues, removeAccount } = useActions(formsLogic)

  return (
    <div>
      <p>Demonstrating a simple form below</p>
      <Form logic={formsLogic} form="userForm">
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

        <button type="button" onClick={() => setUserFormValue('guest', '')}>
          No Guest
        </button>
        <button type="button" onClick={() => setUserFormValue('guest', 'Other Name')}>
          Other Guest
        </button>

        <h2>Accounts</h2>

        {userForm.accounts.map((account, index) => (
          <div key={index}>
            <h3>Account #{index + 1}</h3>
            <button onClick={() => removeAccount(index)}>Remove</button>
            <Field
              name={`accounts.${index}.provider`}
              label="Provider"
              hint={account.provider === Provider.Facebook ? 'Are you sure you trust this one?' : null}
            >
              <select>
                <option value="" />
                <option value={Provider.Facebook}>Facebook</option>
                <option value={Provider.Google}>Google</option>
                <option value={Provider.Twitter}>Twitter</option>
              </select>
            </Field>
            <Field name={['accounts', index, 'url']} label="Url">
              <Input className="form-input" />
            </Field>
          </div>
        ))}

        <button type="button" onClick={() => setUserFormValues({ accounts: [...userForm.accounts, {}] })}>
          Add Account
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
