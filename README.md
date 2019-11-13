# Chars and Chunks

Chars and Chunks catches single keystrokes and input from barcode scanners in
such way these can used to help create the flow of a webapp.

While keystrokes are mapped to a character, barcodes match a
regular expression. When a keystroke or barcode is caught,
it's context is checked to be registered and when so,
the callback function is called with the keystroke or barcode as an argument.

When an overlay is shown the set of hotkeys and barcodes can temporarily be
suppressed en replaced by a new set.

Chars and Chunks offers a overview of effective keys and barcodes.

Chars and Chunks will not interfere when the user types text in input fields,
textareas or selection lists.

## Install

Install the package as npm package. You can require the package or use it as
a module.

## Usage

To set up a hotkey an object with members char, context and callback is needed.
* 'char' is the hotkey, could be modified with shift or control or keys like 'Backspace' or 'ArrowUp'
* 'context' is an element or a querySelector for an element, i.e. the top element in a controlled view
* 'callback' the function to execute
* 'comment' a comment or description of the callback function, to be used in the overview

    const header = document.querySelector('header')
    const logH = function () {console.log('h pressed')}
    charsAndChunks.hotkey ({ char: 'h', context: header, callback: logH })

    const logM = () => {console.log('ctrl+m pressed')}
    charsAndChunks.hotkey ({ char: 'ctrl+m', context: 'main', callback: logM, comment: 'Prints "m pressed" in the console' })

    function logF () {console.log('f pressed')}
    charsAndChunks.hotkey ({ char: 'Backspace', context: 'customfooter', callback: logF })

    function logZoom () {console.log('zoom in')}
    charsAndChunks.hotkey ({ char: ['+', '='], context: 'canvas', callback: logZoom })

There is also bulk intake function for hotkeys, using an array of the same objects used for the hotkey function:

    const cleanupHotkeyRefs = charsAndChunks.hotkeys ([{...},{...},{...},{...}])

To set up a barcode the same object can be used, with member regex instead of char.
* 'regex' is the regular expression your barcode needs to match.

When regex is omitted, all barcodes are valid:

    const header = document.querySelector('header')
    const logAnyBarcode = function () {console.log('any barcode scanned')}
    const cleanupHeaderRefs = charsAndChunks.barcode ({ context: header, callback: logAnyBarcode })

    const logAllDigitBarcode = () => {console.log('all-digit barcode scanned')}
    const cleanupMainRefs = charsAndChunks.barcode ({ regex: /^\d+$/, context: 'main', callback: logAllDigitBarcode, comment: 'Prints "all-digit barcode scanned" in the console' })

    function logHyphenSeperatedBarcode () {console.log('hyphen seperated barcode scanned')}
    const cleanupFooterRefs = charsAndChunks.barcode ({ regex: /^\w+-\w+$/, context: 'footer', callback: logHyphenSeperatedBarcode })

When the controller or the element is destroyed, the function returned when registering
the hotkey or barcode needs to executed to unregister:

    const cleanupHotkeyRefs = charsAndChunks.hotkey (...
    const cleanupBarcodeRefs = charsAndChunks.barcode (...
    controller.ondestroy = function () {}
      cleanupHotkeyRefs()
      cleanupBarcodeRefs()
    }

With an overlay, the existing listeners can be suppressed en new ones can be set:

    charsAndChunks.overlay()
    charsAndChunks.hotkey (....

When the overlay is closed, the temporary situation is abandoned:

    charsAndChunks.revive()

To get an onscreen overview of effective keys and barcodes press "?" key or:

    charsAndChunks.help()

To get a JSON with an overview of effective keys and barcodes:

    charsAndChunks.overview()

To reset the current set of hotkeys and barcodes:

    charsAndChunks.reset()

## Disclaimer

Chars and Chunks does not attempt to avoid clashes with accesskeys. When you
configure a keystroke for an accesskey to be a hotkey, both the accesskey and
the hotkey are executed. Avoid clashes with accesskeys by not configuring
keystrokes combined with an Alt-key or Option-key.

Shift and Alt keys alone can not be used as hotkey,
since these produce new characters that might be used in barcodes.
