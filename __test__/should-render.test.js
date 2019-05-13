const oval = require('../index')

oval.define({
  tagName: 'tag-should-render',
  tagLine: '',
  onconstruct: function () {
    this.renderValue = '1'
    this.on('updated', () => {
      this.shouldRender = false
    })
    this.template = () => this.createElement('div', {'class': this.renderValue})
  }
})

oval.define({
  tagName: 'tag-container',
  tagLine: '',
  onconstruct: function () {
    this.template = () => this.createElement('tag-should-render')
  }
})

test('shouldRender', function () {
  var container = document.createElement('tag-container')
  document.body.appendChild(container)
  oval.upgrade(container)
  let el = container.children[0]
  var target = el.children[0]
  expect(el.component.shouldRender).toEqual(false)
  var renderValue = el.component.renderValue
  expect(target.attributes.class.value).toEqual(renderValue)
  el.component.renderValue = 'changed'
  el.component.shouldRender = true
  el.component.update()
  expect(el.component.shouldRender).toEqual(false)
  expect(target.attributes.class.value).toEqual('changed')
  el.component.renderValue = 'changed2'
  el.component.update()
  expect(target.attributes.class.value).toEqual('changed')
  el.component.forceUpdate()
  expect(target.attributes.class.value).toEqual('changed2')
})
