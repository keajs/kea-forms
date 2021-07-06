import { BuiltLogic, LogicWrapper, useActions } from 'kea'
import { capitalizeFirstLetter } from './utils'

export interface FormProps {
  logic: BuiltLogic | LogicWrapper
  props?: Record<string, any>
  form: string
  children: any
}

export function Form({ logic, props, form, children }: FormProps): JSX.Element {
  const { [`submit${capitalizeFirstLetter(form)}`]: submitForm } = useActions(
    props && '_isKea' in logic ? logic.build(props) : logic,
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submitForm()
      }}
    >
      {children}
    </form>
  )
}
