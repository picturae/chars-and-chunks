!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).charsAndChunks=t()}(this,(function(){"use strict";const e=function(){let e,t;const n=function(){e=new WeakMap,t=new Map};n();const o=/^/,r=function(e){const t=e.char?"string"==typeof e.char:e.regex?e.regex instanceof RegExp:void 0,n=("string"==typeof e.context&&(e.context=document.querySelector(e.context)),e.context instanceof Node),o="function"==typeof e.callback;e.comment&&"string"==typeof e.comment||(e.comment=`callback for ${e.char||"barcode"}`);const r=t&&n&&o;return r||console.error("Wrong properties for registering hotkeys or barcodes!"),r},c=function(n){const o=n.char||n.regex;t.set(o,n.context),e.has(n.context)||e.set(n.context,{}),e.get(n.context)[o]={callback:n.callback,comment:n.comment}},i=function(t,n){if((o=t)&&(o.getRootNode()instanceof Document||o.getRootNode()instanceof ShadowRoot)&&e.has(t))return e.get(t)[n];var o},a=function(e){if(t.has(e)){let n=t.get(e);return i(n,e)}};return{registerHotkey:function(e){delete e.regex,r(e)&&c(e)},hotkeyHandler:a,registerBarcode:function(e){delete e.char,e.regex||(e.regex=o),r(e)&&c(e)},barcodeHandler:function(e){const n=function(e){var n=o;return t.forEach((t,o)=>{o instanceof RegExp&&o.test(e)&&o.toString().length>n.toString().length&&(n=o)}),n}(e);return a(n)},overview:function(){let e={hotkey:[],barcode:[]};return t.forEach((t,n)=>{if("string"==typeof n){let o=i(t,n);if(o){let t={entry:n,comment:o.comment};e.hotkey.push(t)}}}),t.forEach((t,n)=>{if(n instanceof RegExp){if(i(t,n)){let o={entry:"barcode",comment:i(t,n).comment};e.barcode.push(o)}}}),e},reset:n}}();return function(){const t=["Alt","Control","Shift"];let n=0,o=[];const r=function(){const t=o.join("");if(o.length>=6){let n=e.barcodeHandler(t);n&&n.callback(t)}else if(1===o.length){let n=e.hotkeyHandler(t);n&&n.callback(t)}o=[]};return window.addEventListener("keydown",(function(e){if(n&&clearTimeout(n),"INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&"SELECT"!==e.target.tagName){if(e.key.length>1){if("Enter"===e.key)return void r();if(!t.includes(e.key))return o=[e.key],void r()}else o.push(e.key);n=setTimeout(r,30)}else o=[]})),{publicAPI:{hotkey:e.registerHotkey,barcode:e.registerBarcode,overview:e.overview,reset:e.reset},testAPI:{hotkeyHandler:e.hotkeyHandler,barcodeHandler:e.barcodeHandler}}}().publicAPI}));
//# sourceMappingURL=charsAndChunks.js.map
