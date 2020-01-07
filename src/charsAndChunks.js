import { collectionManagement } from './collectionManagement'
import { config } from './configuration'

const charsAndChunksModule = (function() {
  // modifiers allowed to compose a character
  const allowedModifiers = ['Shift', 'Alt']

  // Process variables
  let streamTimeout = 0
  let stream = []

  const settleStream = function(event) {
    // We only deal with single characters or barcodes.
    let settle = stream.join('')
    if (stream.length >= config.minimalBarcodeLength) {
      //console.log(`handle as barcode: ${settle} (${stream.length})`)
      let handle = collectionManagement.barcodeHandler(settle)
      if (handle) {
        handle.callback(settle)
      }
    } else if (stream.length === 1) {
      //console.log(`handle as character: ${settle} (${stream.length})`)
      if (event.ctrlKey) settle = `ctrl+${settle}`
      let handle = collectionManagement.hotkeyHandler(settle)
      if (handle) {
        handle.callback(settle)
      }
    } else {
      //console.log(`invalid stream length: ${stream.length} (${settle})`)
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
      // console.log(`out of scope: '${event.key}' in stream: '${stream}'`)
      if (stream.length && event.key === 'Enter') {
        settleStream(event)
        return
      } else if (!allowedModifiers.includes(event.key)) {
        // pageDown, Tab, Backspace, etc.
        // Do not use previous characters also
        stream = [event.key]
        settleStream(event)
        return
      }
      // With allowedModifiers we want to set a new timeout
    } else {
      // barcode characters pass here
      stream.push(event.key)
    }

    streamTimeout = setTimeout(settleStream, config.safeIntermission, event)
  }

  window.addEventListener('keydown', streamHandler)

  const configure = function(change) {
    Object.getOwnPropertyNames(change).forEach(prop => {
      const oldValue = config[prop]
      const newValue = change[prop]
      if (typeof oldValue === typeof newValue) {
        config[prop] = newValue
      }
    })
  }

  return {
    publicAPI: {
      config: configure,
      register: collectionManagement.register,
      hotkey: collectionManagement.registerHotkey,
      hotkeys: collectionManagement.registerHotkeys,
      barcode: collectionManagement.registerBarcode,
      overview: collectionManagement.overviewJson,
      help: collectionManagement.overviewPanel,
      reset: collectionManagement.reset,
      overlay: collectionManagement.overlay,
      revive: collectionManagement.revive,
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
