
const charChuncks = (function () {

  /**
   * Map of contexts holding an object with a single charcter, a callback and optionally a comment
   */
  let jobs = new WeakMap ()

  /**
   * Register a context to trigger a function when the character is pressed
   * @param {string} character - single character
   * @param {object} context - HTMLElement | disposable javascript instance
   * @param {function} callback
   * @param {string} comment (optional)
   */
  const hotkey = function (character, context, callback, comment) {
    console.log('hotkey called')
  }

  /**
   * Register a context to trigger a function when any barcode is encountered
   * @param {object} context - HTMLElement | disposable javascript instance
   * @param {function} callback
   * @param {string} comment (optional)
   */
  const barcode = function (context, callback, comment) {
    console.log('barcode called')
  }

  /**
   * Generate a list of active hotkeys and barcode watchers, optionally with their purpose
   * @returns {HTMLElement} normalised input
   */
  const overview = function () {
    console.log('keyOverview called')
  }

  return {
    hotkey: hotkey,
    evaluate: evaluate,
    overview: overview,
  }

})()
