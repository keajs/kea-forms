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
  children: React.ReactElement
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

export function Field({ fieldKey, label, children }: FieldProps): JSX.Element {
  const { logic, formKey } = useContext(FormContext)
  const { [`set${capitalizeFirstLetter(formKey)}Value`]: setValue } = useActions(logic!)
  const value = useSelector((state) => logic?.selectors[formKey]?.(state)?.[fieldKey])
  const error = useSelector((state) => logic?.selectors[`${formKey}Errors`]?.(state)?.[fieldKey])

  const id = `${logic?.pathString}.${formKey}.${fieldKey}`

  const kids = React.Children.map(children, (child) => {
    const isHTMLInputElement = child.type === 'input' || child.type === 'select'
    if (isHTMLInputElement) {
      return React.cloneElement(child, {
        id,
        name: fieldKey,
        ...child.props,
        value: value || '',
        onChange: (e: Event) => setValue(fieldKey, (e?.target as HTMLInputElement)?.value),
      })
    } else {
      return React.cloneElement(child, {
        ...child.props,
        value,
        onChange: (c: any) => setValue(fieldKey, c),
      })
    }
  })

  return (
    <div className="form-input-container">
      <label htmlFor={id}>{label}</label>
      {kids}
      {error ? <div className="form-error">{error}</div> : null}
    </div>
  )
}
