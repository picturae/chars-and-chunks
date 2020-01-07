import { dataLockBox } from '../src/dataLockBox'
import { collectionManagement } from '../src/collectionManagement'
import { charsAndChunks } from '../src/charsAndChunks' //required. duh

describe("It's all around a keyboard event", function() {
  typeof dataLockBox // have eslint to shut up about no-unused-vars
  typeof charsAndChunks // have eslint to shut up about no-unused-vars
  let keyStrokes = {}
  let dispatchEightTimesCapitalB

  beforeAll(() => {
    //enable testing code with setTimeout
    jest.useFakeTimers()

    keyStrokes.f = new KeyboardEvent('keydown', {
      charCode: 0,
      code: 'KeyF',
      key: 'f',
      keyCode: 70,
      which: 70,
    })

    keyStrokes.B = new KeyboardEvent('keydown', {
      charCode: 0,
      code: 'KeyB',
      key: 'B',
      keyCode: 66,
      shiftKey: true,
      which: 66,
    })

    keyStrokes['ctrl+i'] = new KeyboardEvent('keydown', {
      charCode: 0,
      code: 'KeyI',
      key: 'i',
      keyCode: 73,
      ctrlKey: true,
      which: 73,
    })

    keyStrokes.Backspace = new KeyboardEvent('keydown', {
      charCode: 0,
      code: 'Backspace',
      key: 'Backspace',
      keyCode: 8,
      which: 8,
    })

    keyStrokes.Enter = new KeyboardEvent('keydown', {
      charCode: 0,
      code: 'Enter',
      key: 'Enter',
      keyCode: 13,
      which: 13,
    })

    dispatchEightTimesCapitalB = function() {
      for (let i = 0; i < 8; i++) {
        window.dispatchEvent(keyStrokes.B)
      }
    }
  })

  afterEach(() => {
    // destroy every spy
    jest.restoreAllMocks()
  })

  /* Test event handling */

  test('A single character is sent to the hotkeyHandler', () => {
    const spyHotkey = jest.spyOn(collectionManagement, 'hotkeyHandler')
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    window.dispatchEvent(keyStrokes.f)
    jest.runAllTimers()

    expect(spyHotkey).toHaveBeenCalledWith('f')
    expect(spyBarcode).not.toHaveBeenCalled()
  })

  test('A Control modified single character is sent to the hotkeyHandler with a prefix', () => {
    const spyHotkey = jest.spyOn(collectionManagement, 'hotkeyHandler')
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    window.dispatchEvent(keyStrokes['ctrl+i'])
    jest.runAllTimers()

    expect(spyHotkey).toHaveBeenCalledWith('ctrl+i')
    expect(spyBarcode).not.toHaveBeenCalled()
  })

  test('A sequence is sent to the barcodeHandler', () => {
    const spyHotkey = jest.spyOn(collectionManagement, 'hotkeyHandler')
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    dispatchEightTimesCapitalB()
    jest.runAllTimers()

    expect(spyHotkey).not.toHaveBeenCalled()
    expect(spyBarcode).toHaveBeenCalledWith('BBBBBBBB')
  })

  test('A sequence of 2 characters is not sent to a handler', () => {
    const spyHotkey = jest.spyOn(collectionManagement, 'hotkeyHandler')
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.B)
    jest.runAllTimers()

    expect(spyHotkey).not.toHaveBeenCalled()
    expect(spyBarcode).not.toHaveBeenCalled()
  })

  test('A sequence ending with Enter will not send the Enter', () => {
    window.dispatchEvent(keyStrokes.Enter)
    dispatchEightTimesCapitalB()
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    jest.runAllTimers()

    expect(spyBarcode).toHaveBeenCalledWith('BBBBBBBB')
  })

  test('A Backspace will be seen as a character', () => {
    const spyHotkey = jest.spyOn(collectionManagement, 'hotkeyHandler')
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    dispatchEightTimesCapitalB()
    window.dispatchEvent(keyStrokes.Backspace)
    jest.runAllTimers()

    expect(spyHotkey).toHaveBeenCalledWith('Backspace')
    expect(spyBarcode).not.toHaveBeenCalled()
  })

  test('A single character entered in an input-field is not sent to a handler', () => {
    const spyHotkey = jest.spyOn(collectionManagement, 'hotkeyHandler')
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')
    document.body.innerHTML = `<input />`
    const input = document.querySelector('input')
    input.addEventListener('keydown', function(event) {
      this.value = event.key
    })
    input.dispatchEvent(keyStrokes.f)

    expect(input.value).toBe('f')
    expect(spyHotkey).not.toHaveBeenCalled()
    expect(spyBarcode).not.toHaveBeenCalled()
  })

  /* Config */

  test(`A configuration setting can be changed`, () => {
    const spyBarcode = jest.spyOn(collectionManagement, 'barcodeHandler')

    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.Enter)

    expect(spyBarcode).not.toHaveBeenCalled()

    charsAndChunks.config({ minimalBarcodeLength: 5 })
    const spyBarcode2 = jest.spyOn(collectionManagement, 'barcodeHandler')

    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.Enter)

    expect(spyBarcode2).toHaveBeenCalledWith('fffff')
  })
})
