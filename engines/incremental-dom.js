const IncrementalDOM = require('incremental-dom')
const hyperx = require('hyperx')

const components = {}
let INCREMENTAL_RENDERING = false
let OID = 0

IncrementalDOM.notifications.nodesDeleted = function (node) {
  if (!node.tagName) return
  let tagName = node.tagName.toUpperCase()
  if (components[tagName]) {
    node.disconnectedCallback()
  }
}

module.exports.upgrade = function (el) {
  if (!components[el.tagName.toUpperCase()]) throw new Error('oval component ' + el.tagName.toUpperCase() + ' not found')
  components[el.tagName.toUpperCase()](el)
  el.connectedCallback()
}

module.exports.define = function (options) {
  if (!options.tagName) throw new Error('options.tagName required')
  options.tagName = options.tagName.toUpperCase()
  if (components[options.tagName]) throw new Error('oval component "' + options.tagName + '" already defined')
  components[options.tagName] = function (el) {
    if (el.oid) throw new Error('element ' + el.tagName + ' already adopted with oid ' + el.oid)
    require('../lib/custom-element')(el)
    Object.assign(el, {
      oid: OID++,
      html: module.exports.html(el),
      render: module.exports.render(el),
      kids: {}, // populated during rendering
      template: function () {
        return options.template.call(this)
      }
    })
    if (options.script) {
      options.script.call(el)
    }
  }

  let existingElements = document.body.querySelectorAll(options.tagName)
  existingElements.forEach(module.exports.upgrade)

  return components[options.tagName]
}

module.exports.render = function (component) {
  return function () {
    let templateBuilderFn = component.template()
    if (!templateBuilderFn) return
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
      tagName = tagName.toUpperCase()
      kids = cleanUpKids(kids)
      var parsedAttrs = parseAttrsObj(props)
      if (tagName === 'VIRTUAL') return appendChilds(kids)
      if (tagName === 'SLOT' && component.kids[props.name]) {
        let slot = component.kids[props.name]
        tagName = slot.tagName
        props = slot.props
        kids = slot.kids
      }
      if (props.slot) {
        let cleanprops = {...props}
        delete cleanprops.slot
        IncrementalDOM.currentComponent.kids[props.slot] = {
          props: cleanprops,
          kids: kids,
          tagName: tagName
        }
        return
      }
      IncrementalDOM.elementOpenStart(tagName.toLowerCase(), parsedAttrs.oid)
      for (let key in parsedAttrs.attrs) {
        IncrementalDOM.attr(key, parsedAttrs.attrs[key])
      }
      if (!components[tagName]) {
        for (let key in parsedAttrs.props) {
          IncrementalDOM.attr(key, parsedAttrs.props[key])
        }
        for (let key in parsedAttrs.handlers) {
          IncrementalDOM.attr('on' + key, parsedAttrs.handlers[key])
        }
      }
      let createdElement = IncrementalDOM.elementOpenEnd()
      if (parsedAttrs.attrs['freeze']) {
        IncrementalDOM.skip()
        IncrementalDOM.elementClose(tagName.toLowerCase())
        return
      }
      if (createdElement.shouldRender === false) {
        IncrementalDOM.skip()
        IncrementalDOM.elementClose(tagName.toLowerCase())
        return
      }
      if (components[tagName]) {
        IncrementalDOM.currentComponent = createdElement
        if (!createdElement.mounted) {
          components[tagName](createdElement)
          Object.assign(createdElement.state, parsedAttrs.props)
          for (let name in parsedAttrs.handlers) {
            createdElement.on(name, parsedAttrs.handlers[name])
          }
          appendChilds(kids)
          createdElement.connectedCallback()
        } else {
          appendChilds(kids)
          createdElement.shouldUpdate(parsedAttrs.props)
        }
      } else {
        let hasNotRenderedChildren = kids && createdElement && createdElement.children.length === 0 && kids.length !== 0
        if (hasNotRenderedChildren || !parsedAttrs.attrs['freeze']) {
          appendChilds(kids)
        }
      }
      IncrementalDOM.elementClose(tagName.toLowerCase())
      IncrementalDOM.currentComponent = null
    }
  })
}

const appendChilds = function (childs) {
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
      console.warn('found unknown node', node)
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
