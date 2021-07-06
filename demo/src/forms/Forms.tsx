import './forms.scss'
import { formsLogic } from './formsLogic'
import { useValues } from 'kea'
import { Form, Field } from 'kea-forms'

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>{
  onChange?: (value: string) => void
  value?: string
}

function Input({ onChange, value, ...props }: InputProps): JSX.Element {
  return <input {...props} value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
}

export function Forms() {
  const { isUserFormSubmitting } = useValues(formsLogic) as {
    isUserFormSubmitting: boolean
  }

  return (
    <div>
      <p>Demonstrating a simple form below</p>
      <Form logic={formsLogic} form="userForm">
        <Field fieldKey="name" label="Name">
          <input className="form-input" />
        </Field>
        <Field fieldKey="email" label="Email">
          <Input className="form-input" />
        </Field>
        <div>
          <input type="submit" value={isUserFormSubmitting ? '... ' : 'Submit Form!'} className="form-submit" />
        </div>
      </Form>
    </div>
  )
}
