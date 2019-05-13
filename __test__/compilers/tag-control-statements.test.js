const compiler = require('../../compilers/tag-file')
const utils = require('../utils')

test('compiles both if and each separately', function () {
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

  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: '',
    template: `{
      test
      ?
        <h1 key={this.oid + "-if0"}>
          html test
        </h1>
      : null
    }
    {
      items.map((item) =>
        <h2>{item}</h2>
      )
    }`
  })
})

test('compiles if with inner each', function () {
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

  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: '',
    template: `{
      test
      ?
        <h1 key={this.oid + "-if0"}>
          html test
          {
            items.map((item) =>
              <h2>{item}</h2>
            )
          }
        </h1>
      : null
    }`
  })
})

test('compiles each with inner if', function () {
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

  var compiled = compiler.compile(content)
  utils.expectTagFile(compiled, {
    tagName: 'tag-name',
    script: '',
    template: `{
      items.map((item) =>
        <div>
          <h2>{item}</h2>
          {
            test
            ?
              <h1 key={this.oid+"-if0"}>
                html test
              </h1>
            : null
          }
        </div>
      )
    }`
  })
})
