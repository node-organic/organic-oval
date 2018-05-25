var autoId = 0
var patch = require('incremental-dom').patch

module.exports = function (oval) {
  return class BaseTag {
    constructor (rootEl, props, attrs) {
      // console.log('===== constructed =>', tag, rootEl)
      rootEl.tag = this
      this.root = rootEl
      this.props = props || {}
      this.attributes = attrs || {}
      this.mounted = false
      this.updated = false
      this.plasma = oval.plasma.useTarget(this.root)
      this.refs = {}
      this.events = {}
      this.id = autoId++
      this.shouldRender = true
      this.directives = {}
      this.innerChildren = []
      this.childTags = []
      this.createElement = require('./incremental-create-element')(this, oval, {})
    }

    setDirectives (directivesMap) {
      var argumentedDirectives = {}
      for (var key in directivesMap) {
        if (this.directives[key]) throw new Error(key + ' directive already injected')
        this.directives[key] = directivesMap[key]
        argumentedDirectives[key] = directivesMap[key](this, key)
      }
      this.createElement = require('./incremental-create-element')(this, oval, argumentedDirectives)
    }

    mount (innerChildren) {
      this.root.setAttribute('cid', this.id)
      this.emit('mount')
      this.emit('update')
      this.childTags = []
      if (innerChildren) {
        this.innerChildren = innerChildren
        this.render(this.createElement)()
      } else {
        patch(this.root, this.render(this.createElement))
      }
      this.emit('updated')
      this.mounted = true
      this.emit('mounted')
    }

    update (innerChildren, props, attrs) {
      if (!this.shouldRender) {
        return
      }
      this.props = props || this.props
      this.attributes = attrs || this.attributes
      this.emit('update')
      this.childTags = []
      if (innerChildren) {
        this.innerChildren = innerChildren
        this.render(this.createElement)()
      } else {
        patch(this.root, this.render(this.createElement))
      }
      this.emit('updated')
      this.updated = true
    }

    unmount (skipRootRemove) {
      this.emit('unmount')
      for (var i = 0; i < this.childTags.length; i++) {
        this.childTags[i].unmount(true)
      }
      if (!skipRootRemove) {
        this.remove()
      }
      this.mounted = false
      this.emit('unmounted')
    }

    remove (el) {
      el = el || this.root
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }

    emit (eventName, eventData, bubbles) {
      return this.plasma.emit({
        type: eventName,
        eventData: eventData,
        bubbles: bubbles
      })
    }

    once (eventName, handler) {
      return this.plasma.once({
        type: eventName
      }, handler)
    }

    on (eventName, handler) {
      this.plasma.on({
        type: eventName
      }, handler)
    }

    off (eventName, handler) {
      this.plasma.off({
        type: eventName
      }, handler)
    }
  }
}
