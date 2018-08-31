var isFunction = require('./lib/utils/isFunction')
var ovalInstance = {
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
  mountAll: function (root) {
    var pairs = []
    var k
    var i
    var pair
    // buffer all elements from root
    for (k = 0; k < this.registeredTags.length; k++) {
      pair = this.registeredTags[k]
      var elements = root.querySelectorAll(pair.tagName)
      for (i = 0; i < elements.length; i++) {
        pairs.push({el: elements[i], Tag: pair.Tag})
      }
    }
    // initialize
    var tags = []
    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i]
      var TagClass = pair.Tag
      var instance = new TagClass(pair.el)
      instance.mount()
      tags.push(instance)
    }
    return tags
  },
  mountAt: function (el, tagName, props, attrs) {
    var TagClass
    if (isFunction(tagName)) {
      TagClass = tagName
      tagName = TagClass.tagName
    } else {
      TagClass = this.getRegisteredTag(tagName)
    }
    if (!TagClass) throw new Error(tagName + ' not registered')
    var instance = new TagClass(el, props, attrs)
    instance.mount()
    return instance
  },
  appendAt: function (el, tagName, props, attrs) {
    var TagClass
    if (isFunction(tagName)) {
      TagClass = tagName
      tagName = TagClass.tagName
    } else {
      TagClass = this.getRegisteredTag(tagName)
    }
    if (!TagClass) throw new Error(tagName + ' not registered')
    var newEl = document.createElement(tagName)
    el.appendChild(newEl)
    var instance = new TagClass(newEl, props, attrs)
    instance.mount()
    return instance
  },
  registerTag: function (tagName, TagClass) {
    if (this.getRegisteredTag(tagName))  {
      if (!window.ovalRegisterMultiple) throw new Error(tagName + ' already registered')
      else return this.getRegisteredTag(tagName)
    }
    this.registeredTags.push({
      tagName: tagName.toLowerCase(),
      Tag: TagClass
    })
    return TagClass
  }
}

if (window.ovalInstance && window.globalOval) {
  ovalInstance = window.ovalInstance
} else {
  ovalInstance.init()
  window.ovalInstance = ovalInstance
}
module.exports = ovalInstance
