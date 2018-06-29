let OID = 0

module.exports.upgrade = function (el) {
  throw new Error('not supported')
}

module.exports.render = function (component) {
  return function () {
    component.innerHTML = component.template()
  }
}

module.exports.html = function (component) {
  return String.raw
}

module.exports.define = function (options) {
  let Class = class extends HTMLElement {
    static get observedAttributes () {
      return [] // TODO ?
    }
    constructor () {
      super()
      this.oid = OID++
      require('../lib/custom-element')(this)
      this.html = module.exports.html(this)
      this.render = module.exports.render(this)
      if (options.script) {
        options.script.call(this)
      }
    }
    template () {
      return options.template.call(this)
    }
    attributeChangedCallback () {
      this.update()
    }
    adoptedCallback () {
      this.update()
    }
  }
  customElements.define(options.tagName, Class)
  return Class
}
