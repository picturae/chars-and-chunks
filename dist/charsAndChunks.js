!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).charsAndChunks=t()}(this,(function(){"use strict";const e=function(){const e=function(){this.lock=new Map,this.box=new WeakMap};let t=new e,n=[];const o=function(e){if(t.lock.has(e.entry)){let n=t.lock.get(e.entry);if(n&&t.box.has(n)){return t.box.get(n)[e.entry]}}},c=function(){t=new e};return{store:function(e){(function(e){const t="object"==typeof e.context;return t||console.error("Cannot store"),t})(e)&&(t.lock.set(e.match,e.context),t.box.has(e.context)||t.box.set(e.context,{}),t.box.get(e.context)[e.match]=e.box)},retrieve:o,keys:function(){return t.lock.keys()},overview:function(){let e=[];const n=t.lock.keys();for(let c of n){let n=o({entry:c});if(t.lock.get(c)){let t={match:c,box:n};e.push(t)}}return e},reset:c,overlay:function(){n.push(Object.assign({},t)),c()},revive:function(){n.length&&(t=n.pop())},cleanup:function(e){t.lock.forEach((n,o)=>{t.lock.get(o)===e&&t.lock.set(o,void 0)}),t.box.delete(e)}}}(),t=function(){const t=/^/,n=function(e){return e.match||e.regex||e.char||(e.match=t),e.regex&&(e.match=e.regex,delete e.regex),e.char&&(e.match=e.char,delete e.char),e.comment&&(e.description=e.comment,delete e.comment),e},o=function(e){const t=e.match&&e.match.toString().length&&("string"==typeof e.match||e.match instanceof RegExp),n=("string"==typeof e.context&&(e.context=document.querySelector(e.context)),e.context&&"object"==typeof e.context),o="function"==typeof e.callback,c="string"==typeof e.description&&e.description.length;return t&&n&&o&&c},c=function(t){t.match=t.match||t.char||t.regex,t.box={callback:t.callback,description:t.description},e.store(t)},r=function(t,n={time:Date.now(),random:Math.floor(Math.random()*Math.floor(99999))}){t instanceof Array?t.forEach(e=>{r(e,n)}):(t.context=n,t.match instanceof Array?t.match.forEach(e=>{const o={...t,match:e};r(o,n)}):o(t)&&c(t));return function(){e.cleanup(n)}},i=function(e){if(n(e),e.match instanceof Array){let t,n;return e.match.forEach(o=>{const c=Object.assign({},e,{match:o});n=i(c),n&&(t=n)}),t}if(o(e))return c(e),e},a=function(){let t=e.overview(),n=new Object;t.forEach(e=>{var o=t.filter(t=>t.box.callback===e.box.callback&&t.box.description===e.box.description);if(o.length>1){var c=o.map(e=>e.match);n[c]="box"}}),Object.keys(n).forEach(e=>{e.split(",").forEach((n,o)=>{t=t.map(t=>(t&&t.match===n&&(t=o?null:{...t,match:e.replace(/,(\S)/g,", $1")}),t))})});let o={};return t.forEach(e=>{if(e&&e.box&&"string"==typeof e.match){let t={match:e.match,description:e.box.description};o.hotkeys=o.hotkeys?o.hotkeys.concat([t]):[t]}if(e&&e.box&&e.match instanceof RegExp){let t={match:"barcode",description:e.box.description};o.barcodes=o.barcodes?o.barcodes.concat([t]):[t]}}),o};let s=function(){l()};const l=function(){const t=a();let n="<table>";const o=function(e){let n=`<thead><tr><th colspan="2">${e}</th><tr></thead><tbody>`;for(let o of t[e]||[])n+=`<tr><th>${o.match}</th><td>${o.description}</td></tr>`;return n+"</tbody>"};t.hotkeys&&(n+=o("hotkeys")),t.barcodes&&(n+=o("barcodes")),t.hotkeys||t.barcodes||(n+=o("no hotkeys or barcodes configured")),n+="</table>";let c=document.createElement("chars-and-chuncks-panel");c.innerHTML='\n    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n    \t viewBox="0 0 507.2 507.2" style="enable-background:new 0 0 507.2 507.2;" xml:space="preserve">\n    <circle fill="#000000" cx="253.6" cy="253.6" r="253.6"/>\n    <path fill="#FFFFFF" d="M373.6,309.6c11.2,11.2,11.2,30.4,0,41.6l-22.4,22.4c-11.2,11.2-30.4,11.2-41.6,0l-176-176\n    \tc-11.2-11.2-11.2-30.4,0-41.6l23.2-23.2c11.2-11.2,30.4-11.2,41.6,0L373.6,309.6z"/>\n    <path fill="#FFFFFF" d="M309.6,133.6c11.2-11.2,30.4-11.2,41.6,0l23.2,23.2c11.2,11.2,11.2,30.4,0,41.6L197.6,373.6\n    \tc-11.2,11.2-30.4,11.2-41.6,0l-22.4-22.4c-11.2-11.2-11.2-30.4,0-41.6L309.6,133.6z"/>\n    </svg>\n    '+n,e.overlay(),document.body.appendChild(c),c.querySelector("table:first-of-type").addEventListener("click",f),c.querySelector("svg:first-of-type").addEventListener("click",f),s=function(){f()}},f=function(t){const n=document.querySelector("chars-and-chuncks-panel");n.querySelector("table:first-of-type").removeEventListener("click",f),n.querySelector("svg:first-of-type").removeEventListener("click",f),n.remove(),e.revive(),s=function(){l()}},h=function(t){e.cleanup(t.context)};return{register:r,registerHotkey:function(e){const t=i(e);return function(){t&&t.context&&h(t)}},registerHotkeys:function(e){const t=function(e){let t=[];return e.forEach(e=>{let n=i(e);n&&t.push(n)}),t}(e);return function(){t.forEach(e=>{e&&e.context&&h(e)})}},hotkeyHandler:function(t){if("?"!==t){let n=e.retrieve({entry:t});if(!n){e.overview().some(o=>(o.match instanceof Array&&o.match.includes(t)&&(n=e.retrieve({entry:o.match})),Boolean(n)))}return n}s()},registerBarcode:function(e){const t=function(e){if(n(e),o(e))return c(e),e}(e);return function(){t&&t.context&&h(t)}},barcodeHandler:function(t){const n=function(t){let n="";const o=e.keys();for(let e of o)e instanceof RegExp&&e.test(t)&&e.toString().length>n.toString().length&&(n=e);return n}(t);return e.retrieve({entry:n})},overviewJson:a,overviewPanel:s,reset:e.reset,overlay:e.overlay,revive:e.revive}}();let n={safeIntermission:30,minimalBarcodeLength:6};return function(){const e=["Shift","Alt"];let o=0,c=[];const r=function(e){let o=c.join("");if(c.length>=n.minimalBarcodeLength){let e=t.barcodeHandler(o);e&&e.callback(o)}else if(1===c.length){e.ctrlKey&&(o=`ctrl+${o}`);let n=t.hotkeyHandler(o);n&&n.callback(o)}c=[]};window.addEventListener("keydown",(function(t){if(o&&clearTimeout(o),"INPUT"!==t.target.tagName&&"TEXTAREA"!==t.target.tagName&&"SELECT"!==t.target.tagName){if(t.key.length>1){if(c.length&&"Enter"===t.key)return void r(t);if(!e.includes(t.key))return c=[t.key],void r(t)}else c.push(t.key);o=setTimeout(r,n.safeIntermission,t)}else c=[]}));return{publicAPI:{config:function(e){Object.getOwnPropertyNames(e).forEach(t=>{const o=n[t],c=e[t];typeof o==typeof c&&(n[t]=c)})},register:t.register,hotkey:t.registerHotkey,hotkeys:t.registerHotkeys,barcode:t.registerBarcode,overview:t.overviewJson,help:t.overviewPanel,reset:t.reset,overlay:t.overlay,revive:t.revive},testAPI:{hotkeyHandler:t.hotkeyHandler,barcodeHandler:t.barcodeHandler}}}().publicAPI}));
//# sourceMappingURL=charsAndChunks.js.map
