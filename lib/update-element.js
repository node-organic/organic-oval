var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./dom-events.js') // default events to be copied when dom elements update

module.exports = function updateElement (node, nodeTemplate, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    if (!opts.onBeforeElUpdated) opts.onBeforeElUpdated = copier
  }

  return morphdom(node, nodeTemplate, opts)

  // morphdom only copies attributes. we decided we also wanted to copy events
  // that can be set via attributes
  function copier (f, t) {
    if (f.oval_tag && f !== node) {
      // do not update element when its a child tag instance
      f.oval_tag.morph(t)
      return false
    }

    // copy events:
    var events = opts.events || defaultEvents
    for (var i = 0; i < events.length; i++) {
      var ev = events[i]
      if (t[ev]) { // if new element has a whitelisted attribute
        f[ev] = t[ev] // update existing element
      } else if (f[ev]) { // if existing element has it and new one doesnt
        f[ev] = undefined // remove it from existing element
      }
    }

    // copy values for form elements
    if (f.nodeName === 'INPUT' || f.nodeName === 'TEXTAREA' || f.nodeName === 'SELECT') {
      if (t.getAttribute('value') === null) t.value = f.value
    }

    // copy custom properties
    if (t.customProperties) {
      f.customProperties = t.customProperties
    }
  }
}
