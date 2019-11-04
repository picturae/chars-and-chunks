import { dataLockBox } from './dataLockBox'

const collectionManagement = (function() {
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
        return typeof props.char === 'string'
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
      if (location.port) console.log(props)
    }
    return OK
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @private
   * @param {object} props
   *    @member {string} char (conditionally optional)
   *    @member {RegExp} regex (conditionally optional)
   *    @member {object} context - Node
   *    @member {function} callback
   *    @member {string} comment (optional)
   */
  const registerEntry = function(props) {
    props.entry = props.char || props.regex
    props.box = {
      callback: props.callback,
      comment: props.comment,
    }
    dataLockBox.store(props)
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
   * Check for the node being inside the DOM
   * @private
   * @param {Node} node
   * @returns {boolean} boolean - true when the node is onscreen -- not removed
   */
  const isAttached = function(elm) {
    return (
      elm &&
      (elm.getRootNode() instanceof Document ||
        elm.getRootNode() instanceof ShadowRoot)
    )
  }

  /**
   * Find the right data for hotkey
   * @param {string} char
   * @returns {object} data object
   */
  const hotkeyHandler = function(char) {
    return dataLockBox.retrieve({ entry: char }, isAttached)
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
   * Find the lengthiest RegExp for barcode
   * @private
   * @param {string} barcode
   * @returns {RegExp}
   */
  const barcodeMatch = function(barcode) {
    let regex = catchAllRegExp
    const keys = dataLockBox.keys()

    for (let key of keys) {
      if (key instanceof RegExp && key.test(barcode)) {
        // find the most complex RegExp
        if (key.toString().length > regex.toString().length) {
          regex = key
        }
      }
    }
    return regex
  }

  /**
   * Find the right data for barcode
   * @param {string} barcode
   * @returns {object} data object
   */
  const barcodeHandler = function(barcode) {
    const regex = barcodeMatch(barcode)
    return dataLockBox.retrieve({ entry: regex }, isAttached)
  }

  /**
   * Generate a list of active entries (those with a valid context)
   * @returns {object}
   */
  const overview = function(records) {
    let handles = {}

    records.forEach(record => {
      if (record.box && typeof record.entry === 'string') {
        let toEndUser = {
          entry: record.entry,
          comment: record.box.comment,
        }
        handles.hotkey = handles.hotkey
          ? handles.hotkey.concat([toEndUser])
          : [toEndUser]
      }
      if (record.box && record.entry instanceof RegExp) {
        let toEndUser = {
          entry: 'barcode', //record.entry.toString(),
          comment: record.box.comment,
        }
        handles.barcode = handles.barcode
          ? handles.barcode.concat([toEndUser])
          : [toEndUser]
      }
    })
    //console.log('overview:\n' + JSON.stringify(handles))
    return handles
  }

  return {
    registerHotkey: registerHotkey,
    hotkeyHandler: hotkeyHandler,
    registerBarcode: registerBarcode,
    barcodeHandler: barcodeHandler,
    overview: function() {
      return overview(dataLockBox.overview(isAttached))
    },
    reset: dataLockBox.reset,
    overlay: dataLockBox.overlay,
    revive: dataLockBox.revive,
  }
})()

export { collectionManagement }
