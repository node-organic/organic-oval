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

  it('compiles with spaces', function () {
    var content = `
      <tag-name>
        <div if={test && test2} class="test-class">
          <h1>html test</h1>
        </div>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test && test2
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

  it('compiles on the same line', function () {
    var content = `
      <tag-name>
        <h1 if={test && test2} class="test-class">test</h1>
        <img if={test && test2} src="test-uri" />
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test && test2
            ? (
              <h1 class="test-class">test</h1>
            )
            : null
        }
        {
          test && test2
            ? (
              <img src="test-uri" />
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('compiles a complicated statement with function', function () {
    var content = `
      <tag-name>
        <h1 if={test && this.test(function (item) { return item.if })} class="test-class">test</h1>
        <h1 if={test && this.test(function (item) { return item.if })}>test</h1>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test && this.test(function (item) {return item.if})
            ? (
              <h1 class="test-class">test</h1>
            )
            : null
        }
        {
          test && this.test(function (item) {return item.if})
            ? (
              <h1>test</h1>
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('compiles a statement along other expressions', function () {
    var content = `
      <tag-name>
        <h1 class="test-class" if={test} id={tag.id} href={tag.href}>
          test
        </h1>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test
            ? (
              <h1 class="test-class" id={tag.id} href={tag.href}>
                test
              </h1>
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('compiles a complicated multiline statement', function () {
    var content = `
      <tag-name>
        <h1 if={test}
          class="test-class">
          test
        </h1>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          test
            ? (
              <h1 class="test-class">
                test
              </h1>
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('compiles a statement with arrow function', function () {
    var content = `
      <tag-name>
        <h1 if={items.map((a) => {return a.value})}
          class="test-class">
          test
        </h1>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          items.map((a) => {return a.value})
            ? (
              <h1 class="test-class">
                test
              </h1>
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })

  it('compiles a statement arrow within', function () {
    var content = `
      <tag-name>
        <h1 if={tag.value > 0}
          class="test-class">
          test
        </h1>
      </tag-name>
    `

    var expectedCompiledCode = `
      <tag-name>
        {
          tag.value > 0
            ? (
              <h1 class="test-class">
                test
              </h1>
            )
            : null
        }
      </tag-name>
    `

    var compiled = compiler.compile(content)
    expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).to.eq(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
  })
})
