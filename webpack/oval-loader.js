var TagCompiler = require('../compilers/tag-file')

module.exports = function (source) {
  var content = source
  if (this.cacheable) this.cacheable()
  try {
    return TagCompiler.compile(content)
  } catch (e) {
    if (e instanceof Error) {
      throw e
    } else {
      throw new Error(e)
    }
  }
}
