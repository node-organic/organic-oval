var compiler = require('../../compilers/tag-file')
test('tag-file', function () {
  var content = `<tag-name>
  <script>
    var constructorCode = true
  </script>
  <h1>html test</h1>
</tag-name>
`

  var expectedCompiledCode = `return require('organic-oval').define({
  tagName: "tag-name",
  tagLine: "",
  script: function () {
    var constructorCode = true
  },
  template: function () {
    return this.html\`<h1>html test</h1>\`
  }
})
`

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})
