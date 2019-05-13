const oval = require('../index')

oval.define({
  tagName: 'custom-tag',
  tagLine: '',
  onconstruct: function () {
    this.template = () => {
      return this.createElement('h1', null, 'test')
    }
  }
})
oval.define({
  tagName: 'parent-custom-tag',
  tagLine: '',
  onconstruct: function () {
    this.template = () => {
      return this.createElement('custom-tag')
    }
  }
})
oval.define({
  tagName: 'custom-tag-with-events',
  tagLine: '',
  onconstruct: function () {
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
    this.on('unmount', () => {
      this.unmountCalledFromTest = true
    })
    this.template = () => this.createElement('div', null, 'events')
  }
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
  let component = oval.upgrade(el)
  expect(component.mountCalled).toEqual(true)
  expect(component.updateCalled).toEqual(true)
  expect(component.updatedCalled).toEqual(true)
  expect(component.mountedCalled).toEqual(true)
  expect(document.body.children.length).toEqual(beforeMount + 1)
  expect(document.body.lastChild.children[0].tagName).toEqual('DIV')
  component.unmount()
  expect(document.body.children.length).toEqual(beforeMount)
  expect(component.unmountCalledFromTest).toEqual(true)
})
