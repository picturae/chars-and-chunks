import { collectionManagement } from './collectionManagement'

const charsAndChunksModule = (function() {
  // Maximum time the barcode scanner takes to send the next character
  let safeIntermission = 30
  // General treshold to prevent accidental elbow-on-keyboard processing
  let minimalBarcodeLength = 6
  const allowedModifiers = ['Alt', 'Shift']
  // Process variables
  let streamTimeout = 0
  let stream = ''

  const settleStream = function() {
    // We only deal with single characters or barcodes.
    if (stream.length >= minimalBarcodeLength) {
      //console.log(`handle as barcode: ${stream} (${stream.length})`)
      let handle = collectionManagement.barcodeHandler(stream)
      if (handle) {
        handle.callback(stream)
      }
    } else if (stream.length === 1) {
      //console.log(`handle as character: ${stream} (${stream.length})`)
      let handle = collectionManagement.hotkeyHandler(stream)
      if (handle) {
        handle.callback(stream)
      }
    } else {
      //console.log(`invalid stream length: ${stream.length} (${stream})`)
    }
    stream = ''
  }

  const streamHandler = function(event) {
    //console.log(`input: ${event.key}`)
    if (streamTimeout) {
      clearTimeout(streamTimeout)
    }

    // We expect our barcode scanner to send character by character.
    let charByChar = event.key.length === 1
    // We expect our input can safely be processed; we leave entry with on-the-fly editing to form controls
    let fromFormControl =
      event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA'
    let notOurScope = !charByChar || fromFormControl

    if (notOurScope) {
      //console.log(`process characters: '${event.key}' in stream: '${stream}'`)
      if (event.key === 'Enter') {
        // Do not wait for new characters
        settleStream()
        return
      } else if (!allowedModifiers.includes(event.key)) {
        clearTimeout(streamTimeout)
        stream = ''
        return
      }
      // With allowedModifiers we want to set a new timeout
    } else {
      stream += event.key
    }

    streamTimeout = setTimeout(settleStream, safeIntermission)
  }

  window.addEventListener('keydown', streamHandler)

  return {
    publicAPI: {
      hotkey: collectionManagement.registerHotkey,
      barcode: collectionManagement.registerBarcode,
      overview: collectionManagement.overview,
    },
  }
})()

const charsAndChunks = charsAndChunksModule.publicAPI

export { charsAndChunks }
