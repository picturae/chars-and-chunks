

roadmap

* replace revive api-function by a returned function (like for registration),
    so we can pass it outside a
    controller and be sure the right overlay is removed.
* always active hotkeys, like ? for help en Escape for closing modals.
    make a persistent table and merge it in any new layer.
* automatic cleanup on html elements



changed in 3.0.0

* removed version 1 to version 2 deprications

fixed in 2.0.1

* the registry now removes keys and values, not only the values

new in 2.0.0

* functions with multiple hotkeys could have had multiple callbacks for one hotkey.
    that is unwanted - it should work as follows:
    * multiple registration,
    * find the multiple hotkeys in overview and show them as an array.
* rename comment to description, now being required
* be hotkey/barcode agnostic for registration.
    * context can be omitted when registering.
* no regex omission.
* configuration of some settings for the event listener
