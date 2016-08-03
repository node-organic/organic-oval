describe('keep parent tag', function () {
  var oval
  var customTagInstance

  var Tag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.keepTagName = false
    this.testValue = 1
  }
  Tag.prototype.render = function (createElement) {
    return createElement(this.tagName, {},
      createElement('div', {},
        createElement('child-tag', {
          'prop-custom-value': {test: this.testValue}
        })
      )
    )
  }

  var ChildTag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.keepTagName = false
  }
  ChildTag.prototype.render = function (createElement) {
    return createElement(this.tagName, {}, createElement('span', {class: this.props['custom-value'].test}))
  }

  before(function () {
    window.document.body.innerHTML = ''
    var plasma = {}
    oval = require('../../index')
    oval.registeredTags = []
    oval.init(plasma)
    oval.registerTag('custom-tag', Tag)
    oval.registerTag('child-tag', ChildTag)
  })

  it('mount and renders', function () {
    var el = document.createElement('custom-tag')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag')

    expect(document.body.children.length).to.eq(1)
    expect(document.body.children[0].tagName).to.eq('DIV')
    expect(el).to.not.eq(tag.root)
    expect(document.body.children[0].children[0].tagName).to.eq('SPAN')
    expect(document.body.children[0].children[0].attributes.class.value).to.eq('1')

    customTagInstance = tag
  })

  it('re-renders', function () {
    customTagInstance.testValue = 2
    customTagInstance.update()

    expect(document.body.children.length).to.eq(1)
    expect(document.body.children[0].tagName).to.eq('DIV')
    expect(document.body.children[0].children[0].tagName).to.eq('SPAN')
    expect(document.body.children[0].children[0].attributes.class.value).to.eq('2')
  })
})
