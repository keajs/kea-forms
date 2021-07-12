import './forms.scss'
import { formsLogic } from './formsLogic'
import { useValues } from 'kea'
import { Form, Field } from 'kea-forms'

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void
  value?: string
}

function Input({ onChange, value, ...props }: InputProps): JSX.Element {
  return <input {...props} value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
}

export function Forms() {
  const { isUserFormSubmitting } = useValues(formsLogic)

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
