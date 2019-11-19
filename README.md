# Chars and Chunks

Chars and Chunks helps to create the flow of a webapp by
catching single keystrokes and input from barcode scanners.

When a hotkey is pressed the function registered with it is executed.
A barcode is matched against registered patterns and the code
registered with the lengthiest pattern will be runned.

## Install

Install the package as npm package. Chars and Chunks is available in
umd-format and as an es-module.

## Features

* There is one eventListener. It evaluates the key property of the keydown-event.
* An array of hotkeys can be registered, returning one cancel function.
* A barcode is evaluated when minimal 6 keystrokes are seen with an interval of
30 milliseconds at most.
* The hardcoded question mark hotkey shows and hides an overview the active
hotkeys and barcodes.
* The registrations can be layered. An overlay can be assigned a set of hotkeys
while the set of hotkeys registered at the main flow are temporarily suppressed.
These sets may overlap.
* One callback-function can be assigned to multiple hotkeys in one registration.
* A registration call returns a function cancelling the registration.
* Chars and Chunks does not deal with entries made in input fields,
textareas or selection lists.

## Usage

To register keystrokes as hotkeys or patterns for barcodes similar objects are
used. The properties are:

* char | regex: distinguishing property for hotkeys or barcodes.
* context: any object for the case you deal with. It could be an
    object in the controller, or a html element, or anything that might be
    invalid when the use case for the hotkey or barcode ended.
* callback: the function to execute when keystroke passed or the
pattern is matched.
* comment: a comment or description of the callback function,
    to be used in the overview

The entry property is different. As hotkey:

* char: The keyboard key, may be modified (with  Alt, Control, Shift or Meta).
    Since we use the key property of the keyboard event entries like
    'Backspace' or 'ArrowUp' are allowed.
    See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

For barcode:

* regex: The regular expression your barcode needs to match.

Examples:

    const cleanupHotkey = charsAndChunks.hotkey ({
        char: 'h',
        context: document.querySelector('header'),
        callback: function () {console.log('h pressed')},
        comment: 'Prints "h pressed" in the console'
    })

    const cleanupHotkey2 = charsAndChunks.hotkey ({
        char: 'ctrl+m',
        context: $scope,
        callback: () => {console.log('ctrl+m pressed')},
        comment: 'Prints "ctrl+m pressed" in the console'
    })

    const cleanupBarcode = charsAndChunks.barcode ({
        regex: /^\w+-\w+$/,
        context: 'form',
        callback: () => {console.log('yphen seperated barcode scanned')},
        comment: 'Prints "yphen seperated barcode scanned" in the console'
    })

The bulk intake function for hotkey:

    const cleanupHotkeys = charsAndChunks.hotkey ({
        char: 'Backspace',
        context: this,
        callback: function logF () {console.log('Backspace pressed')},
        comment: 'Prints "Backspace pressed" in the console'
    }, {
        char: ['+', '='],
        context: 'canvas',
        callback: function logZoom () {console.log('zoom in')},
        comment: 'Zoom in'
    })

When the controller or the element is destroyed, the function returned when registering
the hotkey or barcode needs to executed to unregister:

    const cleanupHotkey = charsAndChunks.hotkey (...
    const cleanupBarcode = charsAndChunks.barcode (...
    controller.ondestroy = function () {
      cleanupHotkey()
      cleanupBarcode()
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
