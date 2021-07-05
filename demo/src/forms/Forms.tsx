import { formsLogic, UserFormType } from './formsLogic'
import { useActions, useValues } from 'kea'

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
      <form onSubmit={() => {}}>
        <div>
          <label htmlFor='userForm.name'>
            Name
          </label>
          <input id='userForm.name' value={userForm.name} onChange={(e) => setUserFormValue('name', e.target.value)} />
          {userFormValidationErrors?.name ? <div>{userFormValidationErrors?.name}</div> : null}
        </div>
        <div>
          <label htmlFor='userForm.email'>
            Email
          </label>
          <input id='userForm.email' value={userForm.email} onChange={(e) => setUserFormValue('email', e.target.value)} />
          {userFormValidationErrors?.email ? <div>{userFormValidationErrors?.email}</div> : null}
        </div>
        <div>
          <input type='submit' value='Submit Form!' />
        </div>
      </form>
    </div>
  )
}
