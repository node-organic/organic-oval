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

test('shouldRender', function () {
  var el = document.createElement('tag-should-render')
  document.body.appendChild(el)
  oval.upgrade(el)
  var target = el.children[0]
  expect(el.shouldRender).toEqual(false)
  var renderValue = el.renderValue
  expect(target.attributes.class.value).toEqual(renderValue)
  el.renderValue = 'changed'
  el.shouldRender = true
  el.update()
  expect(el.shouldRender).toEqual(false)
  expect(target.attributes.class.value).toEqual('changed')
  el.renderValue = 'changed2'
  el.update()
  expect(target.attributes.class.value).toEqual('changed')
})
