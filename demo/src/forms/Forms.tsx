import { formsLogic } from './formsLogic'
import { useValues } from 'kea'

export function Forms() {
  // @ts-ignore
  const { userForm } = useValues(formsLogic)
  console.log(userForm)
  return <div>forms</div>
}
