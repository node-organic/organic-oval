var parseIfs = function (lines) {
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('if=') !== -1) {
      // get the opening tag, remove '<' and '>'
      var line = lines[i].trim().match(/<\w.*(if=)[^>]*>/)[0].slice(1, -1)

      // split the line, the first element is the node name, the others are attributes
      // example: <span class="something" if={condition} id="1"> -> ['span', 'class="something"', 'if={condition}', 'id="1"']
      var parsedLine = line.split(' ')

      // get the node name
      var nodeName = parsedLine.shift()
      var statement = null

      // Parse the attributes and save them in `attributes`
      var attributes = parsedLine.filter(function (attribute) {
        // handle multiple spaces between attriutes
        if (!attribute || !attribute.length) {
          return false
        }

        // save the if condition to `statement` and do not include it in `attributes`
        if (attribute.indexOf('if=') !== -1) {
          statement = attribute.slice(('if={').length, attribute.length - ('}').length)
          return false
        }

        return true
      })

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
      lines[i] = '{' + statement + ' ? (<' + nodeName + ' ' + attributes.join(' ') + '>' + buffer.join('\n') + '</' + nodeName + '>) : null}'
    }
  }
  return lines
}

var parseLoops = function (lines) {
  var content = lines.join('\n')

  // parse all each opening tags
  // takes every - <each %params% in ${%model%}>
  // makes it into - ${ %model%.map((%params%) => (`
  var openingEachRegex = new RegExp(/<each [^>]*>/mig)
  content = content.replace(openingEachRegex, function (openingTag) {
    openingTag = openingTag.slice('<each'.length, -1)
    var params = openingTag.split(' in ')[0].trim()
    var model = openingTag.split(' in ')[1].trim().slice('{'.length, -1) // get the model, removing ${ and }
    return `\{ ${model}.map((${params}) => (`
  })

  // parse all each closing tags
  content = content.replace(new RegExp(/<\/each>/mig), '))}')
  return content.split('\n')
}

module.exports.compile = function (content) {
  var lines = content.split('\n')
  parseIfs(lines)
  lines = parseLoops(lines)
  return lines.join('\n')
}
