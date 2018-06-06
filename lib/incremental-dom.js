const IncrementalDOM = require('incremental-dom')
const hyperx = require('hyperx')

const components = {}

module.exports.defineComponent = function (tagName, Class) {
  components[tagName.toLowerCase()] = Class
  customElements.define(tagName, Class)
}

module.exports.render = function (component) {
  let result = component.template()
  if (typeof result === 'function') {
    IncrementalDOM.patch(component, result)
  }
}

module.exports.html = function (component) {
  return hyperx((tagName, props, kids) => {
    return function () {
      var parsedAttrs = parseAttrsObj(props)
      IncrementalDOM.elementOpenStart(tagName, parsedAttrs.key, parsedAttrs.staticAttrs)
      for (var key in parsedAttrs.attrs) {
        IncrementalDOM.attr(key, parsedAttrs.attrs[key])
      }
      let createdElement = IncrementalDOM.elementOpenEnd()
      createdElement.slots = kids
      if (kids) {
        appendChild(kids)
      }
      IncrementalDOM.elementClose(tagName)
    }
  })
}

const appendChild = function (childs) {
  for (var i = 0; i < childs.length; i++) {
    var node = childs[i]
    if (node === null) continue
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'string' ||
      node instanceof Date ||
      node instanceof RegExp) {
      IncrementalDOM.text(node)
      continue
    }
    if ((typeof node === 'undefined' || node === null)) {
      IncrementalDOM.text('')
      continue
    }
    if (Array.isArray(node)) {
      appendChild(node)
      continue
    }
    if (typeof node === 'function') {
      node()
    } else {
      console.warn('found unknown node', node, tagName, props, children)
    }
  }
}

const parseAttrsObj = function (attrsObj) {
  var props = {}
  var attrs = {}
  var staticAttrs = []
  var keyAttr = null

  if (attrsObj) {
    var attrsObjKeys = Object.keys(attrsObj)

    for (var i = 0; i < attrsObjKeys.length; i++) {
      var key = attrsObjKeys[i]
      var val = attrsObj[key]
      
      if (key === 'className') {
        attrs['class'] = val
        continue
      }
      
      attrs[key] = val
    }
  }

  return {
    attrs: attrs,
    staticAttrs: staticAttrs,
    key: keyAttr ? keyAttr.toString() : null,
    props: props
  }
}