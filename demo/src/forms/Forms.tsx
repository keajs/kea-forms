import './forms.scss'
import { formsLogic, UserFormType } from './formsLogic'
import { useActions, useValues } from 'kea'
import { Form, Field } from 'kea-forms'

export function Forms() {
  const { userForm, userFormValidationErrors } = useValues(formsLogic) as {
    userForm: UserFormType
    userFormValidationErrors: UserFormType
  }

  const { setUserFormValue } = useActions(formsLogic) as { setUserFormValue: (key: string, value: string) => void }
  console.log(userForm, userFormValidationErrors)

  return (
    <div>
      <p>Demonstrating a simple form below</p>
      <Form logic={formsLogic} form="userForm">
        <Field name="name">
          <input className="form-input" />
        </Field>
        <div className="form-input-container">
          <label htmlFor="userForm.name">Name</label>
          <input
            className="form-input"
            id="userForm.name"
            value={userForm.name}
            onChange={(e) => setUserFormValue('name', e.target.value)}
          />
          {userFormValidationErrors?.name ? <div className="form-error">{userFormValidationErrors?.name}</div> : null}
        </div>
        <div className="form-input-container">
          <label htmlFor="userForm.email">Email</label>
          <input
            className="form-input"
            id="userForm.email"
            value={userForm.email}
            onChange={(e) => setUserFormValue('email', e.target.value)}
          />
          {userFormValidationErrors?.email ? <div className="form-error">{userFormValidationErrors?.email}</div> : null}
        </div>
        <div>
          <input type="submit" value="Submit Form!" className="form-submit" />
        </div>
      </Form>
    </div>
  )
}
