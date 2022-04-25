import * as React from 'react'
import { BuiltLogic, LogicWrapper, useActions, useMountedLogic, useSelector } from 'kea'
import { capitalizeFirstLetter, pathSelector, splitPathKey } from './utils'
import { ChangeEvent, useContext, useMemo } from 'react'
import { FieldNamePath, FieldNameType } from './types'

export interface FormProps extends React.HTMLProps<HTMLFormElement> {
  /** Logic that contains the form, without the props */
  logic: LogicWrapper
  /** Props for the logic, taken from BindLogic if available */
  props?: Record<string, any>
  /** Key on the form */
  formKey: string
  /** Enable onSubmit events to trigger submit action.  */
  enableFormOnSubmit?: boolean
  children: any
}

export interface GroupProps {
  name: FieldNamePath | FieldNameType
  children: any
}

export interface ChildFunctionProps {
  onChange: (event: ChangeEvent) => void
  onValueChange: (value: any) => void
  value: any
  id: string
  name: FieldNamePath | FieldNameType
}

export interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  name: FieldNamePath | FieldNameType
  validateStatus?: string
  help?: React.ReactNode
  noStyle?: boolean
  children: React.ReactElement | ((props: ChildFunctionProps) => React.ReactElement)
  template?: (args: {
    label?: React.ReactNode
    hint?: React.ReactNode
    error: React.ReactNode
    kids: React.ReactElement | ((props: ChildFunctionProps) => React.ReactElement)
  }) => JSX.Element
}

interface FormContextProps {
  logic: BuiltLogic | undefined
  formKey: string
  namePrefix?: FieldNameType[]
}

export const FormContext = React.createContext({} as FormContextProps)

export function Form({ logic, props, formKey, children, enableFormOnSubmit, ...otherProps }: FormProps): JSX.Element {
  const builtLogic = useMountedLogic(props ? logic(props) : logic)

  const newFormContext = useMemo(() => ({ logic: builtLogic, formKey }), [builtLogic, formKey])

  return (
    <FormContext.Provider value={newFormContext}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (enableFormOnSubmit) {
            builtLogic.actions[`submit${capitalizeFirstLetter(formKey)}`]?.()
          }
        }}
        {...otherProps}
      >
        {children}
      </form>
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

export function Field({ name, label, hint, noStyle, children, template }: FieldProps): JSX.Element {
  const { logic, formKey, namePrefix } = useContext(FormContext)
  if (!logic) {
    throw new Error('Please pass a "logic" to the <Form /> tag.')
  }
  if (!formKey) {
    throw new Error('Please pass a "formKey" to the <Form /> tag.')
  }
  const capitalizedFormKey = capitalizeFirstLetter(formKey)
  const { [`set${capitalizedFormKey}Value`]: setValue, [`touch${capitalizedFormKey}Field`]: touchField } =
    useActions(logic)
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
    onChange: (e: ChangeEvent) => {
      setValue(namePath, (e?.target as HTMLInputElement)?.value)
    },
    onBlur: () => {
      touchField(nameString)
    },
  }

  let kids
  if (typeof children === 'function') {
    // function as children
    kids = children({
      ...newProps,
      onValueChange: (c: string) => {
        setValue(namePath, c)
      },
    })
  } else if (children) {
    const props = {
      ...newProps,
      value: children.type === 'input' || children.type === 'select' ? value || '' : value, // pass default "" for <input />
      ...children.props,
    }
    kids = React.cloneElement(children, props)
  } else {
    kids = <></>
  }

  if (template) {
    return template({ label, kids, error, hint })
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
