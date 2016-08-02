describe('oval-control-statements', function () {
  var compiler = require('../../lib/compilers/tag-control-statements')
  it('compiles', function () {
    var content = `
      <tag-name>
        <h1 if={test}>
          html test
        </h1>
        <each item in {items}>
          <h2>{item}</h2>
        </each>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test
          ? (
            <h1>
              html test
            </h1>
          )
          : null
        }
        {
          items.map((item) => (<h2>{item}</h2>))
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('does not strip el attributes on if usage', function () {
    var content = `
      <tag-name>
        <div if={test} class="test-class">
          <h1>html test</h1>
        </div>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test
            ? (
              <div class="test-class">
                <h1>html test</h1>
              </div>
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })
})
