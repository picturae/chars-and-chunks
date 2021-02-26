import { dataLockBox } from './dataLockBox'

const collectionManagement = (function() {
  /**
   * Check sanity of a registration object
   * @private
   * @param {object} props
   * @returns {boolean}
   */
  const registrationSanity = function(props) {
    const matchOK =
      props.match &&
      props.match.toString().length &&
      (typeof props.match === 'string' || props.match instanceof RegExp)
    const contextOK = (function() {
      if (typeof props.context === 'string') {
        props.context = document.querySelector(props.context)
      }
      return props.context && typeof props.context === 'object'
      //props.context instanceof Node
    })()
    const callbackOK = typeof props.callback === 'function'
    const descriptionOK =
      typeof props.description === 'string' && props.description.length
    const OK = matchOK && contextOK && callbackOK && descriptionOK

    // if (!OK) {
    //   console.log(`!OK ${JSON.stringify(props)}`)
    //   console.log(`
    //     matchOK: ${matchOK}, contextOK: ${contextOK},
    //     callbackOK: ${callbackOK}, descriptionOK: ${descriptionOK}
    //   `)
    // }
    return OK
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @private
   * @param {object} props
   *    @member {string || RegExp} match
   *    @member {object} context - Node
   *    @member {function} callback
   *    @member {string} description
   */
  const registerMatch = function(props) {
    props.box = {
      callback: props.callback,
      description: props.description,
    }
    dataLockBox.store(props)
  }

  /**
   * Register a context to trigger a function when the character is pressed
   * @param {object} props
   * @param {object} context - only required for resursive calls
   */
  const register = function(
    props,
    context = {
      time: Date.now(),
      random: Math.floor(Math.random() * Math.floor(99999)),
    },
  ) {
    if (props instanceof Array) {
      // bulk registration
      props.forEach(matchProps => {
        register(matchProps, context)
      })
    } else {
      props.context = context

      // object registration
      if (props.match instanceof Array) {
        // mulltiple match registration
        props.match.forEach(matchItem => {
          const matchProps = {
            ...props,
            match: matchItem,
          }
          register(matchProps, context)
        })
      } else {
        // simple flow
        if (registrationSanity(props)) {
          registerMatch(props)
        }
      }
    }

    // return a cleanup function
    const cleanUpFn = function() {
      dataLockBox.cleanup(context)
    }
    return cleanUpFn
  }

  /**
   * Find the right data for hotkey
   * @param {string} match
   * @returns {object} data object
   */
  const hotkeyHandler = function(char) {
    // console.log('hotkeyHandler ' + char)
    if (char === '?') {
      toggleOverviewPanel()
    } else {
      let handle = dataLockBox.retrieve({ entry: char })
      if (!handle) {
        const records = dataLockBox.overview()
        records.some(record => {
          if (record.match instanceof Array && record.match.includes(char)) {
            handle = dataLockBox.retrieve({ entry: record.match })
            // console.log(`handle found: ${handle.description}`)
          }
          return Boolean(handle)
        })
      }
      return handle
    }
  }

  /**
   * Find the lengthiest RegExp for barcode
   * @private
   * @param {string} barcode
   * @returns {RegExp}
   */
  const barcodeMatch = function(barcode) {
    let regex = ''
    const keys = dataLockBox.keys()

    for (let key of keys) {
      // console.log('examine regex:', key)
      if (key instanceof RegExp && key.test(barcode)) {
        // find the most complex RegExp
        if (key.toString().length > regex.toString().length) {
          regex = key
        }
        // console.log('matched regex:', key, ', pick:', regex)
      }
    }
    // console.log(`barcodeMatch: ${regex}`)
    return regex
  }

  /**
   * Find the right data for barcode
   * @param {string} barcode
   * @returns {object} data object
   */
  const barcodeHandler = function(barcode) {
    // console.log('barcodeHandler barcode', barcode)
    const pattern = barcodeMatch(barcode)
    // console.log('barcodeHandler pattern', pattern)
    const retrieved = dataLockBox.retrieve({ entry: pattern })
    // console.log('barcodeHandler retrieved ', retrieved)
    return retrieved
  }

  /**
   * Generate a list of active entries
   * @returns {object}
   */
  const overviewJson = function() {
    let records = dataLockBox.overview()

    // look for multiMatches
    let matchRecords = new Object()
    records.forEach(record => {
      var peers = records.filter(
        other =>
          other.box.callback === record.box.callback &&
          other.box.description === record.box.description,
      )
      if (peers.length > 1) {
        var matches = peers.map(peer => peer.match)
        matchRecords[matches] = 'box'
      }
    })

    // add multiMatches as one record, remove seperate records
    const multiMatches = Object.keys(matchRecords)
    multiMatches.forEach(multiMatch => {
      const multiMatchArray = multiMatch.split(',')
      multiMatchArray.forEach((matchItem, matchIndex) => {
        records = records.map(record => {
          if (record && record.match === matchItem) {
            if (!matchIndex) {
              // replace first matchItem
              record = {
                ...record,
                match: multiMatch.replace(/,(\S)/g, ', $1'),
              }
            } else {
              // remove rest of matchItems
              record = null
            }
          }
          return record
        })
      })
    })

    // split in keystrokes and barcodes
    let handles = {}
    records.forEach(record => {
      if (record && record.box && typeof record.match === 'string') {
        let toEndUser = {
          match: record.match,
          description: record.box.description,
        }
        handles.hotkeys = handles.hotkeys
          ? handles.hotkeys.concat([toEndUser])
          : [toEndUser]
      }
      if (record && record.box && record.match instanceof RegExp) {
        let toEndUser = {
          match: 'barcode', //record.match.toString(),
          description: record.box.description,
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
    // initial direction; the other is removeOverviewHtml
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
        str += `<tr><th>${item.match}</th><td>${item.description}</td></tr>`
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
  const removeOverviewHtml = function() {
    const panel = document.querySelector('chars-and-chuncks-panel')
    panel
      .querySelector('table:first-of-type')
      .removeEventListener('click', removeOverviewHtml)
    panel
      .querySelector('svg:first-of-type')
      .removeEventListener('click', removeOverviewHtml)
    panel.remove()
    dataLockBox.revive()

    // direct the toggle
    toggleOverviewPanel = function() {
      appendOverviewHtml()
    }
  }

  return {
    register: register,
    hotkeyHandler: hotkeyHandler,
    barcodeHandler: barcodeHandler,
    overviewJson: overviewJson,
    overviewPanel: toggleOverviewPanel,
    reset: dataLockBox.reset,
    overlay: dataLockBox.overlay,
    revive: dataLockBox.revive,
  }
})()

export { collectionManagement }
