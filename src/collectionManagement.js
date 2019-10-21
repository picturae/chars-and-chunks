const collectionManagement = (function() {
  /**
   * Map of contexts holding an object with a single charcter, a callback and optionally a comment
   */
  let references = new WeakMap()
  let requests = new Map()
  /**
   * Default regular expression.
   */
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
    if (!props.comment) {
      props.comment = `callback for ${props.char || 'barcode'}`
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
   * Get valid data
   * @private
   * @param {Node} context
   * @param {string | RegExp} entry
   * @returns {object} data object
   */
  const getHandle = function(context, entry) {
    if (context && context.parentNode && references.has(context)) {
      return references.get(context)[entry]
    }
    // should we garbage collect programatically?
  }

  /**
   * Find the right data
   * @private
   * @param {string | RegExp} entry
   * @returns {object} data object
   */
  const entryHandler = function(entry) {
    if (requests.has(entry)) {
      let requestedContext = requests.get(entry)
      return getHandle(requestedContext, entry)
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
   * @returns {object}
   */
  const overview = function() {
    console.log('overview called')
    let handles = { hotkey: [], barcode: [] }

    requests.forEach((context, entry) => {
      if (typeof entry === 'string') {
        let handle = {
          entry: entry,
          comment: getHandle(context, entry).comment,
        }
        handles.hotkey.push(handle)
      }
    })

    requests.forEach((context, entry) => {
      if (entry instanceof RegExp) {
        let handle = {
          entry: 'barcode', //entry.toString(),
          comment: getHandle(context, entry).comment,
        }
        handles.barcode.push(handle)
      }
    })
    console.log(handles)
    return handles
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
