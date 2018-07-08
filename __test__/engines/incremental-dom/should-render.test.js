const oval = require('../../../index')
Object.assign(oval, require('../../../engines/incremental-dom'))

oval.define({
  tagName: 'tag-should-render',
  script: function () {
    this.renderValue = '1'
    this.on('updated', () => {
      this.shouldRender = false
    })
  },
  template: function () {
    return this.html`<div class=${this.renderValue} />`
  }
})

oval.define({
  tagName: 'tag-container',
  script: function () {},
  template: function () {
    return this.html`<tag-should-render />`
  }
})

test('shouldRender', function () {
  var container = document.createElement('tag-container')
  document.body.appendChild(container)
  oval.upgrade(container)
  let el = container.children[0]
  var target = el.children[0]
  expect(el.shouldRender).toEqual(false)
  var renderValue = el.renderValue
  expect(target.attributes.class.value).toEqual(renderValue)
  el.renderValue = 'changed'
  el.shouldRender = true
  container.update()
  expect(el.shouldRender).toEqual(false)
  expect(target.attributes.class.value).toEqual('changed')
  el.renderValue = 'changed2'
  container.update()
  expect(target.attributes.class.value).toEqual('changed')
  el.update()
  expect(target.attributes.class.value).toEqual('changed2')
})
