import { collectionManagement } from './collectionManagement'

const charsAndChunksModule = (function() {
  // Maximum time the barcode scanner takes to send the next character
  let safeIntermission = 30
  // General treshold to prevent accidental elbow-on-keyboard processing
  let minimalBarcodeLength = 6
  const allowedModifiers = ['Alt', 'Control', 'Shift']
  // Process variables
  let streamTimeout = 0
  let stream = []

  const settleStream = function() {
    // We only deal with single characters or barcodes.
    if (stream.length >= minimalBarcodeLength) {
      //console.log(`handle as barcode: ${stream.join('')} (${stream.length})`)
      let handle = collectionManagement.barcodeHandler(stream.join(''))
      if (handle) {
        handle.callback(stream)
      }
    } else if (stream.length === 1) {
      //console.log(`handle as character: ${stream.join('')} (${stream.length})`)
      let handle = collectionManagement.hotkeyHandler(stream.join(''))
      if (handle) {
        handle.callback(stream)
      }
    } else {
      //console.log(`invalid stream length: ${stream.length} (${stream.join('')})`)
    }
    stream = []
  }

  const streamHandler = function(event) {
    //console.log(`input: ${event.key}`)
    if (streamTimeout) {
      clearTimeout(streamTimeout)
    }

    // We expect our input can safely be processed; we leave entry with on-the-fly editing to form controls
    const fromFormControl =
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.tagName === 'SELECT'
    if (fromFormControl) {
      stream = []
      return
    }

    // We expect our barcode scanner to send character by character.
    const multiChar = event.key.length > 1
    if (multiChar) {
      // Do not wait for new characters
      //console.log(`out of scope: '${event.key}' in stream: '${stream}'`)
      if (event.key === 'Enter') {
        settleStream()
        return
      } else if (!allowedModifiers.includes(event.key)) {
        // pageDown, Tab, Backspace, etc.
        // Do not use previous characters also
        stream = [event.key]
        settleStream()
        return
      }
      // With allowedModifiers we want to set a new timeout
    } else {
      stream.push(event.key)
    }

    streamTimeout = setTimeout(settleStream, safeIntermission)
  }

  window.addEventListener('keydown', streamHandler)

  return {
    publicAPI: {
      hotkey: collectionManagement.registerHotkey,
      barcode: collectionManagement.registerBarcode,
      overview: collectionManagement.overview,
      reset: collectionManagement.reset,
    },
    testAPI: {
      hotkeyHandler: collectionManagement.hotkeyHandler,
      barcodeHandler: collectionManagement.barcodeHandler,
    },
  }
})()

const charsAndChunks = charsAndChunksModule.publicAPI
const charsAndTests = charsAndChunksModule.testAPI

export { charsAndChunks, charsAndTests }
