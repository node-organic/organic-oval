describe('tag attributes', function () {
  var oval
  var customTagInstance

  var Tag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }
  Tag.prototype.render = function (createElement) {
    return createElement(this.tagName, this.attributes)
  }
  before(function () {
    window.document.body.innerHTML = ''
    var plasma = {}
    oval = require('../../index')
    oval.registeredTags = []
    oval.init(plasma)
    oval.registerTag('custom-tag', Tag)
  })

  it('mount and renders', function () {
    var el = document.createElement('custom-tag')
    el.setAttribute('class', 'test')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag')
    expect(el.attributes.class.value).to.eq('test')
    customTagInstance = tag
  })

  it('re-renders', function () {
    customTagInstance.update()
    expect(document.body.children[0].attributes.class.value).to.eq('test')
  })
})
