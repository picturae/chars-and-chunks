import { collectionManagement } from '../src/collectionManagement'

describe('Good registration is handled well', function() {
  let registrations = {}

  beforeAll(() => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>'

    registrations.OK = {
      char: 'f',
      context: document.querySelector('main'),
      callback: function(character) {
        console.log(`We saw a '${character}'`)
      },
      comment: 'Logs what was seen',
    }

    registrations.OK2 = {
      regex: /.+/,
      context: 'main',
      callback: function(character) {
        console.log(`We saw a '${character}'`)
      },
    }
  })

  afterEach(() => {
    // destroy every spy
    jest.restoreAllMocks()
  })

  /* Test event handling */

  test('A registration is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.registerHotkey(registrations.OK)

    expect(spyConsoleError).not.toHaveBeenCalled()

    const spyConsoleError2 = jest.spyOn(console, 'error')
    collectionManagement.registerBarcode(registrations.OK2)

    expect(spyConsoleError2).not.toHaveBeenCalled()
  })

  test('A registration with a faulty context is not OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    let faultyContext = Object.assign({}, registrations.OK, {
      context: null,
    })
    collectionManagement.registerHotkey(faultyContext)

    expect(spyConsoleError).toHaveBeenCalled()

    const spyConsoleError2 = jest.spyOn(console, 'error')
    let faultyContext2 = Object.assign({}, registrations.OK2, {
      context: null,
    })
    collectionManagement.registerBarcode(faultyContext2)

    expect(spyConsoleError2).toHaveBeenCalled()
  })

  test('A registration with a faulty callback is not OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    let faultyCallback = Object.assign({}, registrations.OK, {
      callback: null,
    })
    collectionManagement.registerHotkey(faultyCallback)

    expect(spyConsoleError).toHaveBeenCalled()

    const spyConsoleError2 = jest.spyOn(console, 'error')
    let faultyCallback2 = Object.assign({}, registrations.OK2, {
      callback: null,
    })
    collectionManagement.registerBarcode(faultyCallback2)

    expect(spyConsoleError2).toHaveBeenCalled()
  })

  test('A registered callback is returned by entryHandler', () => {
    const entry = 'f'
    const spyCallback = jest.spyOn(registrations.OK, 'callback')
    collectionManagement.registerHotkey(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })
})
