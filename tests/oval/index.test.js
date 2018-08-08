describe('oval', function () {
  require('../env')()

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
    oval.mountAll(document.body)
    expect(document.body.children.length).to.eq(1)
  })

  it('appendAt - tag name', function () {
    var el = document.createElement('div')
    document.body.appendChild(el)
    var tag = oval.appendAt(el, 'custom-tag')
    expect(tag).to.exist
  })

  it('appendAt - tag class', function () {
    var el = document.createElement('div')
    document.body.appendChild(el)
    var tag = oval.appendAt(el, Tag)
    expect(tag).to.exist
  })

  it('mountAt - tag name', function () {
    var el = document.createElement('div')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag')
    expect(tag).to.exist
  })

  it('mountAt - tag class', function () {
    var el = document.createElement('div')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, Tag)
    expect(tag).to.exist
  })
})
