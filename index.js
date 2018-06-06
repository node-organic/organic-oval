module.exports = function (plasma, dna) {
  if (!dna.engine) {
    Object.assign(module.exports, require('./lib/morphdom'))
  }
  require('domready')(function () {
    plasma.emit('oval-ready')
  })
}

module.exports.html = function (component) {
  throw new Error('organic-oval is missing html string literal function')
}

module.exports.render = function (component) {
  throw new Error('organic-oval is missing render function')
}

module.exports.defineComponent = function (tagName, Class) {
  customElements.define(tagName, Class)
}

module.exports.WebComponent = class WebComponent extends HTMLElement {
  static define (tagName) {
    module.exports.defineComponent(tagName, this)
  }
  constructor () {
    super()
    this.html = module.exports.html(this)
    this.render = module.exports.render
    this.state = {}
    this.refs = {} // populated during rendering
    this.slots = {} // populated during rendering
    this.kids = null // populated during rendering
  }
  template () {}
  update () {
    this.emit('update')
    this.render(this)
    this.emit('updated')
  }
  shouldUpdate () {
    this.update()
  }
  connectedCallback () {
    this.emit('mount')
    this.update()
    this.emit('mounted')
    this.mounted = true
  }
  attributeChangedCallback () {
    this.update()
  }
  detachedCallback () {
    this.emit('unmount')
    // TODO? 
    this.emit('unmounted')
  }
  
  /* helper methods */
  on (eventName, eventHandler) {
    this.addEventListener(eventName, eventHandler)
  }
  emit (eventName, eventData) {
    let e = new CustomEvent(eventName, {
      detail: eventData,
      bubbles: false
    })
    this.dispatchEvent(e)
  }
}