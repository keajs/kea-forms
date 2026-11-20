import React from 'react'
import { act, create } from 'react-test-renderer'
import { kea, resetContext } from 'kea'
import { Field, Form } from '../components'
import { formsPlugin } from '../plugin'

test('fields render validation errors on blur and form submission', () => {
  resetContext({ plugins: [formsPlugin] })
  const logic = kea({
    forms: {
      account: {
        defaults: { user: '', email: '' },
        errors: ({ user, email }) => ({ user: !user && 'Name required', email: !email && 'Email required' }),
        options: { showErrorsOnTouch: true },
      },
    },
  })
  let renderer
  act(() => {
    renderer = create(
      <Form logic={logic} formKey="account" enableFormOnSubmit>
        <Field name="user"><input /></Field>
        <Field name="email"><input /></Field>
      </Form>,
    )
  })
  const errors = () => renderer.root.findAllByProps({ className: 'form-error' }).map((node) => node.children[0])
  try {
    expect(errors()).toEqual([])
    const user = renderer.root.findAllByType('input')[0]
    act(() => { user.props.onBlur() })
    expect(errors()).toEqual(['Name required'])
    act(() => { user.props.onChange({ target: { value: 'Ada' } }) })
    expect(errors()).toEqual([])
    act(() => { renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }) })
    expect(errors()).toEqual(['Email required'])
  } finally {
    act(() => { renderer.unmount() })
  }
})
