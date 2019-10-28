const collectionManagement = (function() {
  /**
   * Map of contexts holding an object with a single charcter, a callback and optionally a comment
   */
  let references
  /**
   * Map of characters and regular expressions holding a context.
   */
  let requests

  /**
   * Resuseable function for creating blank data objects
   */
  const createRunDataObjects = function() {
    references = new WeakMap()
    requests = new Map()
  }
  createRunDataObjects()

  /**
   * Default regular expression.
   */
  const catchAllRegExp = /^/

  /**
   * Check sanity of a registration object
   * @private
   * @param {object} props
   */
  const registrationSanity = function(props) {
    const matchOK = (function() {
      if (props.char) {
        return typeof props.char === 'string' && props.char.length === 1
      } else if (props.regex) {
        return props.regex instanceof RegExp
      }
    })()
    const contextOK = (function() {
      if (typeof props.context === 'string') {
        props.context = document.querySelector(props.context)
      }
      return props.context instanceof Node
    })()
    const callbackOK = typeof props.callback === 'function'
    // check optional comment
    if (!props.comment || typeof props.comment !== 'string') {
      props.comment = `callback for ${props.char || 'barcode'}`
    }
    const OK = matchOK && contextOK && callbackOK
    if (!OK) {
      console.error('Wrong properties for registering hotkeys or barcodes!')
      //console.log(props)
    }
    return OK
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @param {object} props
   *    @member {string} char (optional)
   *    @member {RegExp} regex (optional)
   *    @member {object} context - Node
   *    @member {function} callback
   *    @member {string} comment (optional)
   */
  const registerEntry = function(props) {
    const entry = props.char || props.regex

    // Register context with regular expression in a Map
    requests.set(entry, props.context)
    if (!references.has(props.context)) {
      references.set(props.context, {})
    }
    // Register data with context in a WeakMap
    references.get(props.context)[entry] = {
      callback: props.callback,
      comment: props.comment,
    }
  }

  /**
   * Register a context to trigger a function when the character is pressed
   * @param {object} props
   */
  const registerHotkey = function(props) {
    delete props.regex
    if (registrationSanity(props)) {
      registerEntry(props)
      //console.log(`hotkey registered: ${props.char}`)
    }
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
    //console.log(`entry to handle: ${entry}`)
    if (requests.has(entry)) {
      let requestedContext = requests.get(entry)
      return getHandle(requestedContext, entry)
    }
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @param {object} props
   */
  const registerBarcode = function(props) {
    delete props.char
    if (!props.regex) {
      props.regex = catchAllRegExp
    }
    if (registrationSanity(props)) {
      registerEntry(props)
      //console.log(`barcode registered: ${props.regex}`)
    }
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
    //console.log('overview called')
    let handles = { hotkey: [], barcode: [] }

    requests.forEach((context, entry) => {
      if (typeof entry === 'string') {
        let handle = getHandle(context, entry)
        if (handle) {
          let toEndUser = {
            entry: entry,
            comment: handle.comment,
          }
          handles.hotkey.push(toEndUser)
        }
      }
    })

    requests.forEach((context, entry) => {
      if (entry instanceof RegExp) {
        let handle = getHandle(context, entry)
        if (handle) {
          let toEndUser = {
            entry: 'barcode', //entry.toString(),
            comment: getHandle(context, entry).comment,
          }
          handles.barcode.push(toEndUser)
        }
      }
    })
    //console.log(handles)
    return handles
  }

  return {
    registerHotkey: registerHotkey,
    hotkeyHandler: entryHandler,
    registerBarcode: registerBarcode,
    barcodeHandler: barcodeHandler,
    overview: overview,
    reset: createRunDataObjects,
  }
})()

export { collectionManagement }
