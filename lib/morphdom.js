const morphdom = require('morphdom')
const hyperx = require('hyperx')
const components = {}

let oid = 0

let currentParent
let currentNode
let currentComponent

const patch = function (el, content) {
  if (typeof content === 'string') {
    el.innerHTML = content
  } else {
    currentComponent = el
    currentParent = document.createDocumentFragment()
    currentNode = el
    content()
    morphdom(el, currentParent, {
      childrenOnly: true,
      getNodeKey: function (node) {
        if (node.id) return node.id
        if (node.attributes && node.attributes.key) {
          return node.attributes.key.value
        }
      },
      onBeforeElUpdated: function (from, to) {
        if (from.mounted) {
          from.shouldUpdate(to.state)
          return false
        }
        if (from.attributes.freeze) {
          return false
        }
      },
      onBeforeElChildrenUpdated: function (from, to) {
        if (from.mounted) {
          from.shouldUpdate(to.state)
          return false
        }
        if (from.attributes.freeze) {
          return false
        }
      }
    })
  }
}

const setProps = function (el, props) {
  for (let key in props) {
    if (typeof props[key] === 'string' || typeof props[key] === 'number') {
      if (key === 'className') {
        el.setAttribute('class', props[key])
      } else {
        el.setAttribute(key, props[key])
      }
    }
    if (typeof props[key] === 'object') {
      if (el.state) {
        el.state[key] = props[key]
      } else {
        el[key] = props[key]
      }
    }
    if (typeof props[key] === 'function') {
      el.addEventListener(key, props[key])
    }
  }
}

const open = function (tagName, props) {
  let newEl = document.createElement(tagName)
  if (components[tagName]) {
    newEl.parentComponent = currentComponent
  }
  setProps(newEl, props)
  currentParent.appendChild(newEl)
  currentParent = newEl
  currentNode = newEl
  return newEl
}

const text = function (value) {
  currentNode.appendChild(document.createTextNode(value))
}

const close = function () {
  currentParent = currentNode.parentNode
  currentNode = currentParent
}

module.exports.defineComponent = function (tagName, Class) {
  components[tagName.toLowerCase()] = Class
  customElements.define(tagName, Class)
}
module.exports.render = function (component) {
  let contentBuilderFn = this.template()
  patch(component, contentBuilderFn)
}
module.exports.html = function (component) {
  return hyperx((tagName, props, kids) => {
    return function () {
      kids = cleanUpKids(kids)
      if (tagName === 'virtual') return appendChilds(kids)
      let el = open(tagName, props)
      if (components[tagName]) {
        el.kids = kids
      } else {
        appendChilds(kids)
      }
      close()
    }
  })
}

const appendChilds = function (kids) {
  if (!kids) return
  for (var i = 0; i < kids.length; i++) {
    var node = kids[i]
    if (node === null) continue
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'string' ||
      node instanceof Date ||
      node instanceof RegExp) {
      text(node)
      continue
    }
    if ((typeof node === 'undefined' || node === null)) {
      text('')
      continue
    }
    if (Array.isArray(node)) {
      appendChilds(node)
      continue
    }
    if (typeof node === 'function') {
      node()
    } else {
      console.warn('found unknown node', node)
    }
  }
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