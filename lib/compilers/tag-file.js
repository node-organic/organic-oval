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
  var tagAttributesStr = firstLine.replace('<' + tagName, '').replace('>', '')
  lines.shift()
  lines.pop()

  var tagAttributes = {}
  //  class='login-view' asasd-asdd="asddd" assss="{ddddd}-1243&&@#jf. "
  var attributesWithValue = tagAttributesStr.trim().match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gm)
  if (attributesWithValue) {
    for (var i = 0; i < attributesWithValue.length; i += 1) {
      var pairs = attributesWithValue[i].split('=')
      tagAttributes[pairs[0]] = pairs[1].replace(/"/g, '').replace(/'/g, '')
    }
  }

  // flag1 flag-two FLAG_THREE3
  var tagFlags = tagAttributesStr.match(/ ([A-Za-z][0-9A-Za-z-_]*)(?![=[A-Za-z0-9-_])/g) || []
  tagFlags = tagFlags.map((f) => f.trim()) // trim leading space because JS does not support lookbehind

  return {tagName, tagAttributes, tagFlags}
}

module.exports.compile = function (content) {
  var lines = content.trim().split('\n')
  var scriptContent = extractScript(lines)
  var tagInfo = extractTagInfo(lines)
  var htmlContent = lines.join('\n')
  var result = `class Tag {
      constructor (root, props, attrs) {
        var tag = this
        var tagAttrs = ${JSON.stringify(tagInfo.tagAttributes)}
        for (var key in tagAttrs) {
          root.setAttribute(key, tagAttrs[key])
        }
        oval.BaseTag(tag, root, props, attrs)
        ${scriptContent.trim()}
        tag.render = function (createElement) {
          return <virtual>${htmlContent}</virtual>
        }
      }
    }
    oval.registerTag('${tagInfo.tagName}', Tag)
    Tag.tagName = "${tagInfo.tagName}"
    module.exports = Tag
  `
  return result
}
module.exports.extractTagInfo = extractTagInfo
module.exports.extractScript = extractScript
