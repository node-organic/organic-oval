const oval = require('../index')

oval.define({
  tagName: 'app',
  template: function (h) {
    return h('emitter', {
      customEvent: () => {
        this.customEventCalled = true
      }
    })
  }
})

oval.define({
  tagName: 'emitter',
  script: function () {
    this.on('mounted', () => {
      this.emit('customEvent')
    })
  },
  template: function (h) {
    return h('div', null, 'text')
  }
})

test('shouldRender', function () {
  var app = document.createElement('app')
  document.body.appendChild(app)
  oval.upgrade(app)
  expect(app.shadowRoot.tagName).toEqual('EMITTER')
  expect(app.component.customEventCalled).toEqual(true)
})
