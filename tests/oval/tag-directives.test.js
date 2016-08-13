describe('tag directives', function () {
  require('../env')()

  var oval
  var customTagInstance

  var Tag = function (root, props, attrs) {
    oval.BaseTag(this, root, props, attrs)
    this.injectDirectives({
      augment1: function (tag, directiveName) {
        return {
          preCreate: function (createElement, tagName, props, ...children) {
            props.customValue = props[directiveName]
          }
        }
      },
      augment2: function (tag, directiveName) {
        return {
          preCreate: function (createElement, tagName, props, ...children) {
            props.customValue += props[directiveName]
          }
        }
      }
    })
  }
  Tag.prototype.render = function (createElement) {
    return createElement('div', this.attributes)
  }

  var TagWithNewChildren = function (root, props, attrs) {
    oval.BaseTag(this, root, props, attrs)
    this.injectDirectives({
      augment: function (tag) {
        return {
          preCreate: function (createElement, tagName, props, ...children) {
            return [createElement('div')]
          }
        }
      }
    })
  }
  TagWithNewChildren.prototype.render = function (createElement) {
    return createElement('div', this.attributes)
  }

  before(function () {
    window.document.body.innerHTML = ''
    var plasma = {}
    oval = require('../../index')
    oval.registeredTags = []
    oval.init(plasma)
    oval.registerTag('custom-tag', Tag)
    oval.registerTag('custom-tag-with-new-children', TagWithNewChildren)
  })

  it('mount and renders', function () {
    var el = document.createElement('custom-tag')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag', {}, {'augment1': '4', 'augment2': '2'})
    expect(el.children[0].getAttribute('customValue')).to.eq('42')
    customTagInstance = tag
  })

  it('re-renders', function () {
    customTagInstance.update()
    expect(customTagInstance.root.children[0].attributes.customvalue.value).to.eq('42')
  })

  it('replaces children', function () {
    var el = document.createElement('custom-tag-with-new-children')
    el.setAttribute('augment', '')
    document.body.appendChild(el)
    var child = document.createElement('p')
    el.appendChild(child)
    expect(el.children.length).to.eq(1)
    oval.mountAt(el, 'custom-tag-with-new-children')
    expect(el.children.length).to.eq(1)
    expect(el.children[0].tagName).to.eq('DIV')
  })
})
