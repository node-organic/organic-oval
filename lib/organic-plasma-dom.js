var hasCustomEventsSupport = typeof CustomEvent !== 'undefined'

module.exports = function (plasma) {
  var domPlasma = {}
  for (var key in plasma) {
    domPlasma[key] = plasma[key]
  }
  domPlasma.target = window.document

  domPlasma.on = function (pattern, handler) {
    this.target.addEventListener(pattern.type, handler)
  }

  domPlasma.once = function (pattern, handler) {
    this.target.addEventListener(pattern.type, (e) => {
      this.target.removeEventListener(pattern.type, handler)
      handler(e)
    })
  }

  domPlasma.emit = function (input) {
    var event
    if (!hasCustomEventsSupport) { // because of IE
      event = document.createEvent('Event')
      event.initEvent(input.type, input.bubbles, input.cancelable)
      for (var key in input.eventData) {
        event[key] = input.eventData[key]
      }
    } else {
      event = new CustomEvent(input.type, {
        detail: input.eventData,
        bubbles: input.bubbles,
        cancelable: input.cancelable
      })
    }
    this.target.dispatchEvent(event)
  }

  domPlasma.off = function (pattern, handler) {
    this.target.removeEventListener(pattern.type, handler)
  }

  domPlasma.useTarget = function (el) {
    var targetDomPlasma = {}
    for (var key in domPlasma) {
      targetDomPlasma[key] = domPlasma[key]
    }
    targetDomPlasma.target = el
    return targetDomPlasma
  }

  return domPlasma
}
