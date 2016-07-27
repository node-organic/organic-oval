module.exports = {
  updateElement: require('./lib/update-element'),
  createElement: require('./lib/create-element'),
  registeredTags: [],
  init: function (plasma) {
    this.plasma = require('./lib/organic-plasma-dom')(plasma)
    this.BaseTag = require('./lib/base-tag')(this)
  },
  getRegisteredTag: function (name) {
    for (var i = 0; i < this.registeredTags.length; i++) {
      if (this.registeredTags[i].tagName === name.toLowerCase()) {
        return this.registeredTags[i].Tag
      }
    }
  },
  mountAll: function (selector, root) {
    if (!selector || !root) throw new Error(arguments + ' supplied should have selector and root')
    var elements
    if (selector === '*') {
      elements = []
      for (var i = 0; i < this.registeredTags.length; i++) {
        var els = root.querySelectorAll(this.registeredTags[i].tagName)
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
      var Tag = this.getRegisteredTag(name)
      var instance = new Tag(name, elements[i])
      instance.update()
      tags.push(instance)
    }
    return tags
  },
  appendAt: function (el, tagName) {
    if (!el || !tagName) throw new Error(arguments + ' supplied should have el and tagName')
    var Tag = this.getRegisteredTag(tagName)
    var instance = new Tag(tagName, document.createElement(tagName))
    instance.update()
    el.appendChild(instance.root)
    return instance
  },
  register: function (tagName, TagClass) {
    if (this.getRegisteredTag(tagName)) throw new Error(tagName + ' already registered')
    if (document.registerElement) {
      document.registerElement(tagName.toUpperCase())
    }
    this.registeredTags.push({
      tagName: tagName,
      Tag: TagClass
    })
  }
}
