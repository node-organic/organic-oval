const {bind, wire} = require('hyperhtml/cjs/index.js')
const components = {}

module.exports.defineComponent = function (tagName, Class) {
  components[tagName.toLowerCase()] = Class
  customElements.define(tagName, Class)
}
module.exports.render = function (component) {
  bind(component, component.template())
}
module.exports.html = function (component) {
  return wire(component)
}