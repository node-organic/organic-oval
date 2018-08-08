module.exports = function () {
  var JSDOM = require('jsdom').JSDOM
  const dom = new JSDOM('')
  global.window = dom.window
  global.document = dom.window.document
  before(function () {
    global.Element = window.Element
  })
}
