const oval = require('../../../index')
Object.assign(oval, require('../../../engines/incremental-dom'))

oval.define({
  tagName: 'custom-tag',
  template: function () { return this.html`<h1>test</h1>` }
})
oval.define({
  tagName: 'parent-custom-tag',
  template: function () { return this.html`<custom-tag />` }
})
oval.define({
  tagName: 'custom-tag-with-events',
  script: function () {
    this.on('mount', () => {
      this.mountCalled = true
    })
    this.on('mounted', () => {
      this.mountedCalled = true
    })
    this.on('update', () => {
      this.updateCalled = true
    })
    this.on('updated', () => {
      this.updatedCalled = true
    })
    this.on('unmounted', () => {
      this.unmountedCalled = true
    })
  },
  template: function () { return this.html`<div>events</div>` }
})

test('mounts', function () {
  var el = document.createElement('custom-tag')
  document.body.appendChild(el)
  oval.upgrade(el)
  expect(document.body.children.length).toEqual(1)
  expect(document.body.children[0].tagName).toEqual('CUSTOM-TAG')
  expect(document.body.children[0].children[0].tagName).toEqual('H1')
})

test('mounts with children', function () {
  var el = document.createElement('parent-custom-tag')
  document.body.appendChild(el)
  oval.upgrade(el)

  expect(el.children.length).toEqual(1)
  expect(el.children[0].tagName).toEqual('CUSTOM-TAG')
  expect(el.children[0].children[0].tagName).toEqual('H1')
})

test('mounts and fires lifecycle events', function () {
  let beforeMount = document.body.children.length
  var el = document.createElement('custom-tag-with-events')
  document.body.appendChild(el)
  oval.upgrade(el)
  expect(el.mountCalled).toEqual(true)
  expect(el.updateCalled).toEqual(true)
  expect(el.updatedCalled).toEqual(true)
  expect(el.mountedCalled).toEqual(true)
  expect(document.body.children.length).toEqual(beforeMount + 1)
  expect(document.body.lastChild.children[0].tagName).toEqual('DIV')
  el.unmount()
  expect(el.unmountedCalled).toEqual(true)
  expect(document.body.children.length).toEqual(beforeMount)
})
