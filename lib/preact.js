const { h, render } = require('preact')
const hyperx = require('hyperx')

module.exports.render = function (component) {
  component._root = render(component.template(), component, component._root)
}

module.exports.html = function (component) {
  return hyperx((tag, props, kids) => {
    let elProps = {}
    for (let key in props) {
      if (typeof props[key] === 'function' || typeof props[key] === 'object') {
        elProps[key] = props[key]
        delete props[key]
      }
    }
    if (kids) {
      let slotKids = []
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].attributes && kids[i].attributes.slot) {
          let slotVNode = kids.splice(i, 1)
          slotKids.push(slotVNode)
          i -= 1
        }
      }
    }
    let oldRef = props.ref // TODO
    props.ref = (el) => {
      if (el) {
        for (let key in elProps) {
          if (typeof elProps[key] === 'object') {
            el.state[key] = elProps[key]
          }
          if(typeof elProps[key] === 'function') {
            el.on(key, elProps[key])
          }
        }
      }
    }
    return h(tag, props, kids)
  })
}