describe('tag directive tagName', function () {
  require('../env')()

  var oval
  var customTagInstance

  var TagWithRenderDirective = function (root, props, attrs) {
    oval.BaseTag(this, root, props, attrs)
  }
  TagWithRenderDirective.prototype.render = function (createElement) {
    return createElement('div')
  }

  var Tag = function (root, props, attrs) {
    oval.BaseTag(this, root, props, attrs)
    this.injectDirectives({
      'render-as': function (tag, directiveName) {
        return {
          tagName: function (tagName, props) {
            return props[directiveName]
          }
        }
      }
    })
  }
  Tag.prototype.render = function (createElement) {
    return createElement('custom-tag-with-render', {'render-as': 'button'})
  }

  before(function () {
    window.document.body.innerHTML = ''
    var plasma = {}
    oval = require('../../index')
    oval.registeredTags = []
    oval.init(plasma)
    oval.registerTag('custom-tag', Tag)
    oval.registerTag('custom-tag-with-render', TagWithRenderDirective)
  })

  it('mount and renders', function () {
    var tag = oval.appendAt(document.body, 'custom-tag')
    expect(document.body.children[0].tagName).to.eq('CUSTOM-TAG')
    expect(tag.root.children[0].tagName).to.eq('BUTTON')
    customTagInstance = tag
  })

  it('re-renders', function () {
    customTagInstance.update()
    expect(customTagInstance.root.tagName).to.eq('CUSTOM-TAG')
    expect(customTagInstance.root.children[0].tagName).to.eq('BUTTON')
  })
})
