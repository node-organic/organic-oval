const { h, render } = require('preact')
const hyperx = require('hyperx')

const components = {}

module.exports.defineComponent = function (tagName, Class) {
  components[tagName.toLowerCase()] = Class
  customElements.define(tagName, Class)
}

module.exports.render = function (component) {
  component.preact_root = render(component.template(), component, component.preact_root)
}

module.exports.html = function (component) {
  return hyperx((tagName, props, kids) => {
    kids = cleanUpKids(kids)
    let elProps = {}
    for (let key in props) {
      if (typeof props[key] === 'function' || typeof props[key] === 'object') {
        elProps[key] = props[key]
        delete props[key]
      }
    }
    
    let children
    if (components[tagName]) {
      let oldRef = props.ref // TODO
      props.ref = (el) => {
        if (el) {
          for (let key in elProps) {
            if (typeof elProps[key] === 'object') {
              if (el.state) {
                el.state[key] = elProps[key]
              } else {
                el[key] = elProps[key]
              }
            }
            if(typeof elProps[key] === 'function') {
              el.on(key, elProps[key])
            }
          }
          el.kids = kids
          el.parentComponent = component
        }
      }
    } else {
      children = kids
    }
    return h(tagName, props, children)
  })
}

const cleanUpKids = function (kids) {
  if (!kids) return
  let result = []
  for (let i = 0; i < kids.length; i++) {
    if (kids[i] === '\n') continue
    result.push(kids[i])
  }
  return result
}