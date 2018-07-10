var compiler = require('../../compilers/tag-control-statements')

test('compiles', function () {
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
        items.map((item) =>
          <h2>{item}</h2>
        )
      }
    </tag-name>
  `

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})

test('compiles multiple each statements', function () {
  var content = `
    <tag-name>
      <each item in {items}>
        <h2>{item}</h2>
      </each>
      <each item, index in {items}>
        <h2>{item}-{index}</h2>
      </each>
    </tag-name>
  `

  var expectedCompiledCode = `
    <tag-name>
      {
        items.map((item) =>
          <h2>{item}</h2>
        )
      }
      {
        items.map((item, index) =>
          <h2>{item}-{index}</h2>
        )
      }
    </tag-name>
  `

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})

test('compiles multiple nested each statements', function () {
  var content = `
    <tag-name>
      <each item in {items}>
        <h2>{item}</h2>
        <each item in {items}>
          <h1>{item}</h1>
        </each>
      </each>
    </tag-name>
  `

  var expectedCompiledCode = `
    <tag-name>
      {
        items.map((item) =>
          <h2>{item}</h2>
          {
            items.map((item) =>
              <h1>{item}</h1>
            )
          }
        )
      }
    </tag-name>
  `

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})
