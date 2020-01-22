const oval = require('../index')

const Component = oval.define({
  tagName: 'tag-append-at',
  tagLine: '',
  onconstruct: function () {
    expect(this.props).toEqual(undefined)
    this.template = () => this.createElement('div', {
      class: this.props.value
    })
  }
})

test('props onconstruct', function () {
  var container = document.createElement('div')
  document.body.appendChild(container)
  Component.appendAt(container, {
    value: '1'
  })
  let el = container.children[0].children[0]
  expect(el.attributes.class.value).toEqual('1')
})
