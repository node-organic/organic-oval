const oval = require('../index')

oval.define({
  tagName: 'app',
  tagLine: '',
  onconstruct: function () {
    this.template = () => {
      return this.createElement('emitter', {
        customEvent: () => {
          this.customEventCalled = true
        }
      })
    }
  }
})

oval.define({
  tagName: 'emitter',
  tagLine: '',
  onconstruct: function () {
    this.on('mounted', () => {
      this.emit('customEvent')
    })
    this.template = () => {
      return this.createElement('div', null, 'text')
    }
  }
})

test('events', function () {
  var app = document.createElement('app')
  document.body.appendChild(app)
  oval.upgrade(app)
  expect(app.children[0].tagName).toEqual('EMITTER')
  expect(app.component.customEventCalled).toEqual(true)
})
