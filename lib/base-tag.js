var autoId = 0
var tagEvents = ['render', 'update', 'mount', 'updated', 'mounted', 'unmount', 'unmounted']

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
    tag.events = {}
    tag.id = autoId++
    tag.keepTagName = true
    tag.shouldRender = true
    tag.directives = {}
    tag.lifecycle = {
      constructed: true,
      mounted: false
    }

    tag.updateInnerChildren = function (sourceEl) {
      sourceEl = sourceEl || this.root
      this.innerChildren = []
      while (sourceEl.hasChildNodes()) {
        this.innerChildren.push(sourceEl.removeChild(sourceEl.firstChild))
      }
    }

    tag.updateAttributes = function (sourceEl) {
      sourceEl = sourceEl || this.root
      this.attributes = {}
      for (var i = 0; i < sourceEl.attributes.length; i++) {
        var attr = sourceEl.attributes[i]
        var name = attr.name
        if (name.indexOf('prop-') === 0 || name.indexOf('on') === 0) continue
        this.attributes[name] = attr.value
      }
    }

    tag.updateProps = function (sourceEl) {
      sourceEl = sourceEl || this.root
      this.props = {}
      if (sourceEl.customProperties) {
        for (var i = 0; i < sourceEl.customProperties.length; i++) {
          var prop = sourceEl.customProperties[i]
          this.props[prop.name] = prop.value
        }
      }
    }

    tag.updateRefs = function (sourceEl) {
      sourceEl = sourceEl || this.root
      this.refs = {}
      var refEls = sourceEl.querySelectorAll('[ref]')
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

    tag.morph = function (sourceEl) {
      if (!this.shouldRender) {
        return
      }
      var oldProps = this.props
      var oldAttributes = this.attributes
      var oldInnerChildren = this.innerChildren

      this.updateProps(sourceEl)
      this.updateAttributes(sourceEl)
      this.updateInnerChildren(sourceEl)

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

      if (!this.lifecycle.mounted) {
        this.emit('mount')
      }

      this.emit('render')
      this.view = this.render(this.createElement)
      if (!this.keepTagName) {
        this.view = this.view.firstChild
      }

      this.emit('update')
      this.root = oval.updateElement(this.root, this.view, this.morphOptions)
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
      if (!this.events[eventName]) return
      return this.plasma.emit({
        type: eventName,
        eventData: eventData,
        bubbles: bubbles
      })
    }

    tag.once = function (eventName, handler) {
      if (tagEvents.indexOf(eventName) !== -1) {
        if (!this.events[eventName]) this.events[eventName] = 0
        this.events[eventName] += 1
      }
      return this.plasma.once({
        type: eventName
      }, (e) => {
        this.events[eventName] -= 1
        if (this.events[eventName] === 0) {
          delete this.events[eventName]
        }
        handler(e)
      })
    }

    tag.on = function (eventName, handler) {
      if (tagEvents.indexOf(eventName) !== -1) {
        if (!this.events[eventName]) this.events[eventName] = 0
        this.events[eventName] += 1
      }
      return this.plasma.on({
        type: eventName
      }, handler)
    }

    tag.off = function (eventName, handler) {
      if (this.events[eventName]) {
        this.events[eventName] -= 1
        if (this.events[eventName] === 0) {
          delete this.events[eventName]
        }
      }
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

    tag.createElement = oval.createElement()
  }
}
