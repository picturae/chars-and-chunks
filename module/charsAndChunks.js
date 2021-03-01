const e=function(){const e=function(){this.lock=new Map,this.box=new WeakMap};let t=new e,n=[];const o=function(e){if(t.lock.has(e.entry)){let n=t.lock.get(e.entry);if(n&&t.box.has(n)){const o=t.box.get(n)[e.entry];return o&&!o.mute?o:void 0}}},c=function(){t=new e},r=function(e){const n=this.length?Array.from(this).flat():t.lock.keys();for(const o of n)if(t.lock.has(o)){const n=t.lock.get(o);if(n&&t.box.has(n)){t.box.get(n)[o].mute=e}}};return{store:function(e,n){(function(e){const t="object"==typeof e.context;return t||console.error("Cannot store"),t})(e)&&(t.lock.set(e.match,e.context),t.box.has(e.context)||t.box.set(e.context,{}),t.box.get(e.context)[e.match]=n)},retrieve:o,keys:function(){return t.lock.keys()},overview:function(){let e=[];const n=t.lock.keys();for(let c of n){let n=o({entry:c});if(t.lock.get(c)){let t={match:c,box:n};e.push(t)}}return e},reset:c,mute:function(){r.call(arguments,!0)},free:function(){r.call(arguments,!1)},overlay:function(){n.push(Object.assign({},t)),c()},revive:function(){n.length&&(t=n.pop())},cleanup:function(e){t.lock.forEach(((n,o)=>{t.lock.get(o)===e&&t.lock.delete(o)})),t.box.delete(e)}}}(),t=function(){const t=function(n,o={time:Date.now(),random:Math.floor(Math.random()*Math.floor(99999))}){n instanceof Array?n.forEach((e=>{t(e,o)})):(n.context=o,n.match instanceof Array?n.match.forEach((e=>{const c={...n,match:e};t(c,o)})):function(e){const t=e.match&&e.match.toString().length&&("string"==typeof e.match||e.match instanceof RegExp),n=("string"==typeof e.context&&(e.context=document.querySelector(e.context)),e.context&&"object"==typeof e.context),o="function"==typeof e.callback,c="string"==typeof e.description&&e.description.length;return t&&n&&o&&c}(n)&&function(t){const n={callback:t.callback,description:t.description};e.store(t,n)}(n));return function(){e.cleanup(o)}},n=function(){let t=e.overview(),n=new Object;t.forEach((e=>{var o=t.filter((t=>t.box&&e.box&&t.box.callback===e.box.callback&&t.box.description===e.box.description));if(o.length>1){var c=o.map((e=>e.match));n[c]="box"}}));Object.keys(n).forEach((e=>{e.split(",").forEach(((n,o)=>{t=t.map((t=>(t&&t.match===n&&(t=o?null:{...t,match:e.replace(/,(\S)/g,", $1")}),t)))}))}));let o={};return t.forEach((e=>{if(e&&e.box&&"string"==typeof e.match){let t={match:e.match,description:e.box.description};o.hotkeys=o.hotkeys?o.hotkeys.concat([t]):[t]}if(e&&e.box&&e.match instanceof RegExp){let t={match:"barcode",description:e.box.description};o.barcodes=o.barcodes?o.barcodes.concat([t]):[t]}})),o};let o=function(){c()};const c=function(){const t=n();let c="<table>";const i=function(e){let n=`<thead><tr><th colspan="2">${e}</th><tr></thead><tbody>`;for(let o of t[e]||[])n+=`<tr><th>${o.match}</th><td>${o.description}</td></tr>`;return n+"</tbody>"};t.hotkeys&&(c+=i("hotkeys")),t.barcodes&&(c+=i("barcodes")),t.hotkeys||t.barcodes||(c+=i("no hotkeys or barcodes configured")),c+="</table>";let a=document.createElement("chars-and-chuncks-panel");a.innerHTML='\n    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n    \t viewBox="0 0 507.2 507.2" style="enable-background:new 0 0 507.2 507.2;" xml:space="preserve">\n    <circle fill="#000000" cx="253.6" cy="253.6" r="253.6"/>\n    <path fill="#FFFFFF" d="M373.6,309.6c11.2,11.2,11.2,30.4,0,41.6l-22.4,22.4c-11.2,11.2-30.4,11.2-41.6,0l-176-176\n    \tc-11.2-11.2-11.2-30.4,0-41.6l23.2-23.2c11.2-11.2,30.4-11.2,41.6,0L373.6,309.6z"/>\n    <path fill="#FFFFFF" d="M309.6,133.6c11.2-11.2,30.4-11.2,41.6,0l23.2,23.2c11.2,11.2,11.2,30.4,0,41.6L197.6,373.6\n    \tc-11.2,11.2-30.4,11.2-41.6,0l-22.4-22.4c-11.2-11.2-11.2-30.4,0-41.6L309.6,133.6z"/>\n    </svg>\n    '+c,e.overlay(),document.body.appendChild(a),a.querySelector("table:first-of-type").addEventListener("click",r),a.querySelector("svg:first-of-type").addEventListener("click",r),o=function(){r()}},r=function(){const t=document.querySelector("chars-and-chuncks-panel");t.querySelector("table:first-of-type").removeEventListener("click",r),t.querySelector("svg:first-of-type").removeEventListener("click",r),t.remove(),e.revive(),o=function(){c()}};return{register:t,hotkeyHandler:function(t){if("?"!==t){let n=e.retrieve({entry:t});if(!n){e.overview().some((o=>(o.match instanceof Array&&o.match.includes(t)&&(n=e.retrieve({entry:o.match})),Boolean(n))))}return n}o()},barcodeHandler:function(t){const n=function(t){let n="";const o=e.keys();for(let e of o)e instanceof RegExp&&e.test(t)&&e.toString().length>n.toString().length&&(n=e);return n}(t);return e.retrieve({entry:n})},overviewJson:n,overviewPanel:o,reset:e.reset,mute:e.mute,free:e.free,overlay:e.overlay,revive:e.revive}}();let n={safeIntermission:30,minimalBarcodeLength:6};const o=function(){const e=["Shift","Alt"];let o=0,c=[];const r=function(e){let o=c.join("");if(c.length>=n.minimalBarcodeLength){let e=t.barcodeHandler(o);e&&e.callback(o)}else if(1===c.length){e.ctrlKey&&(o=`ctrl+${o}`);let n=t.hotkeyHandler(o);n&&n.callback(o)}c=[]};window.addEventListener("keydown",(function(t){if(o&&clearTimeout(o),(e=>"INPUT"===e.target.tagName||"TEXTAREA"===e.target.tagName||"SELECT"===e.target.tagName)(t))return void(c=[]);if(t.key.length>1){if(c.length&&"Enter"===t.key)return void r(t);if(!e.includes(t.key))return c=[t.key],void r(t)}else c.push(t.key);o=setTimeout(r,n.safeIntermission,t)}));return{publicAPI:{config:function(e){Object.getOwnPropertyNames(e).forEach((t=>{const o=n[t],c=e[t];typeof o==typeof c&&(n[t]=c)}))},register:t.register,overview:t.overviewJson,help:t.overviewPanel,reset:t.reset,mute:t.mute,free:t.free,overlay:t.overlay,revive:t.revive},testAPI:{hotkeyHandler:t.hotkeyHandler,barcodeHandler:t.barcodeHandler}}}().publicAPI;export default o;
//# sourceMappingURL=charsAndChunks.js.map
