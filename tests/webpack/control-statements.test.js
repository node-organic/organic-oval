describe('oval-control-statements', function () {
  var compiler = require('../../webpack/oval-control-statements')
  it('compiles', function () {
    var content = `<tag-name>
    <virtual if={test}>
      <h1>html test</h1>
    </virtual>
    <each item in {items}>
      <h2>{item}</h2>
    </each>
  </tag-name>
`

    var expectedCompiledCode = `<tag-name>
{test ? <virtual><h1>html test</h1></virtual> : ""}
    { items.map((item) => 
      <h2>{item}</h2>
    )}
  </tag-name>
`

    var compiled = compiler.compile(content)
    expect(compiled.trim()).to.eq(expectedCompiledCode.trim())
  })
})
