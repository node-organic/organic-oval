const {h, render, Component} = require('preact')
const components = {}
let OID = 0

const buildCreateElement = function (component) {
  return (tagName, props, ...kids) => {
    if (tagName.toUpperCase() === 'SLOT' && component.props) {
      let childs = component.props.children
      for (let i = 0; i < childs.length; i++) {
        if (childs[i].attributes && childs[i].attributes.slot === props.name) {
          return childs[i]
        }
      }
    }
    if (components[tagName.toUpperCase()]) {
      let custom_el_props = {}
      if (props) {
        custom_el_props.key = props.key
        custom_el_props.slot = props.slot
        for (let key in props) {
          let isPropFunction = typeof props[key] === 'function'
          let isDOMEvent = key.indexOf('on') === 0
          if (isPropFunction && isDOMEvent) {
            custom_el_props[key] = props[key]
            delete props[key]
          }
        }
      }
      return h(tagName, custom_el_props, h(components[tagName.toUpperCase()], props, kids))
    } else {
      return h(tagName, props, kids)
    }
  }
}

module.exports.upgrade = function (el) {
  if (!components[el.tagName.toUpperCase()]) throw new Error('oval component ' + el.tagName.toUpperCase() + ' not found')
  let ComponentClass = components[el.tagName.toUpperCase()]
  el.shadowRoot = render(h(ComponentClass), el, el.shadowRoot)
  return el.component
}

module.exports.define = function (options) {
  if (!options.tagName) throw new Error('options.tagName required')
  options.tagName = options.tagName.toUpperCase()
  components[options.tagName] = class extends Component {
    constructor () {
      super()
      this.createElement = buildCreateElement(this)
      this.oid = OID++
      this.handlers = {}
      this.shouldRender = true
      Object.defineProperty(this, 'shadowRoot', {
        get: () => this.base
      })
      if (options.script) options.script.call(this)
      if (options.template) {
        this.template = options.template.bind(this)
      }
    }
    componentWillMount () {
      this.emit('mount')
      this.emit('update')
    }
    componentWillUpdate () {
      this.emit('update')
    }
    componentDidUpdate () {
      this.emit('updated')
    }
    componentDidMount () {
      this.shadowRoot.parentNode.component = this
      for (let key in this.props) {
        if (typeof this.props[key] === 'function') {
          this.on(key, this.props[key])
        }
      }
      this.emit('updated')
      this.emit('mounted')
    }
    componentWillUnmount () {
      this.emit('unmount')
      this.emit('unmounted') // emulate unmounted
    }
    shouldComponentUpdate () {
      return this.shouldRender
    }
    render (props) {
      return this.template(this.createElement)
    }
    update () {
      if (!this.shouldRender) return
      this.forceUpdate()
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
    unmount () {
      let rootNode = this.shadowRoot.parentNode
      render(null, this.shadowRoot.parentNode, this.shadowRoot)
      render(null, rootNode.parentNode, rootNode)
    }
  }

  let existingElements = document.body.querySelectorAll(options.tagName)
  existingElements.forEach(module.exports.upgrade)

  return components[options.tagName]
}
