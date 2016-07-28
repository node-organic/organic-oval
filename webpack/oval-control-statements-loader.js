var oval = require('./oval-control-statements')

module.exports = function (source) {
  var content = source
  if (this.cacheable) this.cacheable()
  try {
    return oval.compile(content)
  } catch (e) {
    if (e instanceof Error) {
      throw e
    } else {
      throw new Error(e)
    }
  }
}
