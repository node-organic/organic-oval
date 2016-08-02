describe('oval-compiler', function () {
  var compiler = require('../../lib/compilers/tag-file')
  it('compiles', function () {
    var content = `<tag-name>
    <script>
      var constructorCode = true
    </script>
    <h1>html test</h1>
  </tag-name>
`

    var expectedCompiledCode = `class Tag {
    constructor (tagName, root, props) {
      oval.BaseTag(this, tagName, root, props)
      var tag = this
      var constructorCode = true
    }

    render (createElement) {
      var tag = this
      return <tag-name>
    <h1>html test</h1>
  </tag-name>
    }
  }
  oval.registerTag('tag-name', Tag)
  export default Tag
`

    var compiled = compiler.compile(content)
    expect(compiled.trim()).to.eq(expectedCompiledCode.trim())
  })
})
