const compiler = require('../../compilers/tag-file')
const utils = require('../utils')

test('compiles', function () {
  var content = `
    <tag-name>
      <each item in {items}>
        <h2>{item}</h2>
      </each>
    </tag-name>
  `

  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: '',
    template: `{
      items.map((item) =>
        <h2>{item}</h2>
      )
    }`
  })
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

  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: '',
    template: `{
      items.map((item) =>
        <h2>{item}</h2>
      )
    }
    {
      items.map((item, index) =>
        <h2>{item}-{index}</h2>
      )
    }`
  })
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
  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: '',
    template: `{
      items.map((item) =>
        <h2>{item}</h2>
        {
          items.map((item) =>
            <h1>{item}</h1>
          )
        }
      )
    }`
  })
})
