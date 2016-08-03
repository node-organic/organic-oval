describe('oval', function () {
  var oval
  var Tag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }
  Tag.prototype.render = function (createElement) {
    return createElement('div', {})
  }

  before(function () {
    window.document.body.innerHTML = ''
    var plasma = {}
    oval = require('../../index')
    oval.registeredTags = []
    oval.init(plasma)
    expect(oval.plasma.on).to.exist
    expect(oval.plasma.off).to.exist
    expect(oval.plasma.once).to.exist
    expect(oval.plasma.emit).to.exist
    expect(oval.BaseTag).to.exist
  })

  it('createElement', function () {
    var createElementFn = oval.createElement()
    var el = createElementFn('div', [])
    expect(el.tagName).to.eq('DIV')
  })

  it('updateElement', function () {
    var createElementFn = oval.createElement([])
    var el = createElementFn('div', {})
    var el2 = createElementFn('div', {class: 'test'})
    oval.updateElement(el, el2)
    expect(el2.attributes.class.value).to.eq('test')
  })

  it('registerTag', function () {
    oval.registerTag('custom-tag', Tag)
    expect(oval.registeredTags.length).to.eq(1)
  })

  it('getRegisteredTag', function () {
    var Tag = oval.getRegisteredTag('custom-tag')
    expect(Tag).to.eq(Tag)
  })

  it('mountAll(*)', function () {
    var el = document.createElement('custom-tag')
    document.body.appendChild(el)
    var tags = oval.mountAll('*', window.document)
    expect(tags.length).to.eq(1)
  })

  it('mountAll(selector)', function () {
    var el = document.createElement('custom-tag')
    document.body.appendChild(el)
    var tags = oval.mountAll('custom-tag', window.document)
    expect(tags.length).to.eq(1)
  })

  it('appendAt', function () {
    var el = document.createElement('div')
    document.body.appendChild(el)
    var tag = oval.appendAt(el, 'custom-tag')
    expect(tag).to.exist
  })

  it('mountAt', function () {
    var el = document.createElement('div')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag')
    expect(tag).to.exist
  })
})
