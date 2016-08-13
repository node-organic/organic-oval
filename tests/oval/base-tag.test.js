describe('base-tag', function () {
  require('../env')()

  var oval
  var customTagInstance
  var parentCustomTagInstance
  var Tag = function (root) {
    oval.BaseTag(this, root)
  }
  Tag.prototype.render = function (createElement) {
    return createElement('span', {})
  }

  var ParentTag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }
  ParentTag.prototype.render = function (createElement) {
    return createElement('custom-tag')
  }

  var TagWithEvents = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.on('mount', () => { this.mountCalled = true })
    this.on('update', () => { this.updateCalled = true })
    this.on('updated', () => { this.updatedCalled = true })
    this.on('mounted', () => { this.mountedCalled = true })
  }
  TagWithEvents.prototype.render = function (createElement) {
    return createElement('span', {})
  }

  var TagWithDirectives = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    var directive = function (tag) {
      return {
        preCreate: function (createElement, tagName, props, ...children) {
          props.class = 'test'
        },
        postCreate: function (el) {
          el.setAttribute('custom', 'value')
        }
      }
    }
    this.injectDirectives({
      'test': directive
    })
  }
  TagWithDirectives.prototype.render = function (createElement) {
    return createElement('span', {test: ''})
  }

  var TagShouldRender = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.renderValue = Math.random().toString()
    this.on('updated', () => { this.shouldRender = false })
  }
  TagShouldRender.prototype.render = function (createElement) {
    return createElement('span', {class: this.renderValue})
  }

  before(function () {
    window.document.body.innerHTML = ''
    var plasma = {}
    oval = require('../../index')
    oval.registeredTags = []
    oval.init(plasma)
    oval.registerTag('custom-tag', Tag)
    oval.registerTag('parent-custom-tag', ParentTag)
    oval.registerTag('custom-tag-with-events', TagWithEvents)
    oval.registerTag('custom-tag-with-directives', TagWithDirectives)
    oval.registerTag('tag-should-render', TagShouldRender)
  })

  it('mounts', function () {
    var el = document.createElement('custom-tag')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag')

    expect(document.body.children.length).to.eq(1)
    expect(document.body.children[0].tagName).to.eq('CUSTOM-TAG')

    customTagInstance = tag
  })

  it('mounts with children', function () {
    var el = document.createElement('parent-custom-tag')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'parent-custom-tag')

    expect(el.children.length).to.eq(1)
    expect(el.children[0].tagName).to.eq('CUSTOM-TAG')

    parentCustomTagInstance = tag
  })

  it('mounts and fires lifecycle events', function () {
    var el = document.createElement('custom-tag-with-events')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'custom-tag-with-events')
    expect(tag.mountCalled).to.eq(true)
    expect(tag.updateCalled).to.eq(true)
    expect(tag.updatedCalled).to.eq(true)
    expect(tag.mountedCalled).to.eq(true)
  })

  it('injectDirectives', function () {
    var el = document.createElement('custom-tag-with-directives')
    document.body.appendChild(el)
    oval.mountAt(el, 'custom-tag-with-directives')
    var target = el.children[0]
    expect(target.attributes.class.value).to.eq('test')
    expect(target.attributes.test.value).to.eq('')
    expect(target.attributes.custom.value).to.eq('value')
  })

  it('shouldRender', function () {
    var el = document.createElement('tag-should-render')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'tag-should-render')
    var target = el.children[0]
    expect(tag.shouldRender).to.eq(false)
    var renderValue = tag.renderValue
    expect(target.attributes.class.value).to.eq(renderValue)
    tag.renderValue = 'changed'
    tag.shouldRender = true
    tag.update()
    expect(tag.shouldRender).to.eq(false)
    expect(target.attributes.class.value).to.eq('changed')
    tag.renderValue = 'changed2'
    tag.update()
    expect(target.attributes.class.value).to.eq('changed')
  })

  it('unmounts', function () {
    customTagInstance.unmount()
    expect(customTagInstance.mounted).to.eq(false)
    expect(customTagInstance.root.parentNode).to.not.exist
  })

  it('unmounts with children', function () {
    parentCustomTagInstance.unmount()
    expect(parentCustomTagInstance.mounted).to.eq(false)
    expect(parentCustomTagInstance.root.parentNode).to.not.exist
    expect(parentCustomTagInstance.root.children[0].tag.mounted).to.eq(false)
    expect(parentCustomTagInstance.root.children[0].parentNode).to.exist
  })
})
