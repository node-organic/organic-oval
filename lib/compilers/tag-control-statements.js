var parseIfs = function (lines) {
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('if=') !== -1) {
      var nodeName = lines[i].trim().split(' ').shift().replace('<', '')
      var buffer = []
      for (var k = i + 1; k < lines.length; k++) {
        if (lines[k].indexOf('</' + nodeName + '>') !== -1) {
          lines.splice(k, 1)
          break
        }
        buffer.push(lines[k].trim())
        lines.splice(k, 1)
        k -= 1
      }
      var statement = lines[i].split('if={').pop().replace('}>', '')
      lines[i] = '{' + statement + ' ? <' + nodeName + '>' + buffer.join('\n') + '</' + nodeName + '> : ""}'
    }
  }
  return lines
}

var parseLoops = function (lines) {
  var content = lines.join('\n')

  // parse all each opening tags
  // takes every - <each %params% in ${%model%}>
  // makes it into - ${ %model%.map((%params%) => yo`
  var openingEachRegex = new RegExp(/<each [^>]*>/mig)
  content = content.replace(openingEachRegex, function (openingTag) {
    openingTag = openingTag.slice('<each'.length, -1)
    var params = openingTag.split(' in ')[0].trim()
    var model = openingTag.split(' in ')[1].trim().slice('{'.length, -1) // get the model, removing ${ and }
    return `\{ ${model}.map((${params}) => `
  })

  // parse all each closing tags
  content = content.replace(new RegExp(/<\/each>/mig), ')}')
  return content.split('\n')
}

module.exports.compile = function (content) {
  var lines = content.split('\n')
  parseIfs(lines)
  lines = parseLoops(lines)
  return lines.join('\n')
}
