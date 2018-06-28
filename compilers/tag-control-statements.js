var extractStatement = function (line) {
  // line example: 'class="something" if={statement} id="1"'
  // output: 'statement'
  var ifMark = 'if=${'
  // find index of if mark
  var statementStart = line.indexOf(ifMark)
  // find index of end statement
  var statementEnd = -1
  var bcount = 1
  for (var i = statementStart + ifMark.length; i < line.length; i++) {
    if (line.charAt(i) === '{') bcount += 1
    if (line.charAt(i) === '}') bcount -= 1
    if (bcount === 0) {
      statementEnd = i
      break
    }
  }
  // return statement substring without ifMark and closing bracket
  var statement = line.substring(statementStart + ifMark.length, statementEnd)
  return statement
}
var extractAttributes = function (condition, line) {
  return line.replace('if=${' + condition + '}', '')
}
var parseIfs = function (lines) {
  // variable holding amount of `if` statements encountered during parsing
  // used to construct `oid` value
  let ifcount = -1

  // iterate over all lines searching for if statements
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('if=') !== -1) {
      ifcount += 1
      lines[i] = lines[i].trim()

      // test transform multiline if statement such as
      // <p if=${}
      //    class="">...
      // into singleline <p if=${} class="">...
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
        // buffer lines between start and end closing tag when not on the same line
        var buffer = []
        var innerNodeNameCount = 0

        for (var k = i + 1; k < lines.length; k++) {
          // found a line with the same node name as the opening tag
          if (lines[k].indexOf('<' + nodeName) !== -1) {
            innerNodeNameCount += 1
          }
          // found a line with a name of the closing tag
          if (lines[k].indexOf('</' + nodeName + '>') !== -1) {
            if (innerNodeNameCount > 0) {
              // the line has closing tag of a inner childrens
              innerNodeNameCount -= 1
            } else {
              // the line is the closing tag of the statement
              lines.splice(k, 1)
              break
            }
          }
          // buffer lines and remove them from original source
          buffer.push(lines[k].trim())
          lines.splice(k, 1)
          k -= 1
        }
        // re-construct attributes with oid marker included
        attributes = 'oid="${this.oid}-if' + ifcount + '" ' + attributes
        // rewrite opening tag with if statement
        lines[i] = '${' + statement + ' ? this.html`<' + nodeName + ' ' + attributes + '>'
        // insert any buffered content at next line of `i + k`
        for (let k = 0; k < buffer.length; k++) {
          lines.splice(i + k + 1, 0, buffer[k])
        }
        // insert closing tag
        lines.splice(i + buffer.length + 1, 0, '</' + nodeName + '>` : null}')
      } else {
        // single line if statement such as `<p if=${statement}>text</p>``

        // get clean tag
        var lineWithoutStatement = lines[i].replace('if=${' + statement + '}', '')

        // re-construct attributes with oid marker
        let parts = lineWithoutStatement.trim().split(' ')
        parts.splice(1, 0, 'oid="${this.oid}-if' + ifcount + '"')
        lineWithoutStatement = parts.join(' ')

        // rewrite the line
        lines[i] = '${' + statement + ' ? this.html`' + lineWithoutStatement + '` : null}'
      }
    }
  }
}

var parseLoops = function (lines) {
  let mapcount = -1
  let shouldSetOID = null
  for (var i = 0; i < lines.length; i++) {
    if (shouldSetOID) {
      let parts = lines[i].trim().split('>')
      parts[0] += ' oid="${this.oid}-map' + mapcount + '-${' + shouldSetOID + '}"'
      lines[i] = parts.join('>')
      shouldSetOID = null
    }
    if (lines[i].indexOf('<each ') !== -1) {
      mapcount += 1
      let openingTag = lines[i].trim().slice('<each'.length, -1)
      let params = openingTag.split(' in ')[0].trim()
      let indexVariableName = 'index'
      if (params.indexOf(',') !== -1) {
        indexVariableName = params.split(',')[1].trim()
      } else {
        params += ', ' + indexVariableName
      }
      let model = openingTag.split(' in ')[1].trim().slice('${'.length, -1) // get the model, removing ${ and }
      lines[i] = `\${ ${model}.map((${params}) => { this.html\``
      shouldSetOID = indexVariableName
    }
    if (lines[i].indexOf('</each>') !== -1) {
      lines[i] = lines[i].replace('</each>', '`})}')
      shouldSetOID = null
    }
  }
}

module.exports.compile = function (content) {
  var lines = content.split('\n')
  parseIfs(lines)
  parseLoops(lines)
  return lines.join('\n')
}
