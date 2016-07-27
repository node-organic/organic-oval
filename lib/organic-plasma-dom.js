module.exports = function (plasma) {
  var domPlasma = {}
  for (var key in plasma) {
    domPlasma[key] = plasma[key]
  }
  domPlasma.target = window.document

  domPlasma.on = function (pattern, handler) {
    domPlasma.target.addEventListener(pattern.type, handler)
  }

  domPlasma.once = function (pattern, handler) {
    domPlasma.target.addEventListener(pattern.type, function (e) {
      domPlasma.target.removeEventListener(pattern.type, handler)
      handler(e)
    })
  }

  domPlasma.emit = function (input) {
    var event
    if (document.createEvent) { // because of IE
      event = document.createEvent('Event')
      event.initEvent(input.type, true, false)
      for (var key in input.eventData) {
        event[key] = input.eventData[key]
      }
    } else {
      event = new Event(input.type, input.eventData)
    }
    domPlasma.target.dispatchEvent(event)
  }

  domPlasma.off = function (pattern, handler) {
    domPlasma.target.removeEventListener(pattern.type, handler)
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
