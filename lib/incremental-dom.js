const IncrementalDOM = require('incremental-dom')
const hyperx = require('hyperx')

const components = {}
let INCREMENTAL_RENDERING = false

IncrementalDOM.notifications.nodesDeleted = function (node) {
  if (!node.tagName) return
  let tagName = node.tagName.toLowerCase()
  if (components[tagName]) {
    node.disconnectedCallback()
  }
}

module.exports.define = function (options) {
  if (components[options.tagName]) throw new Error('oval component "' + options.tagName + '" already defined')
  components[options.tagName] = function (el) {
    Object.assign(el, {
      mounted: false,
      html: module.exports.html(el),
      render: module.exports.render(el),
      state: {}, // populated during rendering
      parentComponent: null, // populated during rendering
      template: function () {
        return options.template.call(this, this.html)
      },
      update: function () {
        this.emit('update')
        this.render()
        this.emit('updated')
      },
      shouldUpdate: function (newState) {
        Object.assign(this.state, newState)
        this.update()
      },
      connectedCallback: function () {
        this.emit('mount')
        this.update()
        this.mounted = true
        this.emit('mounted')
      },
      attributeChangedCallback: function () {
        this.update()
      },
      propertyChangedCallback: function () {
        this.update()
      },
      adoptedCallback: function () {
        // TODO?
      },
      disconnectedCallback: function () {
        this.emit('unmount')
        // TODO? 
        this.emit('unmounted')
      },
      on: function (eventName, eventHandler) {
        this.addEventListener(eventName, eventHandler)
      },
      off: function (eventName, eventHandler) {
        this.removeEventListener(eventName, eventHandler)
      },
      emit: function (eventName, eventData) {
        let e = new CustomEvent(eventName, {
          detail: eventData,
          bubbles: false
        })
        this.dispatchEvent(e)
      }
    })
    options.script.bind(el)()
  }

  let existingElements = document.body.querySelectorAll(options.tagName)
  existingElements.forEach( (el) => {
    components[options.tagName](el)
    el.connectedCallback()
  })
}

module.exports.render = function (component) {
  return function () {
    let templateBuilderFn = component.template()
    if (INCREMENTAL_RENDERING) {
      templateBuilderFn()
    } else {
      INCREMENTAL_RENDERING = true
      IncrementalDOM.patch(component, templateBuilderFn)
      INCREMENTAL_RENDERING = false
    }
  }
}

module.exports.html = function (component) {
  return hyperx((tagName, props, kids) => {
    return function () {
      var parsedAttrs = parseAttrsObj(props)
      if (tagName === 'virtual') return appendChilds(kids)
      IncrementalDOM.elementOpenStart(tagName, parsedAttrs.key)
      for (var key in parsedAttrs.attrs) {
        IncrementalDOM.attr(key, parsedAttrs.attrs[key])
      }
      let createdElement = IncrementalDOM.elementOpenEnd()
      if (components[tagName]) {
        createdElement.kids = cleanUpKids(kids)
        if (!createdElement.mounted) {
          createdElement.parentComponent = component
          components[tagName](createdElement)
          Object.assign(createdElement.state, parsedAttrs.props)
          for (let name in parsedAttrs.handlers) {
            createdElement.on(name, parsedAttrs.handlers[name])
          }
          createdElement.connectedCallback()
        } else {
          createdElement.shouldUpdate(parsedAttrs.props)
        }
      } else {
        appendChilds(kids)
      }
      IncrementalDOM.elementClose(tagName)
    }
  })
}

const appendChilds = function (childs, parent) {
  if (!childs) return
  for (var i = 0; i < childs.length; i++) {
    var node = childs[i]
    if (typeof node === 'undefined' || node === null) continue
    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'string' ||
      node instanceof Date ||
      node instanceof RegExp) {
      IncrementalDOM.text(node)
      continue
    }
    if (Array.isArray(node)) {
      appendChilds(node)
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
  let props = {}
  let attrs = {}
  let handlers = {}

  if (attrsObj) {
    var attrsObjKeys = Object.keys(attrsObj)

    for (var i = 0; i < attrsObjKeys.length; i++) {
      var key = attrsObjKeys[i]
      var val = attrsObj[key]
      
      if (key === 'className') {
        key = 'class'
      }
      
      if (typeof val === 'object') {
        props[key] = val
        continue
      }
      if (typeof val === 'function') {
        handlers[key] = val
        continue
      }
      attrs[key] = val
    }
  }

  return {
    attrs: attrs,
    props: props,
    handlers: handlers
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