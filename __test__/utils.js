module.exports.buildExpectedTagFile = function (options) {
  return `/** @jsx createElement */
  /** @jsxFrag Fragment */
  module.exports = require('organic-oval').define({
    tagName: "${options.tagName}",
    tagLine: "${options.tagLine || ''}",
    onconstruct: function () {

      ${options.script}

      this.template = function (Fragment, props, state) {
        let createElement = this.createElement
        return <>${options.template}</>
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
