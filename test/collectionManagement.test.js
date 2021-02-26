import { dataLockBox } from '../src/dataLockBox'
import { collectionManagement } from '../src/collectionManagement'

describe('Good registration is handled well', function() {
  typeof dataLockBox // have eslint to shut up about no-unused-vars
  let registrations = {}

  beforeEach(() => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>'

    registrations.OK = {
      match: '.',
      callback: function(character) {
        console.log(`We saw a '${character}'`)
      },
      description: 'Logs the character seen',
    }

    registrations.specialKey = {
      match: 'Backspace',
      callback: function(character) {
        console.log(`We saw a '${character}'`)
      },
      description: 'Logs the special key seen',
    }

    registrations.array = {
      match: ['+', '=', '.'],
      callback: function(character) {
        console.log(`We saw member '${character}'`)
      },
      description: 'Logs one of the members seen',
    }

    registrations.OK2 = {
      match: /.+/,
      callback: function(barcode) {
        console.log(`We saw a '${barcode}'`)
      },
      description: `Let's go and see a barcode`,
    }

    registrations.catchAllRegExp = {
      match: /^/,
      callback: function(barcode) {
        console.log(`Any barcode could match this, but ${barcode} did.`)
      },
      description: 'Catches the uncaught',
    }

    registrations.simpleRegex = {
      match: /^\w+$/,
      callback: function(barcode) {
        console.log(
          `Barcodes with regular characters could match this, and ${barcode} did.`,
        )
      },
      description: 'Catches regular characters',
    }

    registrations.advancedRegex = {
      match: /\w+(_\w+)+/,
      callback: function(barcode) {
        console.log(
          `Barcodes with regular characters in a pattern will match this, and ${barcode} did.`,
        )
      },
      description: 'Catches regular characters with an underscore pattern',
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
    collectionManagement.register(registrations.OK)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test('A registration with a special key is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.register(registrations.specialKey)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test('A registration with multiple keys is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.register(registrations.array)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test(`An alternative registration, with a querySelector as context
    is sanity-checked and found OK`, () => {
    const spyConsoleError2 = jest.spyOn(console, 'error')
    collectionManagement.register(registrations.OK2)

    expect(spyConsoleError2).not.toHaveBeenCalled()
  })

  test(`A registration lacking a description, will not be stored`, () => {
    const spyConsoleStorage = jest.spyOn(dataLockBox, 'store')
    registrations.OK2.description = ''
    collectionManagement.register(registrations.OK2)

    expect(spyConsoleStorage).not.toHaveBeenCalled()
  })

  test(`A registration lacking a callback, typeof function, will not be stored`, () => {
    const spyConsoleStorage = jest.spyOn(dataLockBox, 'store')
    registrations.OK2.callback = []
    collectionManagement.register(registrations.OK2)

    expect(spyConsoleStorage).not.toHaveBeenCalled()
  })

  /* Handle matching entries */

  test('A registered callback is returned by entryHandler', () => {
    const entry = '.'
    const spyCallback = jest.spyOn(registrations.OK, 'callback')
    collectionManagement.register(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test('A with a multicharacter key registered callback is returned by entryHandler', () => {
    const entry = 'Backspace'
    const spyCallback = jest.spyOn(registrations.specialKey, 'callback')
    collectionManagement.register(registrations.specialKey)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test('A with multiple keys registered callback is returned by entryHandler', () => {
    const entry = '='
    const spyCallback = jest.spyOn(registrations.array, 'callback')
    collectionManagement.register(registrations.array)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test(`A registered key previously registered as one of multiple keys registered,
    is only registered to its' new callback`, () => {
    const entry = '.'
    const entry3 = '+'

    collectionManagement.register(registrations.array)
    const handle = collectionManagement.hotkeyHandler(entry)

    collectionManagement.register(registrations.OK)
    const handle2 = collectionManagement.hotkeyHandler(entry)
    const handle3 = collectionManagement.hotkeyHandler(entry3)

    expect(handle.callback).not.toEqual(handle2.callback)
    expect(handle.callback).toEqual(handle3.callback)
  })

  test(`A with multiple keys registered key previously soletary registered,
    is only registered to its' new callback`, () => {
    const entry = '.'
    const entry3 = '+'

    collectionManagement.register(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)

    collectionManagement.register(registrations.array)
    const handle2 = collectionManagement.hotkeyHandler(entry)
    const handle3 = collectionManagement.hotkeyHandler(entry3)

    expect(handle.callback).not.toEqual(handle2.callback)
    expect(handle2.callback).toEqual(handle3.callback)
  })

  /* Utiliity functions */

  test('All registrations can be reset', () => {
    const entry = registrations.OK.match
    collectionManagement.register(registrations.OK)
    collectionManagement.register(registrations.OK2)
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
    const entryAny = 'x32457+5456'
    const spyCallbackAny = jest.spyOn(registrations.catchAllRegExp, 'callback')
    collectionManagement.register(registrations.catchAllRegExp)
    const entrySimple = 'HEERHUGOWAARD'
    const spyCallbackSimple = jest.spyOn(registrations.simpleRegex, 'callback')
    collectionManagement.register(registrations.simpleRegex)
    const entryAdv = 'RESULT_NOT_OK'
    const spyCallbackAdv = jest.spyOn(registrations.advancedRegex, 'callback')
    collectionManagement.register(registrations.advancedRegex)

    const handleAny = collectionManagement.barcodeHandler(entryAny)
    const handleSimple = collectionManagement.barcodeHandler(entrySimple)
    const handleAdv = collectionManagement.barcodeHandler(entryAdv)

    handleAny.callback(entryAny)
    handleSimple.callback(entrySimple)
    handleAdv.callback(entryAdv)

    expect(spyCallbackAny).toHaveBeenCalledWith(entryAny)
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
    collectionManagement.register(registrations.OK)
    const ovvObj = collectionManagement.overviewJson()

    expect(ovvObj.hotkeys instanceof Array).toBe(true)
  })

  test("An overview object with an array 'hotkey' and an array 'barcode' is returned when some hotkeys and barcodes were configured", () => {
    collectionManagement.register(registrations.OK)
    collectionManagement.register(registrations.OK2)
    const ovvObj = collectionManagement.overviewJson()

    expect(ovvObj.barcodes instanceof Array).toBe(true)
  })

  test('An help-screen with all active matches is coerced to the hosting application', () => {
    collectionManagement.register(registrations.OK)
    collectionManagement.register(registrations.OK2)
    collectionManagement.register(registrations.catchAllRegExp)
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
    const cleanupOK = collectionManagement.register(registrations.OK)

    expect(typeof cleanupOK === 'function').toBe(true)
  })

  test(`A cleanup removes references to the context of a hotkey,
      and therefore the hotkey can not be used anymore`, () => {
    const entry = registrations.OK.match
    const cleanup = collectionManagement.register(registrations.OK)

    // { callback: {function}, description: {string} }
    const handle1 = collectionManagement.hotkeyHandler(entry)

    expect(handle1.callback).toBe(registrations.OK.callback)
    expect(handle1.description).toBe(registrations.OK.description)

    cleanup()

    const handle2 = collectionManagement.hotkeyHandler(entry)

    expect(handle2).toBeFalsy()
  })

  test(`A cleanup removes references to the context of a barcode,
      and therefore the barcode can not be used anymore`, () => {
    const entrySimple = 'simple'
    const cleanupSimple = collectionManagement.register(
      registrations.simpleRegex,
    )
    const handle1 = collectionManagement.barcodeHandler(entrySimple)

    expect(handle1.description).toBe(registrations.simpleRegex.description)

    cleanupSimple()

    const handle2 = collectionManagement.barcodeHandler(entrySimple)

    expect(handle2).toBeFalsy()

    const entryAll = 'abc'
    const cleanupAll = collectionManagement.register(
      registrations.catchAllRegExp,
    )
    const handleAll = collectionManagement.barcodeHandler(entryAll)

    expect(handleAll.description).toBe(registrations.catchAllRegExp.description)
  })

  test(`A array of hotkeys can be bulk-registered in one call,
      and so the cleanup can also be done in one call`, () => {
    const cleanupRefs = collectionManagement.register([
      registrations.specialKey,
      registrations.array,
    ])

    const entrySpecial = registrations.specialKey.match
    const handleSpecial = collectionManagement.hotkeyHandler(entrySpecial)
    const entryArray = registrations.array.match[0]
    const handleArray = collectionManagement.hotkeyHandler(entryArray)

    expect(handleSpecial.callback).toBe(registrations.specialKey.callback)
    expect(handleArray.description).toBe(registrations.array.description)

    cleanupRefs()

    const handleSpecial2 = collectionManagement.hotkeyHandler(entrySpecial)
    const handleArray2 = collectionManagement.hotkeyHandler(entryArray)

    expect(handleSpecial2).toBeFalsy()
    expect(handleArray2).toBeFalsy()
  })

  /* Mute / Free */

  test('A hotkey or barcode can temporarily suppressed and released again', () => {
    const entry = '.'
    const spyCallback = jest.spyOn(registrations.OK, 'callback')
    collectionManagement.register(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledTimes(1)

    collectionManagement.mute(entry)
    const handleMute = collectionManagement.hotkeyHandler(entry)

    expect(handleMute).toBeFalsy()
    // no new call, counter stays the same
    expect(spyCallback).toHaveBeenCalledTimes(1)

    collectionManagement.free(entry)
    const handleFree = collectionManagement.hotkeyHandler(entry)
    handleFree.callback(entry)

    expect(spyCallback).toHaveBeenCalledTimes(2)
  })
})
