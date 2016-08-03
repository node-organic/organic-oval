var extractStatement = function (line) {
  // line example: 'class="something" if={statement} id="1"'
  // output: 'statement'
  var ifMark = 'if={'
  // find index of if mark
  var statementStart = line.indexOf(ifMark)
  // find index of end statement
  var statementEnd = line.indexOf('} ', statementStart + ifMark.length)
  if (statementEnd === -1) { // statement is not between arguments, assume it is last
    statementEnd = line.lastIndexOf('}')
  }
  // return statement substring without ifMark and closing bracket
  var statement = line.substring(statementStart + ifMark.length, statementEnd)
  return statement
}
var extractAttributes = function (condition, line) {
  return line.replace('if={' + condition + '}', '')
}
var parseIfs = function (lines) {
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('if=') !== -1) {
      // handle multiline if statement
      lines[i] = lines[i].trim()
      var closingArrowIndex = lines[i].lastIndexOf('>')
      if (closingArrowIndex !== lines[i].length - 1) {
        var lineBuffer = []
        for (var j = i + 1; j < lines.length; j++) {
          if (lines[j].indexOf('>') === -1) {
            lineBuffer.push(lines[j].trim())
            lines.splice(j, 1)
            j -= 1
          } else {
            lineBuffer.push(lines[j].trim())
            lines.splice(j, 1)
            j -= 1
            break
          }
        }
        lines[i] += ' ' + lineBuffer.join('')
      }

      // get the opening tag, remove '<' and '>'
      var line = lines[i].trim().slice(1, -1)
      // split the line, the first element is the node name, the others are attributes
      // example: span class="something" if={condition} id="1" -> ['span', 'class="something"', 'if={condition}', 'id="1"']
      var parsedLine = line.split(' ')

      // get the node name
      var nodeName = parsedLine.shift()
      parsedLine = parsedLine.join(' ')
      var statement = extractStatement(parsedLine)
      var attributes = extractAttributes(statement, parsedLine)

      if (lines[i].indexOf('/>') === -1 && lines[i].indexOf('</' + nodeName + '>') === -1) {
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
        lines[i] = '{' + statement + ' ? (<' + nodeName + ' ' + attributes + '>' + buffer.join('\n') + '</' + nodeName + '>) : null}'
      } else {
        var lineWithoutStatement = lines[i].replace('if={' + statement + '}', '')
        lines[i] = '{' + statement + ' ? (' + lineWithoutStatement + ') : null}'
      }
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
