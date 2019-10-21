const collectionManagement = (function() {
  /**
   * Map of contexts holding an object with a single charcter, a callback and optionally a comment
   */
  let references = new WeakMap()
  let requests = new Map()
  // Process variables
  const catchAllRegExp = /^/

  const isSaneRegistration = function(props) {
    const matchOK = (function() {
      if (props.char) {
        return typeof props.char === 'string' && props.char.length === 1
      } else if (props.regex) {
        return props.regex instanceof RegExp
      }
    })()
    const contextOK = props.context instanceof Node
    const callbackOK = typeof props.callback === 'function'
    // check optional comment
    if (!props.comment || typeof props.comment !== 'string') {
      props.comment = props.callback.name || `callback for ${props.char}`
    }
    const OK = matchOK && contextOK && callbackOK
    if (!OK) {
      console.error('Wrong properties for registering hotkeys or barcodes!')
    }
    return OK
  }

  /**
   * Register a context to trigger a function when the character is pressed
   * @param {string} character - single character
   * @param {object} context - Node
   * @param {function} callback
   * @param {string} comment (optional)
   */
  const registerHotkey = function(props) {
    delete props.regex
    if (!isSaneRegistration(props)) {
      return
    }

    // Register context with character in a Map
    requests.set(props.char, props.context)
    if (!references.has(props.context)) {
      references.set(props.context, {})
    }
    // Register data with context in a WeakMap
    references.get(props.context)[props.char] = {
      callback: props.callback,
      comment: props.comment,
    }
    //console.log(`hotkey registered: ${props.char}`)
  }

  /**
   * Find the right data
   * @private
   * @param {string} character | {object} regular expression
   * @returns {object} data object
   */
  const entryHandler = function(entry) {
    if (requests.has(entry)) {
      let requestedContext = requests.get(entry)
      if (
        requestedContext &&
        requestedContext.parentNode &&
        references.has(requestedContext)
      ) {
        return references.get(requestedContext)[entry]
      }
      // should we garbage collect programatically?
    }
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @param {object} context - Node
   * @param {function} callback
   * @param {string} comment (optional)
   */
  const registerBarcode = function(props) {
    delete props.char
    if (!props.regex) {
      props.regex = catchAllRegExp
    }
    if (!isSaneRegistration(props)) {
      return
    }

    // Register context with regular expression in a Map
    requests.set(props.regex, props.context)
    if (!references.has(props.context)) {
      references.set(props.context, {})
    }
    // Register data with context in a WeakMap
    references.get(props.context)[props.regex] = {
      callback: props.callback,
      comment: props.comment,
    }
    //console.log(`barcode registered: ${props.regex}`)
  }

  /**
   * Find the right RegExp for barcode
   * @private
   * @param {string} barcode
   * @returns {RegExp}
   */
  const barcodeMatch = function(barcode) {
    var regex = catchAllRegExp

    requests.forEach((reqValue, reqKey) => {
      if (reqKey instanceof RegExp && reqKey.test(barcode)) {
        // find the most complex RegExp
        if (reqKey.toString().length > regex.toString().length) {
          regex = reqKey
        }
      }
    })
    return regex
  }

  /**
   * Find the right data
   * @private
   * @param {string} barcode
   * @returns {object} data object
   */
  const barcodeHandler = function(barcode) {
    const regex = barcodeMatch(barcode)
    return entryHandler(regex)
  }

  /**
   * Generate a list of active hotkeys and barcode watchers, optionally with their purpose
   * @returns {HTMLElement} normalised input
   */
  const overview = function() {
    console.log('overview called')
  }

  return {
    registerHotkey: registerHotkey,
    entryHandler: entryHandler,
    registerBarcode: registerBarcode,
    barcodeHandler: barcodeHandler,
    overview: overview,
  }
})()

export { collectionManagement }
