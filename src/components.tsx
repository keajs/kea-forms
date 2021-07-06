import * as React from 'react'
import { BuiltLogic, LogicWrapper, useActions } from 'kea'
import { capitalizeFirstLetter } from './utils'
import { useContext } from 'react'
import { useSelector } from 'react-redux'

export interface FormProps {
  logic: LogicWrapper
  props?: Record<string, any>
  form: string
  children: any
}

export interface FieldProps {
  label: React.ReactNode
  fieldKey: string
  children: React.ReactNode
}

const FormContext = React.createContext({} as { logic: BuiltLogic | undefined; formKey: string })

export function Form({ logic, props, form, children }: FormProps): JSX.Element {
  const { [`submit${capitalizeFirstLetter(form)}`]: submitForm } = useActions(logic(props))

  return (
    // TODO: measure performance and memoize value
    <FormContext.Provider value={{ logic: logic(props), formKey: form }}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitForm()
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

export function Field({ fieldKey, label }: FieldProps): JSX.Element {
  const { logic, formKey } = useContext(FormContext)
  const setValueText = `set${capitalizeFirstLetter(formKey)}Value`
  const { [setValueText]: setValue } = useActions(logic!)
  const value = useSelector((state) => logic?.selectors[formKey]?.(state)?.[fieldKey])
  const error = useSelector((state) => logic?.selectors[`${formKey}Errors`]?.(state)?.[fieldKey])

  return (
    <div className="form-input-container">
      <label htmlFor={`${logic?.pathString}.${formKey}.${fieldKey}`}>{label}</label>
      <input
        className="form-input"
        id={`${logic?.pathString}.${formKey}.${fieldKey}`}
        value={value}
        onChange={(e) => setValue(fieldKey, e.target.value)}
      />
      {error ? <div className="form-error">{error}</div> : null}
    </div>
  )
}
