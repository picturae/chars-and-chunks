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
})
