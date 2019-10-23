# Chars and Chunks

Chars and Chunks catches single keystrokes and input from barcode scanners in
such way these can used to set the flow of a webapp.

While keystrokes are mapped to a character (yes!), barcodes match a
regular expression. When a keystroke or barcode is caught, its context (an
element in the document) is matched. When the context is inside the document tree,
the callback function is called with the keystroke or barcode as an argument.

Chars and Chunks offers a overview of effective keys and barcodes.

Chars and Chunks will not interfere when the user types text in input fields
or textareas.

## Install

Install the package as npm package. You can require the package or use it as
a module.

## Usage

To set up a hotkey an object with members char, context and callback is needed.
* 'char' is the hotkey
* 'context' is a reference an element, i.e. the top element in a controlled view
* 'callback' the function to execute
* 'comment' a comment or description of the callback function
Member comment is optional, but can be used to present an overview of
hotkeys and barcodes.

    let header = document.querySelector('header')
    let logH = function () {console.log('h pressed')}
    charsAndChunks.hotkey ({ char: 'h', context: header, callback: logH })

    let main = document.querySelector('main')
    let logM = () => {console.log('m pressed')}
    charsAndChunks.hotkey ({ char: 'm', context: main, callback: logM, comment: 'Prints "m pressed" in the console' })

    let customfooter = document.querySelector('customfooter')
    function logF () {console.log('f pressed')}
    charsAndChunks.hotkey ({ char: 'f', context: customfooter, callback: logF })

To set up a barcode the same object can be used, with member regex instead of char.
* 'regex' is the regular expression your barcode needs to match.
When regex is omitted, all barcodes are valid:

    let header = document.querySelector('header')
    let logAnyBarcode = function () {console.log('any barcode scanned')}
    charsAndChunks.barcode ({ context: header, callback: logAnyBarcode })

    let main = document.querySelector('main')
    let logAllDigitBarcode = () => {console.log('all-digit barcode scanned')}
    charsAndChunks.barcode ({ regex: /^\d+$/, context: main, callback: logAllDigitBarcode, comment: 'Prints "all-digit barcode scanned" in the console' })

    let customfooter = document.querySelector('customfooter')
    function logHyphenSeperatedBarcode () {console.log('hyphen seperated barcode scanned')}
    charsAndChunks.barcode ({ regex: /^\w+-\w+$/, context: customfooter, callback: logHyphenSeperatedBarcode })

To get an overview of effective keys and barcodes, completed with a comment:

    charsAndChunks.overview()

## Disclaimer

Chars and Chunks does not attempt to avoid clashes with accesskeys. When you
configure a keystroke for an accesskey to be a hotkey, both the accesskey and
the hotkey are executed. Avoid clashes with accesskeys by not configuring
keystrokes combined with an Alt-key or Option-key.
