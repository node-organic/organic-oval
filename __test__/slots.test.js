const oval = require('../index')

oval.define({
  tagName: 'app',
  tagLine: '',
  onconstruct: function () {
    this.template = () => this.createElement('container', null, this.createElement('h1', {slot: 'slot1'}, 'text'))
  }
})

oval.define({
  tagName: 'container',
  tagLine: '',
  onconstruct: function () {
    this.template = () => this.createElement('div', null, this.createElement('slot', {name: 'slot1'}, 'default text'))
  }
})

test('shouldRender', function () {
  var app = document.createElement('app')
  document.body.appendChild(app)
  oval.upgrade(app)
  expect(app.children[0].tagName).toEqual('CONTAINER')
  expect(app.children[0].children[0].tagName).toEqual('DIV')
  expect(app.children[0].children[0].children[0].tagName).toEqual('H1')
})
