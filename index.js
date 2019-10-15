const {h, render, Component, Fragment} = require('preact')
const components = {}
let OID = 0

const buildCreateElement = function (component) {
  return (input, props, ...kids) => {
    if (input === Fragment) return h(Fragment, props, kids)
    let isComponentClass = typeof input !== 'string'
    let tagName = isComponentClass ? input.tagName : input
    tagName = tagName.toUpperCase()
    if (tagName === 'SLOT' && component.props) {
      let childs = component.props.children || []
      for (let i = 0; i < childs.length; i++) {
        if (childs[i] && childs[i].props && childs[i].props.slot === props.name) {
          return childs[i]
        }
      }
    }
    if (components[tagName] || isComponentClass) {
      let custom_el_props = {}
      if (props) {
        custom_el_props.key = props.key
        custom_el_props.slot = props.slot
        for (let key in props) {
          if (key.indexOf('prop-') === 0) {
            continue // pass implicitly as component prop
          }
          let isPropFunction = typeof props[key] === 'function'
          let isDOMEvent = key.indexOf('on') === 0
          if (isPropFunction && isDOMEvent) {
            custom_el_props[key] = props[key]
            delete props[key]
          }
          if (typeof props[key] === 'string') {
            custom_el_props[key] = props[key]
            delete props[key]
          }
        }
        for (let key in props) {
          if (key.indexOf('prop-') === 0) {
            props[key.replace('prop-', '')] = props[key]
            delete props[key]
          }
        }
      }
      return h(tagName, custom_el_props, h(components[tagName] || input, props, kids))
    } else {
      return h(tagName, props, kids)
    }
  }
}

module.exports.upgrade = function (el, props) {
  if (!components[el.tagName]) throw new Error('oval component ' + el.tagName + ' not found')
  let ComponentClass = components[el.tagName]
  el.preactRenderRef = render(h(ComponentClass, props), el, el.preactRenderRef)
  return el.component
}

module.exports.define = function (options) {
  if (!options.tagName) throw new Error('options.tagName required')
  options.tagName = options.tagName.toUpperCase()
  if (components[options.tagName]) return components[options.tagName]
  let isGlobal = true
  if (options.tagLine.indexOf('not-global') !== -1) {
    isGlobal = false
  }
  const OvalComponent = class extends Component {
    constructor () {
      super()
      this.createElement = buildCreateElement(this)
      this.oid = OID++
      this.handlers = {}
      this.shouldRender = true
      this.unmountCalled = false
      Object.defineProperty(this, 'el', {
        get: () => {
          if (!this.base) {
            throw new Error('Component base not found to provide `el` reference. Is the component ' + options.tagName + ' mounted?')
          }
          return this.base.parentNode
        }
      })
      if (options.onconstruct) options.onconstruct.call(this)
    }
    on (eventName, eventHandler) {
      this.handlers[eventName] = this.handlers[eventName] || []
      this.handlers[eventName].push(eventHandler)
    }
    off (eventName, eventHandler) {
      let index = this.handlers[eventName].indexOf(eventHandler)
      if (index === -1) return
      this.handlers[eventName].splice(index, 1)
    }
    emit (eventName, eventData) {
      if (this.handlers[eventName]) {
        this.handlers[eventName].forEach(f => f(eventData))
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
      this.el.component = this
      this.el.state = this.state
      this.el.on = this.on.bind(this)
      this.el.off = this.off.bind(this)
      this.el.emit = this.emit.bind(this)
      this.el.unmount = this.unmount.bind(this)
      this.el.update = this.update.bind(this)
      for (let key in this.props) {
        if (typeof this.props[key] === 'function') {
          this.el.on(key, this.props[key])
        }
      }
      this.emit('updated')
      this.emit('mounted')
    }
    update () {
      if (!this.shouldRender) return
      this.forceUpdate()
    }
    unmount () {
      let rootNode = this.el
      render(null, rootNode, rootNode.preactRenderRef)
      rootNode.parentNode.removeChild(rootNode)
    }
    componentWillUnmount () {
      this.emit('unmount')
      this.unmountCalled = true
    }
    shouldComponentUpdate () {
      return this.shouldRender
    }
    render (props, state) {
      if (this.defaultProps) {
        props = Object.assign({}, this.defaultProps, props)
      }
      return this.template(Fragment, props, state)
    }
    static appendAt (container, props) {
      let el = document.createElement(options.tagName)
      container.appendChild(el)
      el.preactRenderRef = render(h(this, props), el, el.preactRenderRef)
      return el
    }
    static get tagName () {
      return options.tagName
    }
    static get defaultProps () {
      return options.tagProps || {}
    }
  }
  if (isGlobal) {
    components[options.tagName] = OvalComponent
    let existingElements = document.body.querySelectorAll(options.tagName)
    existingElements.forEach(module.exports.upgrade)
  }
  return OvalComponent
}
