module.exports.buildExpectedTagFile = function (options) {
  return `/** @jsx createElement */ module.exports = require('organic-oval').define({
    tagName: "${options.tagName}",
    script: function () {
      let tag = this
      ${options.script}
      this.template = function (createElement) {
        return <shadow-root>${options.template}</shadow-root>
      }
    }
  })
  `
}

module.exports.expectTagFile = function (compiled, expectedInfo) {
  compiled = compiled.trim().replace(/ /g, '').replace(/\n/g, '')
  let expected = module.exports.buildExpectedTagFile(expectedInfo)
  expected = expected.trim().replace(/ /g, '').replace(/\n/g, '')
  return expect(compiled).toEqual(expected)
}
