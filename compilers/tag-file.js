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

var extractTagInfo = function (lines) {
  var firstLine = lines[0]
  var tagName = firstLine.split(' ')[0].replace('<', '').replace('>', '')
  var tagLine = firstLine.replace('<' + tagName, '').replace('>', '')
  lines.shift()
  lines.pop()
  return {tagName, tagLine}
}

module.exports.compile = function (content) {
  var lines = content.trim().split('\n')
  var scriptContent = extractScript(lines)
  var tagInfo = extractTagInfo(lines)
  var htmlContent = lines.join('\n')

  // @WORKAROUND
  /** having this case happens when dealing with component
  <my-comp>
    <div if={statement}>...
  </my-comp>

  ie the if happens to be on the first element, therefore its
  invalid js code as such
  template: function () {
    return {statement ? <div>... : null}
  }

  so we are doing a workaround to fix up after the `tag-control-statements`
  */
  if (htmlContent.indexOf('{') === 0) {
    htmlContent = htmlContent.slice(1, -1)
  }

  var result = `
  /** @jsx createElement */

  module.exports = require('organic-oval').define({
    tagName: "${tagInfo.tagName}",
    tagLine: "${tagInfo.tagLine}",
    script: function () { ${scriptContent.trim()} },
    template: function (createElement) {
      return ${htmlContent.trim()}
    }
  })
`
  return result
}
