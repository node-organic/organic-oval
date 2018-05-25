var hasCustomEventsSupport = typeof CustomEvent !== 'undefined'

/**
* Emit & Listen to chemicals through proxied via dom & plasma at the same time
*/
module.exports = function (plasma) {
  var domPlasma = {}
  for (var key in plasma) {
    domPlasma[key] = plasma[key]
  }
  domPlasma.target = window.document

  domPlasma.on = function (pattern, handler) {
    this.target.addEventListener(pattern.type, handler)
    plasma.on(pattern, handler)
  }

  domPlasma.once = function (pattern, handler) {
    this.target.addEventListener(pattern.type, (e) => {
      this.target.removeEventListener(pattern.type, handler)
      handler(e)
    })
    plasma.once(pattern, handler)
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
    plasma.emit(input)
  }

  domPlasma.off = function (pattern, handler) {
    this.target.removeEventListener(pattern.type, handler)
    plasma.off(pattern, handler)
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
