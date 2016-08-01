var oval = require('organic-oval')
oval.init()

class Component {
  constructor (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }

  render (createElement) {
    return createElement(
      'h1',
      {style: 'color: green; text-align: center'},
      'Hello Organic World!'
    )
  }
}

oval.registerTag('app', Component)
oval.mountAll('*', document)
