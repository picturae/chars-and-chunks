const e=function(){const e=function(){this.lock=new Map,this.box=new WeakMap};let t=new e,n=[];const o=function(e){if(t.lock.has(e.entry)){let n=t.lock.get(e.entry);if(n&&t.box.has(n))return t.box.get(n)[e.entry]}},r=function(){t=new e};return{store:function(e){(function(e){const t="object"==typeof e.context;return t||console.error("Cannot store"),t})(e)&&(t.lock.set(e.match,e.context),t.box.has(e.context)||t.box.set(e.context,{}),t.box.get(e.context)[e.match]=e.box)},retrieve:o,keys:function(){return t.lock.keys()},overview:function(){let e=[];const n=t.lock.keys();for(let r of n){let n=o({entry:r});if(t.lock.get(r)){let t={match:r,box:n};e.push(t)}}return e},reset:r,overlay:function(){n.push(Object.assign({},t)),r()},revive:function(){n.length&&(t=n.pop())},cleanup:function(e){t.lock.forEach((n,o)=>{t.lock.get(o)===e&&t.lock.set(o,void 0)}),t.box.delete(e)}}}(),t=function(){const t=/^/,n=function(e){const t=e.char?"string"==typeof e.char&&e.char.length:e.regex?e.regex instanceof RegExp:void 0,n=("string"==typeof e.context&&(e.context=document.querySelector(e.context)),"object"==typeof e.context),o="function"==typeof e.callback,r="string"==typeof e.description&&e.description.length,c=t&&n&&o&&r;return c||(console.error("Wrong properties for registering hotkeys or barcodes!"),location.port&&console.log(e)),c},o=function(t){t.match=t.char||t.regex,t.box={callback:t.callback,description:t.description},e.store(t)},r=function(e){if(delete e.regex,e.char instanceof Array){let t,n;return e.char.forEach(o=>{const c=Object.assign({},e,{char:o});(n=r(c))&&(t=n)}),t}if(n(e))return o(e),e},c=function(){let t={},n=e.overview(),o=new Object;return n.forEach(e=>{var t=n.filter(t=>t.box.callback===e.box.callback&&t.box.description===e.box.description);if(t.length>1){var r=t.map(e=>e.match);o[r]="box"}}),Object.keys(o).forEach(e=>{e.split(",").forEach((t,o)=>{n=n.map(n=>(n&&n.match===t&&(n=o?null:{...n,match:e.replace(/,(\S)/g,", $1")}),n))})}),n.forEach(e=>{if(e&&e.box&&"string"==typeof e.match){let n={match:e.match,description:e.box.description};t.hotkeys=t.hotkeys?t.hotkeys.concat([n]):[n]}if(e&&e.box&&e.match instanceof RegExp){let n={match:"barcode",description:e.box.description};t.barcodes=t.barcodes?t.barcodes.concat([n]):[n]}}),t};let i=function(){l()};const l=function(){const t=c();let n="<table>";const o=function(e){let n=`<thead><tr><th colspan="2">${e}</th><tr></thead><tbody>`;for(let o of t[e]||[])n+=`<tr><th>${o.match}</th><td>${o.description}</td></tr>`;return n+"</tbody>"};t.hotkeys&&(n+=o("hotkeys")),t.barcodes&&(n+=o("barcodes")),t.hotkeys||t.barcodes||(n+=o("no hotkeys or barcodes configured")),n+="</table>";let r=document.createElement("chars-and-chuncks-panel");r.innerHTML='\n    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n    \t viewBox="0 0 507.2 507.2" style="enable-background:new 0 0 507.2 507.2;" xml:space="preserve">\n    <circle fill="#000000" cx="253.6" cy="253.6" r="253.6"/>\n    <path fill="#FFFFFF" d="M373.6,309.6c11.2,11.2,11.2,30.4,0,41.6l-22.4,22.4c-11.2,11.2-30.4,11.2-41.6,0l-176-176\n    \tc-11.2-11.2-11.2-30.4,0-41.6l23.2-23.2c11.2-11.2,30.4-11.2,41.6,0L373.6,309.6z"/>\n    <path fill="#FFFFFF" d="M309.6,133.6c11.2-11.2,30.4-11.2,41.6,0l23.2,23.2c11.2,11.2,11.2,30.4,0,41.6L197.6,373.6\n    \tc-11.2,11.2-30.4,11.2-41.6,0l-22.4-22.4c-11.2-11.2-11.2-30.4,0-41.6L309.6,133.6z"/>\n    </svg>\n    '+n,e.overlay(),document.body.appendChild(r),r.querySelector("table:first-of-type").addEventListener("click",a),r.querySelector("svg:first-of-type").addEventListener("click",a),i=function(){a()}},a=function(t){const n=document.querySelector("chars-and-chuncks-panel");n.querySelector("table:first-of-type").removeEventListener("click",a),n.querySelector("svg:first-of-type").removeEventListener("click",a),n.remove(),e.revive(),i=function(){l()}},s=function(t){e.cleanup(t.context)};return{registerHotkey:function(e){const t=r(e);return function(){t&&t.context&&s(t)}},registerHotkeys:function(e){const t=function(e){let t=[];return e.forEach(e=>{let n=r(e);n&&t.push(n)}),t}(e);return function(){t.forEach(e=>{e&&e.context&&s(e)})}},hotkeyHandler:function(t){if("?"!==t){let n=e.retrieve({entry:t});if(!n){e.overview().some(o=>(o.match instanceof Array&&o.match.includes(t)&&(n=e.retrieve({entry:o.match})),Boolean(n)))}return n}i()},registerBarcode:function(e){const r=function(e){if(delete e.char,e.regex||(e.regex=t),n(e))return o(e),e}(e);return function(){r&&r.context&&s(r)}},barcodeHandler:function(n){const o=function(n){let o=t;const r=e.keys();for(let e of r)e instanceof RegExp&&e.test(n)&&e.toString().length>o.toString().length&&(o=e);return o}(n);return e.retrieve({entry:o})},overviewJson:c,overviewPanel:i,reset:e.reset,overlay:e.overlay,revive:e.revive}}(),n=function(){const e=["Shift","Alt"];let n=0,o=[];const r=function(e){let n=o.join("");if(o.length>=6){let e=t.barcodeHandler(n);e&&e.callback(n)}else if(1===o.length){e.ctrlKey&&(n=`ctrl+${n}`);let o=t.hotkeyHandler(n);o&&o.callback(n)}o=[]};return window.addEventListener("keydown",(function(t){if(n&&clearTimeout(n),"INPUT"!==t.target.tagName&&"TEXTAREA"!==t.target.tagName&&"SELECT"!==t.target.tagName){if(t.key.length>1){if(o.length&&"Enter"===t.key)return void r(t);if(!e.includes(t.key))return o=[t.key],void r(t)}else o.push(t.key);n=setTimeout(r,30,t)}else o=[]})),{publicAPI:{hotkey:t.registerHotkey,hotkeys:t.registerHotkeys,barcode:t.registerBarcode,overview:t.overviewJson,help:t.overviewPanel,reset:t.reset,overlay:t.overlay,revive:t.revive},testAPI:{hotkeyHandler:t.hotkeyHandler,barcodeHandler:t.barcodeHandler}}}().publicAPI;export default n;
//# sourceMappingURL=charsAndChunks.js.map
