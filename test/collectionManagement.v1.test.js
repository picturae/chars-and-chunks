import { dataLockBox } from '../src/dataLockBox'
import { collectionManagement } from '../src/collectionManagement'

describe('Good registration is handled well in version 1', function() {
  typeof dataLockBox // have eslint to shut up about no-unused-vars
  let registrations = {}

  beforeEach(() => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>'

    registrations.OK = {
      char: '.',
      context: document.querySelector('main'),
      callback: function(character) {
        console.log(`We saw a '${character}'`)
      },
      comment: 'Logs the character seen',
    }

    registrations.specialKey = {
      char: 'Backspace',
      context: document.querySelector('main'),
      callback: function(character) {
        console.log(`We saw a '${character}'`)
      },
      comment: 'Logs the special key seen',
    }

    registrations.array = {
      char: ['+', '=', '.'],
      context: document.querySelector('main'),
      callback: function(character) {
        console.log(`We saw member '${character}'`)
      },
      comment: 'Logs one of the members seen',
    }

    registrations.OK2 = {
      regex: /.+/,
      context: 'main',
      callback: function(barcode) {
        console.log(`We saw a '${barcode}'`)
      },
      comment: `Let's go and see a barcode`,
    }

    registrations.omittedRegex = {
      context: document.querySelector('header'),
      callback: function(barcode) {
        console.log(`Any barcode could match this, but ${barcode} did.`)
      },
      comment: 'Catches the uncaught',
    }

    registrations.simpleRegex = {
      regex: /^\w+$/,
      context: document.querySelector('header'),
      callback: function(barcode) {
        console.log(
          `Barcodes with regular characters could match this, and ${barcode} did.`,
        )
      },
      comment: 'Catches regular characters',
    }

    registrations.advancedRegex = {
      regex: /\w+(_\w+)+/,
      context: document.querySelector('header'),
      callback: function(barcode) {
        console.log(
          `Barcodes with regular characters in a pattern will match this, and ${barcode} did.`,
        )
      },
      comment: 'Catches regular characters with an underscore pattern',
    }
  })

  afterEach(() => {
    collectionManagement.reset()
    // destroy every spy
    jest.restoreAllMocks()
  })

  /* Test collection logic */

  /* Sanity checks */

  test('A registration is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.registerHotkey(registrations.OK)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test('A registration with a special key is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.registerHotkey(registrations.specialKey)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test('A registration with multiple keys is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.registerHotkey(registrations.array)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test(`An alternative registration, with a querySelector as context
    is sanity-checked and found OK`, () => {
    const spyConsoleError2 = jest.spyOn(console, 'error')
    collectionManagement.registerBarcode(registrations.OK2)

    expect(spyConsoleError2).not.toHaveBeenCalled()
  })

  test(`A registration lacking a comment, will not be stored`, () => {
    const spyConsoleStorage = jest.spyOn(dataLockBox, 'store')
    registrations.OK2.comment = ''
    collectionManagement.registerBarcode(registrations.OK2)

    expect(spyConsoleStorage).not.toHaveBeenCalled()
  })

  test(`A registration lacking a callback, typeof function, will not be stored`, () => {
    const spyConsoleStorage = jest.spyOn(dataLockBox, 'store')
    registrations.OK2.callback = []
    collectionManagement.registerBarcode(registrations.OK2)

    expect(spyConsoleStorage).not.toHaveBeenCalled()
  })

  test(`An always-true regex in a barcode registration is used
    when the regex member is omitted`, () => {
    let noRegexProps = Object.assign({}, registrations.OK2)
    delete noRegexProps.regex
    collectionManagement.registerBarcode(noRegexProps)
    const handleUndef = collectionManagement.barcodeHandler(undefined)
    const handleAny = collectionManagement.barcodeHandler('œ™=v')

    expect(noRegexProps.callback).toBe(handleUndef.callback)
    expect(noRegexProps.callback).toBe(handleAny.callback)
  })

  /* Handle matching entries */

  test('A registered callback is returned by entryHandler', () => {
    const entry = '.'
    const spyCallback = jest.spyOn(registrations.OK, 'callback')
    collectionManagement.registerHotkey(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test('A with a multicharacter key registered callback is returned by entryHandler', () => {
    const entry = 'Backspace'
    const spyCallback = jest.spyOn(registrations.specialKey, 'callback')
    collectionManagement.registerHotkey(registrations.specialKey)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test('A with multiple keys registered callback is returned by entryHandler', () => {
    const entry = '='
    const spyCallback = jest.spyOn(registrations.array, 'callback')
    collectionManagement.registerHotkey(registrations.array)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test(`A registered key previously registered as one of multiple keys registered,
    is only registered to its' new callback`, () => {
    const entry = '.'
    const entry3 = '+'

    collectionManagement.registerHotkey(registrations.array)
    const handle = collectionManagement.hotkeyHandler(entry)

    collectionManagement.registerHotkey(registrations.OK)
    const handle2 = collectionManagement.hotkeyHandler(entry)
    const handle3 = collectionManagement.hotkeyHandler(entry3)

    expect(handle.callback).not.toEqual(handle2.callback)
    expect(handle.callback).toEqual(handle3.callback)
  })

  test(`A with multiple keys registered key previously soletary registered,
    is only registered to its' new callback`, () => {
    const entry = '.'
    const entry3 = '+'

    collectionManagement.registerHotkey(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)

    collectionManagement.registerHotkey(registrations.array)
    const handle2 = collectionManagement.hotkeyHandler(entry)
    const handle3 = collectionManagement.hotkeyHandler(entry3)

    expect(handle.callback).not.toEqual(handle2.callback)
    expect(handle2.callback).toEqual(handle3.callback)
  })

  /* Utiliity functions */

  test('All registrations can be reset', () => {
    const entry = registrations.OK.char
    collectionManagement.registerHotkey(registrations.OK)
    collectionManagement.registerBarcode(registrations.OK2)
    const handle = collectionManagement.hotkeyHandler(entry)
    const handle2 = collectionManagement.barcodeHandler('PICTURAE')

    collectionManagement.reset()

    const handle_reset = collectionManagement.hotkeyHandler(entry)
    const handle2_reset = collectionManagement.barcodeHandler('PICTURAE')

    expect(handle).toBeTruthy()
    expect(handle2).toBeTruthy()
    expect(handle_reset).toBeFalsy()
    expect(handle2_reset).toBeFalsy()
  })

  /* Barcode matching preference */

  test(`A barcode is paired to the lengthiest matching Regexp`, () => {
    const entryOmit = '32457+5456'
    const spyCallbackOmit = jest.spyOn(registrations.omittedRegex, 'callback')
    collectionManagement.registerBarcode(registrations.omittedRegex)
    const entrySimple = 'HEERHUGOWAARD'
    const spyCallbackSimple = jest.spyOn(registrations.simpleRegex, 'callback')
    collectionManagement.registerBarcode(registrations.simpleRegex)
    const entryAdv = 'RESULT_NOT_OK'
    const spyCallbackAdv = jest.spyOn(registrations.advancedRegex, 'callback')
    collectionManagement.registerBarcode(registrations.advancedRegex)

    const handleOmit = collectionManagement.barcodeHandler(entryOmit)
    const handleSimple = collectionManagement.barcodeHandler(entrySimple)
    const handleAdv = collectionManagement.barcodeHandler(entryAdv)

    handleOmit.callback(entryOmit)
    handleSimple.callback(entrySimple)
    handleAdv.callback(entryAdv)

    expect(spyCallbackOmit).toHaveBeenCalledWith(entryOmit)
    expect(spyCallbackSimple).toHaveBeenCalledWith(entrySimple)
    expect(spyCallbackAdv).toHaveBeenCalledWith(entryAdv)
  })

  /* Overview */

  test('A empty overview object is returned when nothing was configured', () => {
    const ovvObj = collectionManagement.overviewJson()
    const overviewJSON = JSON.stringify(ovvObj)

    expect(typeof ovvObj).toBe('object')
    expect(overviewJSON).toBe('{}')
  })

  test("An overview object with an array 'hotkey' is returned when some hotkeys were configured", () => {
    collectionManagement.registerHotkey(registrations.OK)
    const ovvObj = collectionManagement.overviewJson()

    expect(ovvObj.hotkeys instanceof Array).toBe(true)
  })

  test("An overview object with an array 'hotkey' and an array 'barcode' is returned when some hotkeys and barcodes were configured", () => {
    collectionManagement.registerHotkey(registrations.OK)
    collectionManagement.registerBarcode(registrations.OK2)
    const ovvObj = collectionManagement.overviewJson()

    expect(ovvObj.barcodes instanceof Array).toBe(true)
  })

  test('An help-screen with all active matches is coerced to the hosting application', () => {
    collectionManagement.registerHotkey(registrations.OK)
    collectionManagement.registerBarcode(registrations.OK2)
    collectionManagement.registerBarcode(registrations.omittedRegex)
    collectionManagement.overviewPanel()

    const totalSelector = 'chars-and-chuncks-panel tbody tr'
    const total = document.querySelectorAll(totalSelector)
    const barcodesSelector = 'chars-and-chuncks-panel tbody:last-child tr'
    const barcodes = document.querySelectorAll(barcodesSelector)

    expect(total.length).toBe(3)
    expect(barcodes.length).toBe(2)
  })

  /* Cleanup */

  test('A cleanup function is returned when a hotkey or barcode is registered', () => {
    const cleanupOK = collectionManagement.registerHotkey(registrations.OK)

    expect(typeof cleanupOK === 'function').toBe(true)
  })

  test(`A cleanup removes references to the context of a hotkey or barcode,
      and therefore the hotkey or barcode can not be used anymore`, () => {
    const entry = registrations.OK.char
    const cleanup = collectionManagement.registerHotkey(registrations.OK)
    const handle1 = collectionManagement.hotkeyHandler(entry)

    expect(registrations.OK.box).toBe(handle1)

    cleanup()
    const handle2 = collectionManagement.hotkeyHandler(entry)

    expect(registrations.OK.box).not.toBe(handle2)
  })

  test(`A array of hotkey-registrations can be done in one call,
      and so the cleanup can also be done in one call`, () => {
    const spyCleanup = jest.spyOn(dataLockBox, 'cleanup')

    const cleanupRefs = collectionManagement.registerHotkeys([
      registrations.OK,
      registrations.specialKey,
      registrations.array,
    ])
    cleanupRefs()

    expect(spyCleanup).toHaveBeenCalledTimes(3)
  })
})
