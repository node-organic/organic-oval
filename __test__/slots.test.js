const oval = require('../index')

oval.define({
  tagName: 'app',
  template: function (h) {
    return h('container', null, h('h1', {slot: 'slot1'}, 'text'))
  }
})

oval.define({
  tagName: 'container',
  template: function (h) {
    return h('div', null, h('slot', {name: 'slot1'}, 'default text'))
  }
})

test('shouldRender', function () {
  var app = document.createElement('app')
  document.body.appendChild(app)
  oval.upgrade(app)
  expect(app.shadowRoot.tagName).toEqual('CONTAINER')
  expect(app.shadowRoot.children[0].tagName).toEqual('DIV')
  expect(app.shadowRoot.children[0].children[0].tagName).toEqual('H1')
})
