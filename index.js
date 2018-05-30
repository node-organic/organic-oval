const { h, render, Component } = require('preact')
const hyperx = require('hyperx')
const Empty = () => null
const hx = hyperx((tag, props, kids) => {
  if (!props.ref) {
    let dataProps = {}
    let handlers = {}
    for (let key in props) {
      if (typeof props[key] === 'object') {
        dataProps[key] = props[key]
        delete props[key]
      }
      if (typeof props[key] === 'function') {
        handlers[key] = props[key]
        delete props[key]
      }
    }
    props.ref = function (el) {
      if (el) {
        for(let key in dataProps) {
          el[key] = dataProps[key]
        }
        for (let key in handlers) {
          el.addEventListener(key, handlers[key])
        }
      }
    }
  }
  return h(tag, props, kids)
})

module.exports.WebComponent = class WebComponent extends HTMLElement {
  static define (tagName) {
    customElements.define(tagName, this)
  }
  constructor () {
    super()
    this.html = hx
    this.attachShadow({mode: 'open'})
  }
  render () {}
  update () {
    this.emit('update')
    this._root = render(this.render(), this.shadowRoot, this._root)
    this.emit('updated')
  }
  connectedCallback () {
    this.emit('mount')
    this.update()
    this.emit('mounted')
  }
  attributeChangedCallback () {
    this.update()
  }
  detachedCallback () {
    this.emit('unmount')
    // TODO? 
    this.emit('unmounted')
  }
  on (eventName, eventHandler) {
    this.addEventListener(eventName, eventHandler)
  }
  emit (eventName, eventData) {
    let e = new CustomEvent(eventName, {
      detail: eventData
    })
    this.dispatchEvent(e)
  }
}