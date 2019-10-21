import { collectionManagement } from './collectionManagement.js'

const charsAndChuncksModule = (function() {
  // Maximum time the barcode scanner takes to send the next character
  let transmissionDelayLimit = 30
  // General treshold to prevent accidental elbow on keyboard proceesing
  let minimalBarcodeLength = 6
  // Process variables
  let streamTimeout = 0
  let stream = ''

  const streamHandler = function(event) {
    console.log(`input: ${event.key}`)
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
      console.log(`process characters: ${event.key}`)
      console.log(`process target: ${event.target.tagName}`)
      clearTimeout(streamTimeout)
      stream = ''
      return
    }

    stream += event.key

    streamTimeout = setTimeout(function() {
      // We only deal with single characters or barcodes.
      if (stream.length >= minimalBarcodeLength) {
        console.log(`handle as barcode: ${stream} (${stream.length})`)
      } else if (stream.length === 1) {
        console.log(`handle as character: ${stream} (${stream.length})`)
        let handle = collectionManagement.hotkeyHandler(stream)
        if (handle) {
          handle.callback()
        }
      } else {
        console.log(`invalid stream length: ${stream.length} (${stream})`)
      }
      stream = ''
    }, transmissionDelayLimit)
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

const charsAndChuncks = charsAndChuncksModule.publicAPI

export { charsAndChuncks }
