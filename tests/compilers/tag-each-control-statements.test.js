describe('oval-control-statements each', function () {
  var compiler = require('../../lib/compilers/tag-control-statements')

  it('compiles', function () {
    var content = `
      <tag-name>
        <each item in {items}>
          <h2>{item}</h2>
        </each>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          items.map((item) => (<h2>{item}</h2>))
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })
})
