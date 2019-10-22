// run this command (or npm equivalent)
// npm i -D @babel/core @babel/preset-env

// add babel.cofig.js
module.exports = function (api) {
  api.cache(true);

  const presets = [
  	"@babel/preset-env"
  ]

  return {
    presets
  };
}
