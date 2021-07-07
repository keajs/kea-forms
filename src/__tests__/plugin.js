/* global test, expect, beforeEach */
import { resetContext, kea } from 'kea'

import { formsPlugin } from '../plugin'

beforeEach(() => {
  resetContext({
    plugins: [formsPlugin],
  })
})

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

describe('kea-forms plugin', () => {
  test('simple form actions and values', async () => {
    const logic = kea({
      forms: {
        pluginDrawer: {
          defaults: { name: '', email: '' },
        },
      },
    })

    const unmount = logic.mount()

    expect(logic.values.pluginDrawer).toEqual({ name: '', email: '' })
    expect(Object.keys(logic.values).sort()).toEqual([
      'isPluginDrawerSubmitting',
      'isPluginDrawerValid',
      'pluginDrawer',
      'pluginDrawerChanged',
      'pluginDrawerChanges',
      'pluginDrawerErrors',
      'pluginDrawerHasErrors',
      'pluginDrawerTouched',
      'pluginDrawerTouches',
      'pluginDrawerValidationErrors',
      'showPluginDrawerErrors',
    ])
    expect(Object.keys(logic.actions).sort()).toEqual([
      'resetPluginDrawer',
      'setPluginDrawerValue',
      'setPluginDrawerValues',
      'submitPluginDrawer',
      'submitPluginDrawerFailure',
      'submitPluginDrawerRequest',
      'submitPluginDrawerSuccess',
      'touchPluginDrawerField',
    ])

    logic.actions.setPluginDrawerValue('name', 'John')
    expect(logic.values.pluginDrawer).toEqual({ name: 'John', email: '' })

    logic.actions.setPluginDrawerValues({ name: 'Johnny', email: 'johnny@gmail.com', anotherKey: true })
    expect(logic.values.pluginDrawer).toEqual({ name: 'Johnny', email: 'johnny@gmail.com', anotherKey: true })

    unmount()
  })

  test('default with selector function', async () => {
    const otherLogic = kea({
      reducers: {
        myData: ['hello world', {}],
      },
    })
    const logic = kea({
      connect: [otherLogic],
      forms: {
        pluginDrawer: {
          defaults: (state) => ({ name: otherLogic.selectors.myData(state) }),
        },
      },
    })

    const unmount = logic.mount()

    expect(logic.values.pluginDrawer).toEqual({ name: 'hello world' })

    unmount()
  })

  test('validator sync', async () => {
    const logic = kea({
      forms: {
        pluginDrawer: {
          defaults: { name: '', email: '' },
          validator: (pluginDrawer) => ({
            name: !pluginDrawer.name && 'Please enter a name!',
            email: !pluginDrawer.email && 'Please enter an email!',
          }),
        },
      },
    })

    const unmount = logic.mount()

    expect(logic.values.pluginDrawer).toEqual({ name: '', email: '' })
    expect(logic.values.pluginDrawerValidationErrors).toEqual({
      name: 'Please enter a name!',
      email: 'Please enter an email!',
    })
    expect(logic.values.isPluginDrawerValid).toEqual(false)

    logic.actions.setPluginDrawerValue('name', 'Joe')

    expect(logic.values.pluginDrawer).toEqual({ name: 'Joe', email: '' })
    expect(logic.values.pluginDrawerValidationErrors).toEqual({
      name: false,
      email: 'Please enter an email!',
    })
    expect(logic.values.isPluginDrawerValid).toEqual(false)

    logic.actions.setPluginDrawerValue('email', 'joe@schmoe.com')

    expect(logic.values.pluginDrawer).toEqual({ name: 'Joe', email: 'joe@schmoe.com' })
    expect(logic.values.pluginDrawerValidationErrors).toEqual({
      name: false,
      email: false,
    })
    expect(logic.values.isPluginDrawerValid).toEqual(true)

    unmount()
  })

  test('submit', async () => {
    let submitRan = false
    const logic = kea({
      forms: {
        pluginDrawer: {
          defaults: { name: '' },
          submit: async (formValues, breakpoint) => {
            await breakpoint(100)
            expect(formValues).toEqual({ name: 'hello world' })
            submitRan = true
          },
        },
      },
    })

    const unmount = logic.mount()
    logic.actions.setPluginDrawerValues({ name: 'hello world' })
    expect(logic.values.pluginDrawer).toEqual({ name: 'hello world' })
    logic.actions.submitPluginDrawer()
    expect(logic.values.isPluginDrawerSubmitting).toEqual(true)

    await delay(200)

    expect(submitRan).toEqual(true)
    expect(logic.values.isPluginDrawerSubmitting).toEqual(false)

    unmount()
  })
})
