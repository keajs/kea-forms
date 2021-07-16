import * as React from 'react'
import { BuiltLogic, LogicWrapper, useActions, useMountedLogic } from 'kea'
import { capitalizeFirstLetter, pathSelector, splitPathKey } from './utils'
import { useContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { FieldNamePath, FieldNameType } from './types'

export interface FormProps {
  logic: LogicWrapper
  props?: Record<string, any>
  form: string
  children: any
}

export interface GroupProps {
  name: FieldNamePath | FieldNameType
  children: any
}

export interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  name: FieldNamePath | FieldNameType
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
        name: FieldNamePath | FieldNameType
      }) => React.ReactElement)
}

interface FormContextProps {
  logic: BuiltLogic | undefined
  formKey: string
  namePrefix?: FieldNameType[]
}

export const FormContext = React.createContext({} as FormContextProps)

export function Form({ logic, props, form, children }: FormProps): JSX.Element {
  useMountedLogic(logic(props))

  const newFormContext = useMemo(() => ({ logic: logic(props), formKey: form }), [logic(props), form])

  return (
    <FormContext.Provider value={newFormContext}>
      <form onSubmit={(e) => e.preventDefault()}>{children}</form>
    </FormContext.Provider>
  )
}

export function Group({ name, children }: GroupProps): JSX.Element {
  const formContext = useContext(FormContext)

  const namePath = [
    ...(formContext.namePrefix || []),
    ...(Array.isArray(name) ? (name as FieldNamePath) : splitPathKey(name as FieldNameType)),
  ]

  const newFormContext = useMemo(() => ({ ...formContext, namePrefix: namePath }), [formContext, namePath.join('.')])

  return <FormContext.Provider value={newFormContext}>{children}</FormContext.Provider>
}

export function Field({ name, label, hint, noStyle, children }: FieldProps): JSX.Element {
  const { logic, formKey, namePrefix } = useContext(FormContext)
  if (!logic) {
    throw new Error('Please pass a "logic" to the <Form /> tag.')
  }
  if (!formKey) {
    throw new Error('Please pass a "formKey" to the <Form /> tag.')
  }
  const capitalizedFormKey = capitalizeFirstLetter(formKey)
  const { [`set${capitalizedFormKey}Value`]: setValue, [`touch${capitalizedFormKey}Field`]: touchField } = useActions(
    logic,
  )
  const namePath = [
    ...(namePrefix || []),
    ...(Array.isArray(name) ? (name as FieldNamePath) : splitPathKey(name as FieldNameType)),
  ]
  const nameString = namePath.join('.')
  const value = useSelector((state) => pathSelector(namePath, logic?.selectors[formKey]?.(state)))
  const error = useSelector((state) => pathSelector(namePath, logic?.selectors[`${formKey}Errors`]?.(state)))
  const id = `${logic?.pathString}.${formKey}.${nameString}`

  const newProps = {
    id,
    name,
    value,
    onChange: (c: string) => setValue(namePath, c),
    onBlur: () => touchField(nameString),
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
