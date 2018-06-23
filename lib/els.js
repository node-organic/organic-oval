module.exports = function (component) {
  component.els = function (value) {
    if (value) {
      return component.querySelector('[els="' + value + '"]')
    } else {
      return component.querySelectorAll('[els]')
    }
  }
}