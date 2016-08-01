var extractScript = function (lines) {
  var buffer = []
  var scriptFound = false
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('<script>') !== -1) {
      scriptFound = true
      lines.splice(i, 1)
      i -= 1
      continue
    }
    if (lines[i].indexOf('</script>') !== -1) {
      scriptFound = false
      lines.splice(i, 1)
      i -= 1
      continue
    }
    if (scriptFound) {
      buffer.push(lines[i])
      lines.splice(i, 1)
      i -= 1
      continue
    }
  }
  return buffer.join('\n')
}

var extractTagName = function (lines) {
  var firstLine = lines[0]
  return firstLine.split(' ')[0].replace('<', '').replace('>', '')
}

module.exports.compile = function (content) {
  var lines = content.split('\n')
  var scriptContent = extractScript(lines)
  var tagName = extractTagName(lines)
  var htmlContent = lines.join('\n')
  var result = `class Tag {
    constructor (tagName, root) {
      oval.BaseTag(this, tagName, root)
      var tag = this
      ${scriptContent.trim()}
    }

    render (createElement) {
      var tag = this
      return ${htmlContent.trim()}
    }
  }
  oval.registerTag('${tagName}', Tag)
  export default Tag
`

  return result
}
