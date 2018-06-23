module.exports = function (plasma, dna) {
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

module.exports.define = function (options) {
  let Class = class extends HTMLElement {
    static get observedAttributes () {return []}
    constructor () {
      super()
      this.mounted = false
      this.html = module.exports.html(this)
      this.render = module.exports.render(this)
      this.state = {} // populated during rendering
      this.kids = null // populated during rendering
      options.script.bind(this)()
    }
    template () {
      return options.template(this.html)
    }
    update () {
      this.emit('update')
      this.render()
      this.emit('updated')
    }
    shouldUpdate (newState) {
      Object.assign(this.state, newState)
      this.update()
    }
    connectedCallback () {
      this.emit('mount')
      this.update()
      this.mounted = true
      this.emit('mounted')
    }
    attributeChangedCallback () {
      this.update()
    }
    propertyChangedCallback () {
      this.update()
    }
    adoptedCallback () {
      // TODO?
    }
    disconnectedCallback () {
      this.emit('unmount')
      // TODO? 
      this.emit('unmounted')
    }
    
    /* helper methods */
    on (eventName, eventHandler) {
      this.addEventListener(eventName, eventHandler)
    }
    off (eventName, eventHandler) {
      this.removeEventListener(eventName, eventHandler)
    }
    emit (eventName, eventData) {
      let e = new CustomEvent(eventName, {
        detail: eventData,
        bubbles: false
      })
      this.dispatchEvent(e)
    }
  }
  customElements.define(options.tagName, Class)
  return Class
}