var oval
var Tag = function (tagName, root) {
  oval.BaseTag(this, tagName, root)
}
Tag.prototype.render = function (createElement) {
  return createElement('div', {})
}

beforeEach(function () {
  window.document.body.innerHTML = ''
  var plasma = {}
  oval = require('../../index')
  oval.registeredTags = []
  oval.init(plasma)
  expect(oval.plasma.on).to.exist
  expect(oval.plasma.off).to.exist
  expect(oval.plasma.once).to.exist
  expect(oval.plasma.emit).to.exist
  expect(oval.BaseTag).to.exist
})

test('registerTag', function () {
  oval.registerTag('custom-tag', Tag)
  expect(oval.registeredTags.length).to.eq(1)
})

test('getRegisteredTag', function () {
  var Tag = oval.getRegisteredTag('custom-tag')
  expect(Tag).to.eq(Tag)
})

test('mountAll(*)', function () {
  var el = document.createElement('custom-tag')
  document.body.appendChild(el)
  oval.mountAll(document.body)
  expect(document.body.children.length).to.eq(1)
})

test('appendAt', function () {
  var el = document.createElement('div')
  document.body.appendChild(el)
  var tag = oval.appendAt(el, 'custom-tag')
  expect(tag).to.exist
})

test('mountAt', function () {
  var el = document.createElement('div')
  document.body.appendChild(el)
  var tag = oval.mountAt(el, 'custom-tag')
  expect(tag).to.exist
})
