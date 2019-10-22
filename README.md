# Chars and Chunks

Chars and Chunks catches single keystrokes and input from barcode scanners in
such way these can used to set the flow of a webapp.

While keystrokes are mapped to a character (yes), barcodes match a
regular expression.

Chars and Chunks will not interfere when the user types text in input fields
or textareas.

The effectivity of a keystroke or a barcode scan can be tied to for example,
the top HTML element in a view where the functionality is meaningfull.

Chars and Chunks offers a overview of effective keys and barcodes.

## Install

Install the package as npm package. You can require the package or use it as
a module.

## Useage

To set up a hotkey an object with members char, context and callback is needed.
Member comment is optional, but can be used to present an overview of
hotkeys and barcodes.

    let header = document.querySelector('header')
    let logH = function () {console.log('h pressed')}
    charsAndChuncks.hotkey ({ char: 'h', context: header, callback: logH })

    let main = document.querySelector('main')
    let logM = () => {console.log('m pressed')}
    charsAndChuncks.hotkey ({ char: 'm', context: main, callback: logM, comment: 'Prints "m pressed" in the console' })

    let customfooter = document.querySelector('customfooter')
    function logF () {console.log('f pressed')}
    charsAndChuncks.hotkey ({ char: 'f', context: customfooter, callback: logF })

To set up a barcode the same object can be used, with member regex instead of char. When regex is omitted, all barcodes are valid:

    let header = document.querySelector('header')
    let logAnyBarcode = function () {console.log('any barcode scanned')}
    charsAndChuncks.barcode ({ context: header, callback: logAnyBarcode })

    let main = document.querySelector('main')
    let logAllDigitBarcode = () => {console.log('all-digit barcode scanned')}
    charsAndChuncks.barcode ({ regex: /^\d+$/, context: main, callback: logAllDigitBarcode, comment: 'Prints "all-digit barcode scanned" in the console' })

    let customfooter = document.querySelector('customfooter')
    function logHyphenSeperatedBarcode () {console.log('hyphen seperated barcode scanned')}
    charsAndChuncks.barcode ({ regex: /^\w+-\w+$/, context: customfooter, callback: logHyphenSeperatedBarcode })

To get an overview of effective keys and barcodes, completed with a comment:

    charsAndChuncks.overview()
