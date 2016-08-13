module.exports = function () {
  require('mocha-jsdom')()
  before(function () {
    global.Element = window.Element
  })
}
