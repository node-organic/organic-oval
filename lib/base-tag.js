var autoId = 0
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
    tag.lifecycle = {
      constructed: true,
      mounted: false
    }
    tag.innerChildren = []
    while (tag.root.hasChildNodes()) {
      tag.innerChildren.push(tag.root.removeChild(tag.root.firstChild))
    }

    tag.updateAttributes = function () {
      this.attributes = {}
      for (var i = 0; i < this.root.attributes.length; i++) {
        var attr = this.root.attributes[i]
        var name = attr.name
        if (name.indexOf('prop-') === 0 || name.indexOf('on') === 0) continue
        this.attributes[name] = attr.value
      }
    }

    tag.updateProps = function () {
      this.props = {}
      if (this.root.customProperties) {
        for (var i = 0; i < this.root.customProperties.length; i++) {
          var prop = this.root.customProperties[i]
          this.props[prop.name] = prop.value
        }
      }
    }

    tag.updateRefs = function () {
      this.refs = {}
      var refEls = this.root.querySelectorAll('[ref]')
      for (var i = 0; i < refEls.length; i++) {
        var el = refEls[i]
        this.refs[el.attributes.ref.value] = el
      }
    }

    if (!props) {
      tag.updateProps()
    }
    tag.updateAttributes()

    tag.createElement = oval.createElement()

    tag.injectDirectives = function (directives) {
      tag.directives = directives
      var argumentedDirectives = directives.map((d) => d(tag))
      this.createElement = oval.createElement(argumentedDirectives)
    }

    tag.update = function () {
      if (!this.shouldRender) {
        return
      }

      this.view = this.render(this.createElement)
      if (!this.keepTagName) {
        this.view = this.view.firstChild
      }

      if (!this.lifecycle.mounted) {
        this.emit('mount')
      }

      this.emit('update')
      this.root = oval.updateElement(this.root, this.view)

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
  }
}
