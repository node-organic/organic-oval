const {h, render, Component} = require('preact')
const components = {}
let OID = 0

const buildCreateElement = function (component) {
  return (tagName, props, ...kids) => {
    if (components[tagName.toUpperCase()]) {
      return h(tagName, null, h(components[tagName.toUpperCase()], props, kids))
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
        let isPropFunction = typeof this.props[key] === 'function'
        let isDOMEvent = key.indexOf('on') === 0
        if (isPropFunction) {
          if (isDOMEvent) {
            this.shadowRoot.parentNode[key] = this.props[key]
          } else {
            this.on(key, this.props[key])
          }
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
      let result = options.template.call(this, this.createElement)
      if (!result) return result
      let parentKids = this.props.children
      let kids = result.children
      if (kids && parentKids) {
        for (let i = 0; i < parentKids.length; i++) {
          if (parentKids[i].attributes && parentKids[i].attributes.slot) {
            for (let k = 0; k < kids.length; k++) {
              let isSlot = kids[i].nodeName === 'slot'
              let sameSlotName = kids[i].attributes && kids[i].attributes.name === parentKids[i].attributes.slot
              if (isSlot && sameSlotName) {
                kids[i] = parentKids[i]
              }
            }
          }
        }
      }
      return result
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
