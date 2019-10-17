const charChuncks = (function() {
  /**
   * Map of contexts holding an object with a single charcter, a callback and optionally a comment
   */
  let jobs = new WeakMap()

  // Maximum time the barcode scanner takes to send the next character
  let transmissionDelayLimit = 30
  // General treshold to prevent accidental elbow on keyboard proceesing
  let minimalBarcodeLength = 6
  // Process variables
  let streamTimeout = 0
  let stream = ''

  const streamHandler = function(event) {
    if (streamTimeout) {
      console.log(`input within time limits: ${event.key}`)
      clearTimeout(streamTimeout)
    } else {
      console.log(`initial input: ${event.key}`)
    }

    // We expect our barcode scanner to send charcter by character.
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
      } else {
        console.log(`invalid stream length: ${stream.length} (${stream})`)
      }
      stream = ''
    }, transmissionDelayLimit)
  }

  window.addEventListener('keydown', streamHandler)

  /**
   * Register a context to trigger a function when the character is pressed
   * @param {string} character - single character
   * @param {object} context - HTMLElement | disposable javascript instance
   * @param {function} callback
   * @param {string} comment (optional)
   */
  const hotkey = function(character, context, callback, comment) {
    console.log('hotkey called')
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @param {object} context - HTMLElement | disposable javascript instance
   * @param {function} callback
   * @param {string} comment (optional)
   */
  const barcode = function(context, callback, comment) {
    console.log('barcode called')
  }

  /**
   * Generate a list of active hotkeys and barcode watchers, optionally with their purpose
   * @returns {HTMLElement} normalised input
   */
  const overview = function() {
    console.log('overview called')
  }

  return {
    hotkey: hotkey,
    barcode: barcode,
    overview: overview,
  }
})()
