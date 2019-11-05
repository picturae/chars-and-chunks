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
    if (char === '?') {
      appendOverviewHtml()
    } else {
      return dataLockBox.retrieve({ entry: char }, isAttached)
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
  const overview = function() {
    let handles = {}
    const records = dataLockBox.overview(isAttached)

    records.forEach(record => {
      if (record.box && typeof record.entry === 'string') {
        let toEndUser = {
          entry: record.entry,
          comment: record.box.comment,
        }
        handles.hotkeys = handles.hotkeys
          ? handles.hotkeys.concat([toEndUser])
          : [toEndUser]
      }
      if (record.box && record.entry instanceof RegExp) {
        let toEndUser = {
          entry: 'barcode', //record.entry.toString(),
          comment: record.box.comment,
        }
        handles.barcodes = handles.barcodes
          ? handles.barcodes.concat([toEndUser])
          : [toEndUser]
      }
    })
    //console.log('overview:\n' + JSON.stringify(handles))
    return handles
  }

  /**
   * Coerce a screen in the html
   */
  const appendOverviewHtml = function() {
    const handles = overview()

    // build
    let svgString = `
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    	 viewBox="0 0 507.2 507.2" style="enable-background:new 0 0 507.2 507.2;" xml:space="preserve">
    <circle fill="#000000" cx="253.6" cy="253.6" r="253.6"/>
    <path fill="#FFFFFF" d="M373.6,309.6c11.2,11.2,11.2,30.4,0,41.6l-22.4,22.4c-11.2,11.2-30.4,11.2-41.6,0l-176-176
    	c-11.2-11.2-11.2-30.4,0-41.6l23.2-23.2c11.2-11.2,30.4-11.2,41.6,0L373.6,309.6z"/>
    <path fill="#FFFFFF" d="M309.6,133.6c11.2-11.2,30.4-11.2,41.6,0l23.2,23.2c11.2,11.2,11.2,30.4,0,41.6L197.6,373.6
    	c-11.2,11.2-30.4,11.2-41.6,0l-22.4-22.4c-11.2-11.2-11.2-30.4,0-41.6L309.6,133.6z"/>
    </svg>
    `
    let htmlString = `<table>`
    const writeEntries = function(prop) {
      let str = `<thead><th colspan="2">${prop}</th></thead><tbody>`
      for (let item of handles[prop]) {
        str += `<tr><th>${item.entry}</th><td>${item.comment}</td></tr>`
      }
      return str + `</tbody>`
    }
    if (handles.hotkeys) {
      htmlString += writeEntries('hotkeys')
    }
    if (handles.barcodes) {
      htmlString += writeEntries('barcodes')
    }

    htmlString += `</table>`
    let panel = document.createElement('chars-and-chuncks-panel')
    panel.innerHTML = svgString + htmlString

    // apply
    dataLockBox.overlay()
    document.body.appendChild(panel)
    let panelSVG = panel.querySelector('svg')
    panelSVG.addEventListener('click', function() {
      panel.remove()
      dataLockBox.revive()
    })
  }

  return {
    registerHotkey: registerHotkey,
    hotkeyHandler: hotkeyHandler,
    registerBarcode: registerBarcode,
    barcodeHandler: barcodeHandler,
    overview: overview,
    reset: dataLockBox.reset,
    overlay: dataLockBox.overlay,
    revive: dataLockBox.revive,
    appendOverviewHtml: appendOverviewHtml,
  }
})()

export { collectionManagement }
