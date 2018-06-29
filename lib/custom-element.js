module.exports = function (el) {
  Object.assign(el, {
    mounted: false,
    shouldRender: true,
    state: {}, // populated during rendering

    html: function () {
      throw new Error('custom-element html method must be implemented')
    },
    render: function () {
      throw new Error('custom-element render method must be implemented')
    },
    template: function () {
      throw new Error('custom-element template method must be implemented')
    },

    update: function () {
      if (!this.shouldRender) return
      this.emit('update')
      this.render()
      this.emit('updated')
    },
    shouldUpdate: function (newState) {
      Object.assign(this.state, newState)
      this.update()
    },
    connectedCallback: function () {
      this.emit('mount')
      this.update()
      this.mounted = true
      this.emit('mounted')
    },
    disconnectedCallback: function () {
      this.emit('unmounted')
    },
    on: function (eventName, eventHandler) {
      this.addEventListener(eventName, eventHandler)
    },
    off: function (eventName, eventHandler) {
      this.removeEventListener(eventName, eventHandler)
    },
    emit: function (eventName, eventData) {
      let e = new CustomEvent(eventName, {
        detail: eventData,
        bubbles: false
      })
      this.dispatchEvent(e)
    },
    unmount: function () {
      this.parentNode.removeChild(this)
      this.disconnectedCallback()
    }
  })
}
