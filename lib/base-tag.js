var autoId = 0

var equalObjs = function (oldObj, newObj) {
  if (Object.keys(oldObj).length !== Object.keys(newObj).length) {
    return false
  }

  for (var prop in oldObj) {
    if (!newObj[prop]) {
      return false
    }
    if (newObj[prop] !== oldObj[prop]) {
      return false
    }
  }

  return true
}

var equalArrays = function (oldArray, newArray) {
  if (oldArray.length !== newArray.length) {
    return false
  }
  for (var i = 0; i < oldArray.length; i++) {
    if (oldArray[i] !== newArray[i]) {
      return false
    }
  }
  return true
}

module.exports = function (oval) {
  return function (tag, tagName, rootEl, props) {
    tag.tagName = tagName
    tag.root = rootEl
    tag.plasma = oval.plasma.useTarget(tag.root)
    tag.root.oval_tag = tag
    tag.props = props || {}
    tag.attributes = {}
    tag.childTags = []
    tag.refs = {}
    tag.id = autoId++
    tag.keepTagName = true
    tag.shouldRender = true
    tag.directives = {}
    tag.lifecycle = {
      constructed: true,
      mounted: false
    }

    tag.updateInnerChildren = function (source) {
      source = source || this.root
      this.innerChildren = []
      while (source.hasChildNodes()) {
        this.innerChildren.push(source.removeChild(source.firstChild))
      }
    }

    tag.updateAttributes = function (source) {
      source = source || this.root
      this.attributes = {}
      for (var i = 0; i < source.attributes.length; i++) {
        var attr = source.attributes[i]
        var name = attr.name
        if (name.indexOf('prop-') === 0 || name.indexOf('on') === 0) continue
        this.attributes[name] = attr.value
      }
    }

    tag.updateProps = function (source) {
      source = source || this.root
      this.props = {}
      if (source.customProperties) {
        for (var i = 0; i < source.customProperties.length; i++) {
          var prop = source.customProperties[i]
          this.props[prop.name] = prop.value
        }
      }
    }

    tag.updateRefs = function (source) {
      source = source || this.root
      this.refs = {}
      var refEls = source.querySelectorAll('[ref]')
      for (var i = 0; i < refEls.length; i++) {
        var el = refEls[i]
        this.refs[el.attributes.ref.value] = el
      }
    }

    tag.injectDirectives = function (directivesMap) {
      var argumentedDirectives = {}
      for (var key in directivesMap) {
        if (tag.directives[key]) throw new Error(key + ' directive already injected')
        tag.directives[key] = directivesMap[key]
        argumentedDirectives[key] = directivesMap[key](tag, key)
      }
      this.createElement = oval.createElement(argumentedDirectives)
    }

    tag.morph = function (source) {
      if (!this.shouldRender) {
        return
      }
      var oldProps = this.props
      var oldAttributes = this.attributes
      var oldInnerChildren = this.innerChildren

      this.updateProps(source)
      this.updateAttributes(source)
      this.updateInnerChildren(source)

      var needsUpdate = false
      if (!equalObjs(oldProps, this.props)) {
        needsUpdate = true
      }
      if (!equalObjs(oldAttributes, this.attributes)) {
        needsUpdate = true
      }
      if (!equalArrays(oldInnerChildren, this.innerChildren)) {
        needsUpdate = true
      }
      if (needsUpdate) {
        this.update()
      }
    }

    tag.update = function () {
      if (!this.shouldRender) {
        return
      }

      this.emit('render')
      this.view = this.render(this.createElement)
      if (!this.keepTagName) {
        this.view = this.view.firstChild
      }

      if (!this.lifecycle.mounted) {
        this.emit('mount')
      }

      this.emit('update')
      this.root = oval.updateElement(this.root, this.view)
      this.root.oval_tag = this

      var newTags = oval.mountAll('*', this.root)
      for (var i = 0; i < this.childTags.length; i++) {
        var found = false
        for (var k = 0; k < newTags.length; k++) {
          if (this.childTags[i] === newTags[k]) {
            found = true
          }
        }
        if (!found) {
          this.childTags[i].unmount()
        }
      }
      this.childTags = newTags
      this.updateRefs()

      this.emit('updated')

      if (!this.lifecycle.mounted) {
        this.lifecycle.mounted = true
        this.emit('mounted')
      }
    }

    tag.unmount = function (skipRemove) {
      this.emit('unmount')
      if (this.lifecycle.mounted && this.root.parentNode && !skipRemove) {
        this.root.remove()
      }
      this.lifecycle.mounted = false
      for (var i = 0; i < this.childTags.length; i++) {
        this.childTags[i].unmount(true)
      }
      this.emit('unmounted')
    }

    tag.emit = function (eventName, eventData, bubbles) {
      return this.plasma.emit({
        type: eventName,
        eventData: eventData,
        bubbles: bubbles
      })
    }

    tag.once = function (eventName, handler) {
      return this.plasma.once({
        type: eventName
      }, handler)
    }

    tag.on = function (eventName, handler) {
      return this.plasma.on({
        type: eventName
      }, handler)
    }

    tag.off = function (eventName, handler) {
      this.plasma.off({
        type: eventName
      }, handler)
    }

    // initialize props, innerChildren, attributes
    if (!props) {
      tag.updateProps()
    }
    tag.updateInnerChildren()
    tag.updateAttributes()
    tag.updateInnerChildren()

    tag.createElement = oval.createElement()
  }
}
