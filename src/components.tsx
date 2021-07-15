import * as React from 'react'
import { BuiltLogic, LogicWrapper, useActions } from 'kea'
import { capitalizeFirstLetter, pathSelector, splitPathKey } from './utils'
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import { FieldNamePath, FieldNameType } from './types'

export interface FormProps {
  logic: LogicWrapper
  props?: Record<string, any>
  form: string
  children: any
}

export interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  name: (string | number) | (string | number)[]
  noStyle?: boolean
  children:
    | React.ReactElement
    | (({
        onChange,
        value,
      }: {
        onChange: (value: any) => void
        value: any
        id: string
        name: (string | number) | (string | number)[]
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

export function Field({ name, label, hint, noStyle, children }: FieldProps): JSX.Element {
  const { logic, formKey } = useContext(FormContext)
  if (!logic) {
    throw new Error('Please pass a logic to the <Form /> tag.')
  }
  const capitalizedFormKey = capitalizeFirstLetter(formKey)
  const { [`set${capitalizedFormKey}Value`]: setValue, [`touch${capitalizedFormKey}Field`]: touchField } = useActions(
    logic,
  )
  const nameString = Array.isArray(name) ? name.join('.') : name
  const namePath = Array.isArray(name) ? (name as FieldNamePath) : splitPathKey(name as FieldNameType)
  const value = useSelector((state) => pathSelector(namePath, logic?.selectors[formKey]?.(state)))
  const error = useSelector((state) => pathSelector(namePath, logic?.selectors[`${formKey}Errors`]?.(state)))
  const id = `${logic?.pathString}.${formKey}.${nameString}`

  const newProps = {
    id,
    name,
    value,
    onChange: (c: string) => setValue(name, c),
    onBlur: () => touchField(name),
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
            onChange: (e: Event) => setValue(namePath, (e?.target as HTMLInputElement)?.value), // e.target.value
            ...children.props,
          }
        : {
            // other dom or react element
            ...newProps,
            ...children.props,
          }
    kids = React.cloneElement(children, props)
  } else {
    kids = <></>
  }

  if (noStyle) {
    return kids
  }

  return (
    <div className="form-input-container">
      {label ? <label htmlFor={id}>{label}</label> : null}
      {kids}
      {error ? <div className="form-error">{error}</div> : null}
      {hint ? <div className="form-hint">{hint}</div> : null}
    </div>
  )
}
