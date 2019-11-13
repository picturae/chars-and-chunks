

roadmap 1.5.0

* functions with multiple hotkeys can now have multiple callbacks for one hotkey.
    that is unwanted - it should work as follows:
    * multiple registration,
    * find the multiple hotkeys in overview and show them as an array.
* replace revive api-function by a retuned function (like for registration),
    so we can pass it outside a
    controller and be sure the right overlay is removed.
* always active hotkeys, like ? for help en Escape for closing modals.
    make a persistent table and merge it in any new layer.
    we might also need to be more hotkey/barcode agnostic for the api.
