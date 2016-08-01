module.exports = function (oval) {
  return function (tag, tagName, root) {
    tag.tagName = tagName
    tag.root = root
    tag.plasma = oval.plasma.useTarget(tag.root)
    tag.root.oval_tag = tag
    tag.props = {}
    tag.childTags = []
    tag.id = Math.random()
    tag.keepParentTag = true
    tag.lifecycle = {
      constructed: true,
      mounted: false
    }
    tag.innerChildren = []
    while (tag.root.hasChildNodes()) {
      tag.innerChildren.push(tag.root.removeChild(tag.root.firstChild))
    }

    tag.updateProps = function () {
      if (this.root.customProperties) {
        for (var i = 0; i < this.root.customProperties.length; i++) {
          var prop = this.root.customProperties[i]
          this.props[prop.name] = prop.value
        }
      }
    }
    tag.updateProps()

    tag.createElement = oval.createElement()

    tag.injectDirectives = function (directives) {
      this.createElement = oval.createElement(directives)
    }

    tag.update = function () {
      this.updateProps()

      if (this.shouldRender && !this.shouldRender()) {
        return
      }

      this.view = this.render(this.createElement)
      if (!this.keepParentTag) {
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

      this.emit('updated')

      if (!this.lifecycle.mounted) {
        this.lifecycle.mounted = true
        this.emit('mounted')
      }
    }

    tag.unmount = function (skipRemove) {
      if (this.lifecycle.mounted && this.root.parentNode && !skipRemove) {
        this.root.remove()
      }
      this.lifecycle.mounted = false
      for (var i = 0; i < this.childTags.length; i++) {
        this.childTags[i].unmount(true)
      }
      this.emit('unmount')
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
