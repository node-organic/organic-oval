var autoId = 0
var tagEvents = ['render', 'update', 'mount', 'updated', 'mounted', 'unmount', 'unmounted']
var patch = require('incremental-dom').patch

module.exports = function (oval) {
  return function (tag, rootEl, props, attrs) {
    // // console.log('===== constructed =>', tag, rootEl)
    rootEl.tag = tag
    tag.root = rootEl
    tag.props = props || {}
    tag.attributes = attrs || {}
    tag.mounted = false
    tag.rendered = false
    tag.plasma = oval.plasma.useTarget(tag.root)
    tag.refs = {}
    tag.events = {}
    tag.id = autoId++
    tag.shouldRender = true
    tag.directives = {}
    tag.innerChildren = []
    tag.childTags = []

    tag.injectDirectives = function (directivesMap) {
      var argumentedDirectives = {}
      for (var key in directivesMap) {
        if (tag.directives[key]) throw new Error(key + ' directive already injected')
        tag.directives[key] = directivesMap[key]
        argumentedDirectives[key] = directivesMap[key](tag, key)
      }
      tag.createElement = require('./incremental-create-element')(tag, oval, argumentedDirectives)
    }
    tag.injectDirectives({})

    tag.mount = function (incrementalRender) {
      this.root.setAttribute('cid', this.id)
      this.emit('mount')
      this.emit('update')
      this.childTags = []
      if (incrementalRender) {
        this.innerChildren = incrementalRender
        this.render(this.createElement)()
      } else {
        patch(this.root, this.render(this.createElement))
      }
      this.emit('updated')
      this.mounted = true
      this.emit('mounted')
    }

    tag.update = function (incrementalRender, props, attrs) {
      if (!this.shouldRender) {
        return
      }
      this.props = props || this.props
      this.attrs = attrs || this.attrs
      this.emit('update')
      this.childTags = []
      if (incrementalRender) {
        this.innerChildren = incrementalRender
        this.render(this.createElement)()
      } else {
        patch(this.root, this.render(this.createElement))
      }
      /* for (var key in this.attributes) {
        this.root.setAttribute(key, this.attributes[key])
      } */
      this.emit('updated')
      this.rendered = true
    }

    tag.unmount = function (skipRootRemove) {
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

    tag.remove = function (el) {
      el = el || this.root
      el.parentNode.removeChild(el)
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
  }
}
