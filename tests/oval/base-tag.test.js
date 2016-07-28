describe('base-tag', function () {
  var oval
  var customTagInstance
  var parentCustomTagInstance
  var Tag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }
  Tag.prototype.render = function (createElement) {
    return createElement(this.tagName, {})
  }

  var ParentTag = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }
  ParentTag.prototype.render = function (createElement) {
    return createElement(this.tagName, {}, createElement('custom-tag'))
  }

  var TagWithEvents = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.on('mount', () => this.mountCalled = true)
    this.on('update', () => this.updateCalled = true)
    this.on('updated', () => this.updatedCalled = true)
    this.on('mounted', () => this.mountedCalled = true)
  }
  TagWithEvents.prototype.render = function (createElement) {
    return createElement(this.tagName, {})
  }

  var TagWithDirectives = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.injectDirectives([function (tagName, props, ...children) {
      props.class = 'test'
    }])
  }
  TagWithDirectives.prototype.render = function (createElement) {
    return createElement(this.tagName, {})
  }

  var TagShouldRender = function (tagName, root) {
    oval.BaseTag(this, tagName, root)
    this.rendered = false
    this.renderValue = Math.random().toString()
    this.on('updated', () => this.rendered = true)
  }
  TagShouldRender.prototype.shouldRender = function () {
    return !this.rendered
  }
  TagShouldRender.prototype.render = function (createElement) {
    return createElement(this.tagName, {class: this.renderValue})
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
    var tag = oval.mountAt(el, 'custom-tag-with-directives')

    expect(el.attributes.class.value).to.eq('test')
  })

  it('shouldRender', function () {
    var el = document.createElement('tag-should-render')
    document.body.appendChild(el)
    var tag = oval.mountAt(el, 'tag-should-render')
    expect(tag.rendered).to.eq(true)
    var renderValue = tag.renderValue
    expect(el.attributes.class.value).to.eq(renderValue)
    tag.renderValue = 'changed'
    tag.rendered = false
    tag.update()
    expect(el.attributes.class.value).to.eq('changed')
    expect(tag.rendered).to.eq(true)
    tag.renderValue = 'changed2'
    tag.update()
    expect(el.attributes.class.value).to.eq('changed')
  })

  it('unmounts', function () {
    customTagInstance.unmount()
    expect(customTagInstance.lifecycle.mounted).to.eq(false)
    expect(customTagInstance.root.parentNode).to.not.exist
  })

  it('unmounts with children', function () {
    parentCustomTagInstance.unmount()
    expect(parentCustomTagInstance.tagName).to.eq('parent-custom-tag')
    expect(parentCustomTagInstance.lifecycle.mounted).to.eq(false)
    expect(parentCustomTagInstance.root.parentNode).to.not.exist
    expect(parentCustomTagInstance.childTags[0].lifecycle.mounted).to.eq(false)
    expect(parentCustomTagInstance.childTags[0].root.parentNode).to.exist
  })
})
