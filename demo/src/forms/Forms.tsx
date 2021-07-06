import './forms.scss'
import { formsLogic, UserFormType } from './formsLogic'
import { useActions, useValues } from 'kea'
import { Form, Field } from 'kea-forms'

export function Forms() {
  const { userForm, userFormValidationErrors, isUserFormSubmitting } = useValues(formsLogic) as {
    userForm: UserFormType
    userFormValidationErrors: UserFormType
    isUserFormSubmitting: boolean
  }

  return (
    <div>
      <p>Demonstrating a simple form below</p>
      <Form logic={formsLogic} form="userForm">
        <Field fieldKey="name" label='Name'>
          <input className="form-input" />
        </Field>
        <Field fieldKey="email" label='Email'>
          <input className="form-input" />
        </Field>
        <div>
          <input type="submit" value={isUserFormSubmitting ? '... ' : 'Submit Form!'} className="form-submit" />
        </div>
      </Form>
    </div>
  )
}
