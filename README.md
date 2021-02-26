[![Build Status](https://travis-ci.com/picturae/chars-and-chunks.svg?branch=master)](https://travis-ci.com/picturae/chars-and-chunks)
[![Coverage Status](https://coveralls.io/repos/github/picturae/chars-and-chunks/badge.svg?branch=master)](https://coveralls.io/github/picturae/chars-and-chunks?branch=master)

# Chars and Chunks

Chars and Chunks helps to create the flow of a webapp by
catching single keystrokes and input from barcode scanners.

When a hotkey is matched, the function registered with it is executed.
A barcode is matched against registered patterns and the code
registered with the lengthiest pattern will be runned.

Why? When you have seperate solutions for barcodes and for hotkeys,
chances are big a barcodescan fires a hotkey.

## Features

* There is one eventListener. It evaluates the key property of the keydown-event.
* An array of matches can be registered, returning one cancel function.
* A barcode is evaluated when minimal 6 keystrokes are seen with an interval of
30 milliseconds at most.
* The hardcoded question mark match shows and hides an overview the active
hotkeys and barcodepatterns.
* The registrations can be layered. An overlay can be assigned a set of matches
while the set of matches registered at the main flow are temporarily suppressed.
These sets may overlap.
* One callback-function can be assigned to multiple matches in one registration.
* A registration call returns a function cancelling the registration.
* Chars and Chunks does not deal with entries made in input fields,
textareas or selection lists.

## Install

Install the package as npm package. Provided are
a umd-formatted file in the dist folder to require or just read
and an es-module in the module folder to import.

## Usage

To register keystrokes as hotkeys or patterns for barcodes similar objects are
used. The properties are:

* match: keystroke for hotkey or pattern for barcode.
* callback: the function to execute when keystroke passed or the
pattern is matched.
* description: a description of the callback function,
    to be used in the overview

The match property can serve two purposes.

* As keystroke. The key may be modified (with Alt (or Option) and Shift).
    Since we use the key property of the keyboard event entries like
    'Backspace' or 'ArrowUp' could be used as match.
    See
    https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

* As pattern. The regular expression your barcode needs to match.
    The function registered with lengthiest matching pattern will executed.

Examples:

    const cleanupH = charsAndChunks.register ({
        match: 'h',
        callback: function () {console.log('h pressed')},
        description: 'Prints "h pressed" in the console'
    })

    const cleanupCtrlM = charsAndChunks.register ({
        match: 'ctrl+m',
        callback: () => {console.log('ctrl+m pressed')},
        description: 'Prints "ctrl+m pressed" in the console'
    })

    const cleanupHyphenSeperatedWords = charsAndChunks.register ({
        match: /^\w+-\w+$/,
        callback: () => {console.log('hyphen seperated barcode scanned')},
        description: 'Prints "hyphen seperated barcode scanned" in the console'
    })

Bulk intake function, multiple matches:

    const cleanupHotkeys = charsAndChunks.register ([{
        match: 'Backspace',
        callback: function logF () {console.log('Backspace pressed')},
        description: 'Prints "Backspace pressed" in the console'
    }, {
        match: ['+', '='],
        callback: function logZoom () {
            console.log('increased by either "+" or "="')
        },
        description: 'Increase with multiple matches'
    }])

When the component or the element is destroyed, the function returned
when registering the match needs to executed to unregister:

    const cleanupHotkey = charsAndChunks.register (...)
    const cleanupPattern = charsAndChunks.register (...)
    component.ondestroy = function () {
      cleanupHotkey()
      cleanupPattern()
    }

You will not find an unregister or toggle method in the API.
When you need to remove or switch off a hotkey,
you should register the hotkey separately in the beginning,
and use the cleanup function to disable the hotkey.
The hotkey may later be registered again (separately).

With an overlay, the existing listeners can be suppressed and new ones can be set:

    charsAndChunks.overlay()
    charsAndChunks.register (...)

When the overlay is closed, the temporary situation is abandoned:

    charsAndChunks.revive()

To get an onscreen overview of effective keys and barcodes press "?" key or:

    charsAndChunks.help()

To get a JSON with an overview of effective keys and barcodes:

    charsAndChunks.overview()

To reset the current set of matches:

    charsAndChunks.reset()

To change a setting in the eventListener:

    charsAndChunks.config({key: 'value'})

## Notes

### Version 1 no longer supported

The deprecated registration methods hotkey, hotkeys and barcode from version 1
are now removed. Use the register method.

### Accesskeys

Chars and Chunks does not attempt to avoid clashes with accesskeys. When you
configure a keystroke for an accesskey to be a hotkey, both the accesskey and
the hotkey are executed. Avoid clashes with accesskeys by not configuring
keystrokes that can be entered in combination with an Alt- or Option-modifier.

Shift and Alt keys alone can not be used as hotkey,
since these produce new characters that might be used in barcodes.
