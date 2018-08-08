var IncrementalDOM = require('incremental-dom')
var isFunction = require('./utils/isFunction')

function parseAttrsObj (attrsObj) {
  var props = {}
  var attrs = {}
  var staticAttrs = []
  var keyAttr = null

  if (attrsObj) {
    var attrsObjKeys = Object.keys(attrsObj)

    for (var i = 0; i < attrsObjKeys.length; i++) {
      var key = attrsObjKeys[i]
      var val = attrsObj[key]

      if (key === 'cid') {
        keyAttr = val
        staticAttrs.push(key, val)
        attrs[key] = val
        continue
      }

      if (key.indexOf('prop-') === 0) {
        props[key.replace('prop-', '')] = val
        continue
      }

      if (key === 'ref') {
        staticAttrs.push(key, val)
        attrs[key] = val
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

module.exports = function (tag, oval, directives) {
  var createElementWithDirectives = function (tagName, props, ...children) {
    var TagClass
    var postCreateDirectives
    var originalTagName
    if (isFunction(tagName)) {
      TagClass = tagName
      tagName = tagName.tagName
    }
    if (props) {
      for (var p in directives) {
        if (typeof props[p] !== 'undefined') {
          // buffer to postCreateDirectives
          if (directives[p].postCreate) {
            postCreateDirectives = postCreateDirectives || []
            postCreateDirectives.push({d: directives[p], value: props[p]})
          }

          if (directives[p].preCreate) {
            // trigger preCreate of the directive
            var resultedChilds = directives[p].preCreate(createElementWithDirectives, tagName, props, ...children)
            if (resultedChilds) {
              children = resultedChilds
            }
          }

          if (directives[p].tagName) {
            originalTagName = tagName
            tagName = directives[p].tagName(tagName, props)
          }

          // automatically remove the directive prop if present
          delete props[p]
        }
      }
    }

    var parsedAttrs = parseAttrsObj(props)

    var appendChild = function (childs) {
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

    return function () {
      var createdElement
      if (tagName !== 'virtual' || originalTagName) {
        // console.log('element open ->', tagName, parsedAttrs.key)
        TagClass = TagClass || oval.getRegisteredTag(originalTagName || tagName)
        if (!TagClass) {
          IncrementalDOM.elementOpenStart(tagName, parsedAttrs.key, parsedAttrs.staticAttrs)
          for (var key in parsedAttrs.attrs) {
            IncrementalDOM.attr(key, parsedAttrs.attrs[key])
          }
        } else {
          IncrementalDOM.elementOpenStart(tagName, parsedAttrs.key)
        }
        createdElement = IncrementalDOM.elementOpenEnd()
        if (parsedAttrs.attrs['ref']) {
          tag.refs[parsedAttrs.attrs['ref']] = createdElement
        }
        if (parsedAttrs.attrs['freeze']) {
          IncrementalDOM.skip()
        }
        if (createdElement.tag) {
          if (!createdElement.tag.shouldRender) {
            IncrementalDOM.skip()
          } else {
            createdElement.tag.update(children, parsedAttrs.props, parsedAttrs.attrs)
          }
          IncrementalDOM.elementClose(tagName)
          tag.childTags.push(createdElement.tag)
          return
        }
        if (TagClass) {
          var instance = new TagClass(createdElement, parsedAttrs.props, parsedAttrs.attrs)
          instance.mount(children)
          IncrementalDOM.elementClose(tagName)
          tag.childTags.push(instance)
          // trigger post create directives if any
          if (postCreateDirectives) {
            for (var i = 0; i < postCreateDirectives.length; i++) {
              postCreateDirectives[i].d.postCreate(createdElement, postCreateDirectives[i].value)
            }
          }
          return
        }
      }

      var hasNotRenderedChildren = createdElement && createdElement.children.length === 0 && children.length !== 0
      if (hasNotRenderedChildren || !parsedAttrs.attrs['freeze']) {
        appendChild(children)
      }

      if (tagName !== 'virtual') {
        createdElement = IncrementalDOM.elementClose(tagName)
        // trigger post create directives if any
        if (postCreateDirectives) {
          for (var k = 0; k < postCreateDirectives.length; k++) {
            postCreateDirectives[k].d.postCreate(createdElement, postCreateDirectives[k].value)
          }
        }
      }
    }
  }

  return createElementWithDirectives
}
