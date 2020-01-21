const oval = require('../index')

const Component = oval.define({
  tagName: 'tag-append-at',
  tagLine: '',
  onconstruct: function () {
    this.template = () => this.createElement('div', {})
  }
})

test('append-at', function () {
  var container = document.createElement('div')
  document.body.appendChild(container)
  Component.appendAt(container, {
    class: '1'
  })
  let el = container.children[0]
  expect(el.attributes.class.value).toEqual('1')
})
