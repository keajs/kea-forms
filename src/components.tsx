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
  label?: React.ReactNode
  name: string
  children:
    | React.ReactElement
    | (({
        onChange,
        value,
      }: {
        onChange: (value: any) => void
        value: any
        id: string
        name: string
      }) => React.ReactElement)
}

const FormContext = React.createContext({} as { logic: BuiltLogic | undefined; formKey: string })

export function Form({ logic, props, form, children }: FormProps): JSX.Element {
  const { [`submit${capitalizeFirstLetter(form)}`]: submitForm } = useActions(logic(props))

  return (
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

export function Field({ name, label, children }: FieldProps): JSX.Element {
  const { logic, formKey } = useContext(FormContext)
  const { [`set${capitalizeFirstLetter(formKey)}Value`]: setValue } = useActions(logic!)
  const value = useSelector((state) => logic?.selectors[formKey]?.(state)?.[name])
  const error = useSelector((state) => logic?.selectors[`${formKey}Errors`]?.(state)?.[name])
  const id = `${logic?.pathString}.${formKey}.${name}`

  const newProps = {
    id,
    name,
    value,
    onChange: (c: string) => setValue(name, c),
  }

  let kids
  if (typeof children === 'function') {
    // function as children
    kids = children(newProps)
  } else if (children) {
    const props =
      children.type === 'input' || children.type === 'select'
        ? {
            // <input> or <select>
            ...newProps,
            value: value || '', // pass default "" for <input />
            onChange: (e: Event) => setValue(name, (e?.target as HTMLInputElement)?.value), // e.target.value
            ...children.props,
          }
        : {
            // other dom or react element
            ...newProps,
            ...children.props,
          }
    kids = React.cloneElement(children, props)
  }

  return (
    <div className="form-input-container">
      {label ? <label htmlFor={id}>{label}</label> : null}
      {kids}
      {error ? <div className="form-error">{error}</div> : null}
    </div>
  )
}
