/* global test, expect, beforeEach */
import { resetContext, kea } from 'kea'

import { formsPlugin } from '../index'

beforeEach(() => {
  resetContext({
    plugins: [formsPlugin],
  })
})

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

describe('kea forms', () => {
  test('simple form actions and values', async () => {
    const logic = kea({
      forms: {
        pluginDrawer: {
          default: { name: '', email: '' },
        },
      },
    })

    const unmount = logic.mount()

    expect(logic.values.pluginDrawer).toEqual({ name: '', email: '' })
    expect(Object.keys(logic.values)).toEqual([
      'pluginDrawer',
      'pluginDrawerChanges',
      'pluginDrawerChanged',
      'pluginDrawerTouches',
      'pluginDrawerTouched',
      'pluginDrawerValidationErrors',
    ])
    expect(Object.keys(logic.actions).sort()).toEqual(['setPluginDrawerValue', 'setPluginDrawerValues'])

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
          default: (state) => ({ name: otherLogic.selectors.myData(state) }),
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
          default: { name: '', email: '' },
          validator: (values) => ({
            name: !!values.name || 'Please enter a name!',
            email: !!values.email || 'Please enter an email!',
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
      name: true,
      email: 'Please enter an email!',
    })
    expect(logic.values.isPluginDrawerValid).toEqual(false)

    logic.actions.setPluginDrawerValue('email', 'joe@schmoe.com')

    expect(logic.values.pluginDrawer).toEqual({ name: 'Joe', email: 'joe@schmoe.com' })
    expect(logic.values.pluginDrawerValidationErrors).toEqual({
      name: true,
      email: true,
    })
    expect(logic.values.isPluginDrawerValid).toEqual(true)

    unmount()
  })
})
