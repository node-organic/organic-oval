const compiler = require('../../compilers/tag-file')
const utils = require('../utils')

test('tag-file', function () {
  var content = `<tag-name>
    <script>
      var constructorCode = true
    </script>
    <h1>html test</h1>
  </tag-name>`
  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: 'var constructorCode = true',
    template: `<h1>html test</h1>`
  })
})

test('tag-file without shadow-root', function () {
  var content = `<tag-name no-shadow-root>
    <script>
      var constructorCode = true
    </script>
    <h1>html test</h1>
  </tag-name>`
  var compiled = compiler.compile(content)
  utils.expectTagFileWithoutShadowRoot(compiled, {
    tagName: 'tag-name',
    script: 'var constructorCode = true',
    template: `<h1>html test</h1>`
  })
})
