var oval = module.exports = {
  updateElement: require('./lib/update-element'),
  createElement: require('./lib/create-element'),
  registeredTags: [],
  plasma: null,
  getRegisteredTag: function (name) {
    for (var i = 0; i < oval.registeredTags.length; i++) {
      if (oval.registeredTags[i].tagName === name.toLowerCase()) {
        return oval.registeredTags[i].Tag
      }
    }
  },
  mountAll: function (selector, root) {
    if (!selector || !root) throw new Error(arguments + ' supplied should have selector and root')
    var elements
    if (selector === '*') {
      elements = []
      for (var i = 0; i < oval.registeredTags.length; i++) {
        var els = root.querySelectorAll(oval.registeredTags[i].tagName)
        if (els.length) {
          for (var k = 0; k < els.length; k++) {
            elements.push(els[k])
          }
        }
      }
    } else {
      elements = root.querySelectorAll(selector)
    }
    var tags = []
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].oval_tag) {
        elements[i].oval_tag.update()
        tags.push(elements[i].oval_tag)
        continue
      }
      var name = elements[i].tagName
      var Tag = oval.getRegisteredTag(name)
      var instance = new Tag(name, elements[i])
      instance.update()
      tags.push(instance)
    }
    return tags
  },
  appendAt: function (el, tagName) {
    if (!el || !tagName) throw new Error(arguments + ' supplied should have el and tagName')
    var Tag = oval.getRegisteredTag(tagName)
    var instance = new Tag(tagName, document.createElement(tagName))
    instance.update()
    el.appendChild(instance.root)
    return instance
  },
  register: function (tagName, TagClass) {
    if (oval.getRegisteredTag(tagName)) throw new Error(tagName + ' already registered')
    if (document.registerElement) {
      document.registerElement(tagName.toUpperCase())
    }
    oval.registeredTags.push({
      tagName: tagName,
      Tag: TagClass
    })
  }
}

oval.BaseTag = require('./lib/base-tag')
