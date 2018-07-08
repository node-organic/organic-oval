const {h, render, Component} = require('preact')
const components = {}
let OID = 0

const buildCreateElement = function (component) {
  return (tagName, props, ...kids) => {
    if (components[tagName.toUpperCase()]) {
      return h(tagName, props, h(components[tagName.toUpperCase()], props, kids))
    } else {
      return h(tagName, props, kids)
    }
  }
}

module.exports.upgrade = function (el) {
  if (!components[el.tagName.toUpperCase()]) throw new Error('oval component ' + el.tagName.toUpperCase() + ' not found')
  let ComponentClass = components[el.tagName.toUpperCase()]
  el.root = render(h(ComponentClass), el, el.root)
}

module.exports.define = function (options) {
  if (!options.tagName) throw new Error('options.tagName required')
  options.tagName = options.tagName.toUpperCase()
  components[options.tagName] = class extends Component {
    constructor () {
      super()
      this.oid = OID++
      this.handlers = []
      this.shouldRender = true
      this.createElement = buildCreateElement(this)
      options.script.call(this)
    }
    componentWillMount () {
      this.emit('mount')
    }
    componentWillUpdate () {
      this.emit('update')
    }
    componentDidUpdate () {
      this.emit('updated')
    }
    componentDidMount () {
      this.emit('mounted')
    }
    shouldComponentUpdate () {
      return this.shouldRender
    }
    render () {
      return options.template.call(this, this.createElement)
    }
    update () {
      this.setState(this.state)
    }
    on (eventName, eventHandler) {
      this.handlers[eventName] = eventHandler
    }
    off (eventName, eventHandler) {
      this.handlers[eventName] = null
    }
    emit (eventName, eventData) {
      if (this.handlers[eventName]) {
        this.handlers[eventName](eventData)
      }
    }
  }

  let existingElements = document.body.querySelectorAll(options.tagName)
  existingElements.forEach(module.exports.upgrade)

  return components[options.tagName]
}
