module.exports.buildExpectedTagFile = function (options) {
  let template = options.template
  if (!options.noShadowRoot) {
    template = `<shadow-root>${options.template}</shadow-root>`
  }
  return `/** @jsx createElement */ module.exports = require('organic-oval').define({
    tagName: "${options.tagName}",
    script: function () {
      let tag = this
      ${options.script}
      this.template = function (createElement) {
        return ${template}
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

module.exports.expectTagFileWithoutShadowRoot = function (compiled, expectedInfo) {
  expectedInfo.noShadowRoot = true
  compiled = compiled.trim().replace(/ /g, '').replace(/\n/g, '')
  let expected = module.exports.buildExpectedTagFile(expectedInfo)
  expected = expected.trim().replace(/ /g, '').replace(/\n/g, '')
  return expect(compiled).toEqual(expected)
}
