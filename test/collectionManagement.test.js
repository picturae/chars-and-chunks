import { collectionManagement } from '../src/collectionManagement'

describe('Good registration is handled well', function() {
  let registrations = {}

  beforeEach(() => {
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
      callback: function(barcode) {
        console.log(`We saw a '${barcode}'`)
      },
    }

    registrations.omittedRegex = {
      context: document.querySelector('header'),
      callback: function(barcode) {
        console.log(`Any barcode could match this, but ${barcode} did.`)
      },
      comment: 'Catches the uncaught',
    }

    registrations.simpleRegex = {
      regex: /\w+/,
      context: document.querySelector('header'),
      callback: function(barcode) {
        console.log(
          `Barcodes with regular characters could match this, and ${barcode} did.`,
        )
      },
      comment: 'Catches regular characters',
    }

    registrations.advancedRegex = {
      regex: /\w+[_\w+]+/,
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

  /* Test event handling */

  test('A registration is sanity-checked and found OK', () => {
    const spyConsoleError = jest.spyOn(console, 'error')
    collectionManagement.registerHotkey(registrations.OK)

    expect(spyConsoleError).not.toHaveBeenCalled()
  })

  test(`An alternative registration, with a querySelector as context
    and an omitted comment is sanity-checked and found OK`, () => {
    const spyConsoleError2 = jest.spyOn(console, 'error')
    collectionManagement.registerBarcode(registrations.OK2)

    expect(spyConsoleError2).not.toHaveBeenCalled()
  })

  test(`An always-true regex in a barcode registration is used
    when the regex member is omitted`, () => {
    let noRegexProps = Object.assign({}, registrations.OK2)
    delete noRegexProps.regex
    collectionManagement.registerBarcode(noRegexProps)

    expect(noRegexProps.regex instanceof RegExp).toBe(true)
  })

  test('A registered callback is returned by entryHandler', () => {
    const entry = 'f'
    const spyCallback = jest.spyOn(registrations.OK, 'callback')
    collectionManagement.registerHotkey(registrations.OK)
    const handle = collectionManagement.hotkeyHandler(entry)
    handle.callback(entry)

    expect(spyCallback).toHaveBeenCalledWith(entry)
  })

  test('All registrations can be reset', () => {
    collectionManagement.registerHotkey(registrations.OK)
    collectionManagement.registerBarcode(registrations.OK2)
    const handle = collectionManagement.hotkeyHandler(registrations.OK.char)
    const handle2 = collectionManagement.barcodeHandler(registrations.OK2.regex)

    collectionManagement.reset()

    const handle_reset = collectionManagement.hotkeyHandler(
      registrations.OK.char,
    )
    const handle2_reset = collectionManagement.barcodeHandler(
      registrations.OK2.regex,
    )

    expect(handle).toBeTruthy
    expect(handle2).toBeTruthy
    expect(handle_reset).toBeFalsy
    expect(handle2_reset).toBeFalsy
  })

  test(`A barcode is paired to the lengthiest matching Regexp`, () => {
    const entryOmit = '32457+5456'
    const spyCallbackOmit = jest.spyOn(registrations.omittedRegex, 'callback')
    collectionManagement.registerBarcode(registrations.omittedRegex)
    collectionManagement.barcodeHandler(entryOmit).callback(entryOmit)

    expect(spyCallbackOmit).toHaveBeenCalledWith(entryOmit)

    const entrySimple = 'HEERHUGOWAARD'
    const spyCallbackSimple = jest.spyOn(registrations.simpleRegex, 'callback')
    collectionManagement.registerBarcode(registrations.simpleRegex)
    collectionManagement.barcodeHandler(entrySimple).callback(entrySimple)

    expect(spyCallbackSimple).toHaveBeenCalledWith(entrySimple)

    const entryAdv = 'RESULT_NOT_OK'
    const spyCallbackAdv = jest.spyOn(registrations.advancedRegex, 'callback')
    collectionManagement.registerBarcode(registrations.advancedRegex)
    collectionManagement.barcodeHandler(entryAdv).callback(entryAdv)

    expect(spyCallbackAdv).toHaveBeenCalledWith(entryAdv)
  })
})