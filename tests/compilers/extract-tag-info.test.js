describe('oval-compiler - extractTagInfo', function () {
  const {extractTagInfo, extractScript} = require('../../lib/compilers/tag-file')

  it('name only', function () {
    var content = `
      <tag-name>
        <script>
          var constructorCode = true
        </script>
        <h1>html test</h1>
      </tag-name>
    `
    var lines = content.trim().split('\n')
    extractScript(lines)
    var tagInfo = extractTagInfo(lines)
    expect(tagInfo.tagName).to.eq('tag-name')
    expect(tagInfo.tagAttributes).to.deep.eq({})
  })

  it('attrs', function () {
    var content = `
      <tag-name attr1="a" attr2="b">
        <script>
          var constructorCode = true
        </script>
        <h1>html test</h1>
      </tag-name>
    `
    var lines = content.trim().split('\n')
    extractScript(lines)
    var tagInfo = extractTagInfo(lines)
    expect(tagInfo.tagName).to.eq('tag-name')
    expect(tagInfo.tagAttributes).to.deep.eq({attr1: 'a', attr2: 'b'})
  })

  it('flags', function () {
    var content = `
      <tag-name fl-ag1 fl2ag2 flag1 flag-two FLAG_THREE3>
        <script>
          var constructorCode = true
        </script>
        <h1>html test</h1>
      </tag-name>
    `
    var lines = content.trim().split('\n')
    extractScript(lines)
    var tagInfo = extractTagInfo(lines)
    expect(tagInfo.tagName).to.eq('tag-name')
    expect(tagInfo.tagAttributes).to.deep.eq({})
    expect(tagInfo.tagFlags).to.deep.eq(['fl-ag1', 'fl2ag2', 'flag1', 'flag-two', 'FLAG_THREE3'])
  })

  it('attrs and flags', function () {
    var content = `
      <tag-name attr1="a" flag_0 attr2="b" flag1 flag2>
        <script>
          var constructorCode = true
        </script>
        <h1>html test</h1>
      </tag-name>
    `
    var lines = content.trim().split('\n')
    extractScript(lines)
    var tagInfo = extractTagInfo(lines)
    expect(tagInfo.tagName).to.eq('tag-name')
    expect(tagInfo.tagAttributes).to.deep.eq({attr1: 'a', attr2: 'b'})
    expect(tagInfo.tagFlags).to.deep.eq(['flag_0', 'flag1', 'flag2'])
  })
})
