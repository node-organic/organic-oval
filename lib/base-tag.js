module.exports = function (tag, tagName, root) {
  var oval = require('../index')

  tag.tagName = tagName
  tag.root = root
  tag.plasma = oval.plasma.useTarget(tag.root)
  tag.root.oval_tag = tag
  tag.childTags = []
  tag.id = Math.random()
  tag.lifecycle = {
    constructed: true,
    mounted: false
  }
  tag.shouldRender = true
  tag.innerChildren = []
  while (tag.root.hasChildNodes()) {
    tag.innerChildren.push(tag.root.removeChild(tag.root.firstChild))
  }

  tag.createElement = oval.createElement()

  tag.injectDirectives = function (directives) {
    tag.createElement = oval.createElement(directives)
  }

  tag.shouldRender = function () {
    return true
  }

  tag.update = function () {
    if (this.root.customProperties) {
      for (var i = 0; i < this.root.customProperties.length; i++) {
        var prop = this.root.customProperties[i]
        this[prop.name] = prop.value
      }
    }

    if (!this.shouldRender()) {
      return
    }

    this.view = this.render(this.createElement)

    if (!this.lifecycle.mounted) {
      this.emit('mount')
    }

    this.emit('update')

    oval.updateElement(this.root, this.view)

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

  tag.unmount = function () {
    this.lifecycle.mounted = false
    for (var i = 0; i < this.childTags.length; i++) {
      this.childTags[i].unmount()
    }
    this.emit('unmount')
  }

  tag.emit = function (eventName, eventData) {
    return this.plasma.emit({
      type: this.id + '/' + eventName,
      eventData: eventData
    })
  }

  tag.once = function (eventName, handler) {
    return this.plasma.once({
      type: this.id + '/' + eventName
    }, handler)
  }

  tag.on = function (eventName, handler) {
    return this.plasma.on({
      type: this.id + '/' + eventName
    }, handler)
  }

  tag.off = function (eventName, handler) {
    this.plasma.off({
      type: this.id + '/' + eventName
    }, handler)
  }
}
