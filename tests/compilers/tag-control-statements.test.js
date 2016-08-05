describe('oval-control-statements', function () {
  var compiler = require('../../lib/compilers/tag-control-statements')

  it('compiles both if and each separately', function () {
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

  it('compiles if with inner each', function () {
    var content = `
      <tag-name>
        <h1 if={test}>
          html test
          <each item in {items}>
            <h2>{item}</h2>
          </each>
        </h1>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test
          ? (
            <h1>
              html test
              {
                items.map((item) => (<h2>{item}</h2>))
              }
            </h1>
          )
          : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('compiles each with inner if', function () {
    var content = `
      <tag-name>
        <each item in {items}>
          <div>
            <h2>{item}</h2>
            <h1 if={test}>
              html test
            </h1>
          </div>
        </each>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          items.map((item) => (
            <div>
              <h2>{item}</h2>
              {
                test
                ? (
                  <h1>
                    html test
                  </h1>
                )
                : null
              }
            </div>
          ))
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })
})
