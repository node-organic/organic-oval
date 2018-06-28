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

var TagShouldRender = function (tagName, root) {
  oval.BaseTag(this, tagName, root)
  this.renderValue = Math.random().toString()
  this.on('updated', () => { this.shouldRender = false })
}
TagShouldRender.prototype.render = function (createElement) {
  return createElement('span', {class: this.renderValue})
}

beforeEach(function () {
  window.document.body.innerHTML = ''
  var plasma = {}
  oval = require('../../index')
  oval.registeredTags = []
  oval.init(plasma)
  oval.registerTag('custom-tag', Tag)
  oval.registerTag('parent-custom-tag', ParentTag)
  oval.registerTag('custom-tag-with-events', TagWithEvents)
  oval.registerTag('tag-should-render', TagShouldRender)
})

test('mounts', function () {
  var el = document.createElement('custom-tag')
  document.body.appendChild(el)
  var tag = oval.mountAt(el, 'custom-tag')

  expect(document.body.children.length).to.eq(1)
  expect(document.body.children[0].tagName).to.eq('CUSTOM-TAG')

  customTagInstance = tag
})

test('mounts with children', function () {
  var el = document.createElement('parent-custom-tag')
  document.body.appendChild(el)
  var tag = oval.mountAt(el, 'parent-custom-tag')

  expect(el.children.length).to.eq(1)
  expect(el.children[0].tagName).to.eq('CUSTOM-TAG')

  parentCustomTagInstance = tag
})

test('mounts and fires lifecycle events', function () {
  var el = document.createElement('custom-tag-with-events')
  document.body.appendChild(el)
  var tag = oval.mountAt(el, 'custom-tag-with-events')
  expect(tag.mountCalled).to.eq(true)
  expect(tag.updateCalled).to.eq(true)
  expect(tag.updatedCalled).to.eq(true)
  expect(tag.mountedCalled).to.eq(true)
})

test('injectDirectives', function () {
  var el = document.createElement('custom-tag-with-directives')
  document.body.appendChild(el)
  oval.mountAt(el, 'custom-tag-with-directives')
  var target = el.children[0]
  expect(target.attributes.class.value).to.eq('test')
  expect(target.attributes.test).to.not.exist
  expect(target.attributes.custom.value).to.eq('value')
})

test('shouldRender', function () {
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

test('unmounts', function () {
  customTagInstance.unmount()
  expect(customTagInstance.mounted).to.eq(false)
  expect(customTagInstance.root.parentNode).to.not.exist
})

test('unmounts with children', function () {
  parentCustomTagInstance.unmount()
  expect(parentCustomTagInstance.mounted).to.eq(false)
  expect(parentCustomTagInstance.root.parentNode).to.not.exist
  expect(parentCustomTagInstance.root.children[0].tag.mounted).to.eq(false)
  expect(parentCustomTagInstance.root.children[0].parentNode).to.exist
})
