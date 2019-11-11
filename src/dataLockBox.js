const dataLockBox = (function() {
  /**
   * Definition of storage structure
   * @member {Map} lock - Map of characters and regular expressions holding a context.
   * @member {WeakMap} box - WeakMap of contexts holding an object with a single charcter, a callback and optionally a comment
   */
  const LockBoxModel = function() {
    this.lock = new Map()
    this.box = new WeakMap()
  }

  let data = new LockBoxModel()

  let stash = []

  /**
   * Snaity check for storage
   * @private
   * @returns {boolean} is sane
   */
  const storageSanity = function(props) {
    const OK = typeof props.context === 'object'
    if (!OK) {
      console.error('Cannot store')
    }
    return OK
  }

  /**
   * Store a user entry and a context as lock
   * and a context as a box with entries holding data
   * @private
   * @param {object} props
   *    @member {primitive | object} entry
   *    @member {object} context
   *    @member {primitive | object} box - the data itself
   */
  const store = function(props) {
    if (!storageSanity(props)) return
    // Register context with string or regular expression in a Map
    data.lock.set(props.entry, props.context)
    if (!data.box.has(props.context)) {
      data.box.set(props.context, {})
    }
    // Register data with context in a WeakMap
    data.box.get(props.context)[props.entry] = props.box
  }

  /**
   * Find the right data for entry
   * @param {object} props
   *   @member {string} entry - key for the lock map
   * @returns {object} stored data object
   */
  const retrieve = function(props) {
    //console.log(`entry to handle: ${props.entry}`)

    if (data.lock.has(props.entry)) {
      // find context from lock,
      let context = data.lock.get(props.entry)
      if (context && data.box.has(context)) {
        return data.box.get(context)[props.entry]
      }
    }
  }

  /**
   * Generate a list of active entries (those with a not-cleaned-up context)
   * @returns {Array} records
   */
  const overview = function() {
    let records = []
    const keys = data.lock.keys()

    for (let key of keys) {
      let box = retrieve({ entry: key })
      if (data.lock.get(key)) {
        let record = { entry: key, box: box }
        records.push(record)
      }
    }
    //console.log('overview' + JSON.stringify(records))
    return records
  }

  /**
   * Clear all entries and data
   */
  const reset = function() {
    data = new LockBoxModel()
  }

  /*
   * Disable all current data en put up a clean storage
   */
  const overlay = function() {
    stash.push(Object.assign({}, data))
    reset()
    //console.log(`go to stack level ${stash.length}`)
  }

  /*
   * Remove the superseded data and enable the previous data
   */
  const revive = function() {
    if (stash.length) {
      //console.log(`remove stack level ${stash.length}`)
      data = stash.pop()
    }
  }

  /*
   * Remove references to contexts
   * @param {object} context
   */
  const cleanup = function(context) {
    data.lock.forEach((entryVal, entry) => {
      if (data.lock.get(entry) === context) {
        //console.log(`cleanup '${data.box.get(context)[entry].comment}'`)
        data.lock.set(entry, undefined)
      }
    })
    data.box.delete(context)
  }

  return {
    store: store,
    retrieve: retrieve,
    keys: function() {
      return data.lock.keys()
    },
    overview: overview,
    reset: reset,
    overlay: overlay,
    revive: revive,
    cleanup: cleanup,
  }
})()

export { dataLockBox }
