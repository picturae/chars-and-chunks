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
        return typeof props.char === 'string' || props.char instanceof Array
      } else if (props.regex) {
        return props.regex instanceof RegExp
      }
    })()
    const contextOK = (function() {
      if (typeof props.context === 'string') {
        props.context = document.querySelector(props.context)
      }
      return typeof props.context === 'object' //props.context instanceof Node
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
  const registerMatch = function(props) {
    props.match = props.char || props.regex
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
      registerMatch(props)
      //console.log(`hotkey registered: ${props.char}`)
      return props
    }
  }

  const registerHotkeys = function(propsList) {
    let refsList = []
    propsList.forEach(props => {
      let refs = registerHotkey(props)
      if (refs) refsList.push(refs)
    })
    return refsList
  }

  /**
   * Find the right data for hotkey
   * @param {string} char
   * @returns {object} data object
   */
  const hotkeyHandler = function(char) {
    //console.log('hotkeyHandler ' + char)
    if (char === '?') {
      toggleOverviewPanel()
    } else {
      let handle = dataLockBox.retrieve({ entry: char })
      if (!handle) {
        const records = dataLockBox.overview()
        records.some(record => {
          if (record.match instanceof Array && record.match.includes(char)) {
            handle = dataLockBox.retrieve({ entry: record.match })
            //console.log(`handle found: ${handle.comment}`)
          }
          return Boolean(handle)
        })
      }
      return handle
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
      registerMatch(props)
      //console.log(`barcode registered: ${props.regex}`)
      return props
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
    return dataLockBox.retrieve({ entry: regex })
  }

  /**
   * Generate a list of active entries
   * @returns {object}
   */
  const overviewJson = function() {
    let handles = {}
    const records = dataLockBox.overview()

    records.forEach(record => {
      if (
        record.box &&
        (typeof record.match === 'string' || record.match instanceof Array)
      ) {
        let toEndUser = {
          match: record.match.toString().replace(/(.+),(.+)/g, '$1, $2'),
          comment: record.box.comment,
        }
        handles.hotkeys = handles.hotkeys
          ? handles.hotkeys.concat([toEndUser])
          : [toEndUser]
      }
      if (record.box && record.match instanceof RegExp) {
        let toEndUser = {
          match: 'barcode', //record.match.toString(),
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
   * Coerce a screen in the html - public toggle function
   */
  let toggleOverviewPanel = function() {
    appendOverviewHtml()
  }

  /**
   * Coerce a screen in the html - append function
   * @private
   */
  const appendOverviewHtml = function() {
    const handles = overviewJson()

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
    const writeMatches = function(prop) {
      let str = `<thead><tr><th colspan="2">${prop}</th><tr></thead><tbody>`
      for (let item of handles[prop] || []) {
        str += `<tr><th>${item.match}</th><td>${item.comment}</td></tr>`
      }
      return str + `</tbody>`
    }
    if (handles.hotkeys) {
      htmlString += writeMatches('hotkeys')
    }
    if (handles.barcodes) {
      htmlString += writeMatches('barcodes')
    }
    if (!handles.hotkeys && !handles.barcodes) {
      htmlString += writeMatches('no hotkeys or barcodes configured')
    }

    htmlString += `</table>`
    let panel = document.createElement('chars-and-chuncks-panel')
    panel.innerHTML = svgString + htmlString

    // apply
    dataLockBox.overlay()
    document.body.appendChild(panel)
    panel
      .querySelector('table:first-of-type')
      .addEventListener('click', removeOverviewHtml)
    panel
      .querySelector('svg:first-of-type')
      .addEventListener('click', removeOverviewHtml)

    // direct the toggle
    toggleOverviewPanel = function() {
      removeOverviewHtml()
    }
  }

  /**
   * Remove the open help-screen in the html
   * @private
   */
  const removeOverviewHtml = function(event) {
    const panel = document.querySelector('chars-and-chuncks-panel')
    panel
      .querySelector('table:first-of-type')
      .removeEventListener('click', removeOverviewHtml)
    panel
      .querySelector('svg:first-of-type')
      .removeEventListener('click', removeOverviewHtml)
    panel.remove()
    dataLockBox.revive()
    toggleOverviewPanel = function() {
      appendOverviewHtml()
    }
  }

  /*
   * Make object in context eligible for garbage collection
   * @param {object} context
   */
  const cleanup = function(sanitisedProps) {
    dataLockBox.cleanup(sanitisedProps.context)
  }

  return {
    registerHotkey: function(props) {
      const saneProps = registerHotkey(props)
      return function() {
        if (saneProps && saneProps.context) cleanup(saneProps)
      }
    },
    registerHotkeys: function(propsList) {
      const sanePropsList = registerHotkeys(propsList)
      return function() {
        sanePropsList.forEach(saneProps => {
          if (saneProps && saneProps.context) cleanup(saneProps)
        })
      }
    },
    hotkeyHandler: hotkeyHandler,
    registerBarcode: function(props) {
      const saneProps = registerBarcode(props)
      return function() {
        if (saneProps && saneProps.context) cleanup(saneProps)
      }
    },
    barcodeHandler: barcodeHandler,
    overviewJson: overviewJson,
    overviewPanel: toggleOverviewPanel,
    reset: dataLockBox.reset,
    overlay: dataLockBox.overlay,
    revive: dataLockBox.revive,
  }
})()

export { collectionManagement }
