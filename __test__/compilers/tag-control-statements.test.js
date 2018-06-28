var compiler = require('../../compilers/tag-control-statements')

test('compiles both if and each separately', function () {
  var content = `
    <tag-name>
      <h1 if=\${test}>
        html test
      </h1>
      <each item in \${items}>
        <h2>\${item}</h2>
      </each>
    </tag-name>
  `

  var expectedCompiledCode = `
    <tag-name>
      \${
        test
        ? this.html\`
          <h1 oid="\${this.oid}-if0">
            html test
          </h1>
        \`
        : null
      }
      \${
        items.map((item, index) => {
          this.html\`<h2 oid="\${this.oid}-map0-\${index}">\${item}</h2>\`
        })
      }
    </tag-name>
  `

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})

test('compiles if with inner each', function () {
  var content = `
    <tag-name>
      <h1 if=\${test}>
        html test
        <each item in \${items}>
          <h2>\${item}</h2>
        </each>
      </h1>
    </tag-name>
  `

  var expectedCompiledCode = `
    <tag-name>
      \${
        test
        ? this.html\`
          <h1 oid="\${this.oid}-if0">
            html test
            \${
              items.map((item, index) => {
                this.html\`<h2 oid="\${this.oid}-map0-\${index}">\${item}</h2>\`
              })
            }
          </h1>
        \`
        : null
      }
    </tag-name>
  `

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})

test('compiles each with inner if', function () {
  var content = `
    <tag-name>
      <each item in \${items}>
        <div>
          <h2>\${item}</h2>
          <h1 if=\${test}>
            html test
          </h1>
        </div>
      </each>
    </tag-name>
  `

  var expectedCompiledCode = `
    <tag-name>
      \${
        items.map((item, index) => { this.html\`
          <div oid="\${this.oid}-map0-\${index}">
            <h2>\${item}</h2>
            \${
              test
              ? this.html\`
                <h1 oid="\${this.oid}-if0">
                  html test
                </h1>
              \`
              : null
            }
          </div>
        \`})
      }
    </tag-name>
  `

  var compiled = compiler.compile(content)
  expect(compiled.trim().replace(/ /g, '').replace(/\n/g, '')).toEqual(expectedCompiledCode.trim().replace(/ /g, '').replace(/\n/g, ''))
})
