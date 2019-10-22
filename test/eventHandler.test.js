import { charsAndChunks, charsAndTests } from '../src/charsAndChunks'

describe("It's all around a keyboard event", function() {
  let keyStrokes = {}

  beforeAll(() => {
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

    keyStrokes.Shift = new KeyboardEvent('keydown', {
      charCode: 0,
      code: 'ShiftLeft',
      key: 'Shift',
      keyCode: 16,
      which: 16,
    })
  })

  /* Test event handling */

  test('A single character is sent to the hotkeyHandler', () => {
    window.dispatchEvent(keyStrokes.f)
    setTimeout(function() {
      expect(charsAndTests.hotkeyHandler).toHaveBeenCalledWidth('f')
      expect(charsAndTests.barcodeHandler).not.toHaveBeenCalledWidth('f')
    }, 50)
  })

  test('A barcode is sent to the barcodeHandler', () => {
    let i = 0
    while (i < 9) {
      window.dispatchEvent(keyStrokes.Shift)
      window.dispatchEvent(keyStrokes.B)
      i++
    }
    setTimeout(function() {
      expect(charsAndTests.hotkeyHandler).not.toHaveBeenCalledWidth('BBBBBBBB')
      expect(charsAndTests.barcodeHandler).toHaveBeenCalledWidth('BBBBBBBB')
    }, 50)
  })

  test('A seqence of 2 characters is not sent to a handler', () => {
    window.dispatchEvent(keyStrokes.f)
    window.dispatchEvent(keyStrokes.Shift)
    window.dispatchEvent(keyStrokes.B)
    setTimeout(function() {
      expect(charsAndTests.hotkeyHandler).not.toHaveBeenCalledWidth('fB')
      expect(charsAndTests.barcodeHandler).not.toHaveBeenCalledWidth('fB')
    }, 50)
  })
})
