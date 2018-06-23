const hyperx = require('hyperx')
const components = {}

module.exports.defineComponent = function (tagName, Class) {
  components[tagName.toLowerCase()] = Class
  customElements.define(tagName, Class)
}
module.exports.render = function (component) {
  let contentBuilderFn = this.template()
  contentBuilderFn()
}
module.exports.html = function (component) {
  let state = {
    currentComponent: component,
    currentParent: component.shadowRoot || component
  }
  console.log('html', component.shadowRoot)
  return hyperx((tagName, props, kids) => {
    return function () {
      kids = cleanUpKids(kids)
      if (tagName === 'virtual') return appendChilds(kids, state)
      open(tagName, props, kids, state)
      appendChilds(kids, state)
      close(state)
    }
  })
}

const setState = function (el, props) {
  for (let key in props) {
    if (typeof props[key] === 'object') {
      el.state[key] = props[key]
    }
  }
}

const setAttributes = function (el, props) {
  for (let key in props) {
    if (typeof props[key] === 'string' || typeof props[key] === 'number') {
      if (key === 'className') {
        el.setAttribute('class', props[key])
      } else {
        el.setAttribute(key, props[key])
      }
    }
  }
}

const setEventListeners = function (el, props) {
  for (let key in props) {
    if (typeof props[key] === 'function') {
      el.addEventListener(key, props[key])
    }
  }
}

const getKey = function (value) {
  if (value.id) return value.id
  if (value.key) return value.key
  if (value.attributes && value.attributes.key) return value.attributes.key.value
}

const createOrReference = function (tagName, props, kids, state) {
  let action = 'create'
  switch (action) {
    case 'create': 
      let newEl = document.createElement(tagName) 
      if (components[tagName]) {
        newEl.parentComponent = state.currentComponent
      }
      setState(newEl, props)
      setAttributes(newEl, props)
      setEventListeners(newEl, props)
      state.currentParent.appendChild(newEl)
      return newEl
      break
  }
}

const open = function (tagName, props, kids, state) {
  let el = createOrReference(tagName, props, kids, state)
  state.isOpen = true
  state.isClosed = false
  state.currentParent = el
  return el
}

const text = function (value, state) {
  return state.currentParent.appendChild(document.createTextNode(value))
}

const appendChilds = function (kids, state) {
  if (!kids) return
  for (var i = 0; i < kids.length; i++) {
    var node = kids[i]
    if (node === null) continue
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'string' ||
      node instanceof Date ||
      node instanceof RegExp) {
      text(node, state)
      continue
    }
    if ((typeof node === 'undefined' || node === null)) {
      text('', state)
      continue
    }
    if (Array.isArray(node)) {
      appendChilds(node, state)
      continue
    }
    if (typeof node === 'function') {
      node()
    } else {
      console.warn('found unknown node', node)
    }
  }
}

const close = function (state) {
  state.currentParent = state.currentParent.parentNode
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