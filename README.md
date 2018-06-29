# organic-oval v5

organic front-end components as custom HTML tags

**Check out** 

* [organic-oval-examples based on organic-oval v4](https://github.com/camplight/organic-oval-examples)
* [organic-oval-benchmarks based on organic-oval v4](https://github.com/camplight/organic-oval-benchmarks)

### quick start

#### install dependencies

`npm i organic-oval webpack`

#### add webpack.config.js

```js
var webpack = require('webpack')

module.exports = {
  'resolve': {
    'extensions': ['.webpack.js', '.web.js', '.js', '.tag'],
  },
  'module': {
    'rules': [
      {
        test: /\.tag$/,
        exclude: /node_modules/,
        use: [
          {loader: 'organic-oval/webpack/oval-loader'},
          {loader: 'organic-oval/webpack/oval-control-statements-loader'}
        ]
      }
    ]
  }
}

```

### use

```js
// dist/bundle.js
let oval = require('organic-oval')
Object.assign(oval, require('organic-oval/engines/incremental-dom'))
require('./components/my-app.tag')
```

```html
<!-- index.html -->
<html>
  <body>
    <my-app></my-app>
    <script src='dist/bundle.js'></script>
  </body>
</html>

<!-- my-app.tag -->
<my-app>
  <h1>Welcome!</h1>
</my-app>
```

## DSL

```html
<navigation>
  <script>
    this.links = {
      home: '#home',
      about: '#about'
    }
  </script>
  <ul class="navigation">
    <li><a href=${this.links.home}>Home</a></li>
    <li><a href=${this.links.about}>About</a></li>
  </ul>
</navigation>
```

* The tag name **must be unique**.
* The script is *optional* and contains the **component's constructor logic**.

### Nesting

```html
<!-- ./navigation.tag -->
<navigation>
  <script>
    require('./navigation-item')
    ...
  </script>
  ...
  <navigation-item ...>...</navigation-item>
  ...
</navigation>
```

### Passing props and attributes to a component

```html
<!-- ./navigation.tag -->
<navigation>
  <script>
    require('./navigation-item')
    this.itemValue = 'item'
    this.obj = {}
    this.handler = function (e) {
      console.log(e) // details: 'response'
    }
  </script>
  ...
  <navigation-item d-value=${this.itemValue} obj=${this.obj} eventName=${this.handler} />
  ...
</navigation>

<!-- ./navigation-item.tag -->
<navigation-item>
  <script>
    console.log(this.getAttribute('d-value')) // item
    console.log(this.state.obj) // {}
    this.emit('eventName', 'response') // will trigger any event's handlers
  </script>
  <div></div>
</navigation-item>
```

### Render inner content

```html
<!-- ./my-container.tag -->
<my-container>
  <h1> Container with dynamic children: </h1>
  <hr />
  <slot name='inner' />
  <hr />
</my-container>

<!-- ./app.tag -->
<app>
  <my-container>
    <h2 slot='inner'>inner content 1</h2>
  </my-container>
  <my-container>
    <my-custom-tag slot='inner'>inner content 2</my-custom-tag>
  </my-container>
</app>
```

### Using oval control statements

#### IF conditional statements

```html
<navigation>
  <script>
    this.show = false
  </script>
  <h1 if=${this.show}>
    H1 Text
  </h1>
</navigation>
```

#### Loop control statements

```html
<navigation>
  <script>
    this.items = [1, 2, 3]
  </script>
  <ul>
    <each itemValue, itemIndex in ${this.items}>
      <li>${itemIndex} - ${itemValue}</li>
    </each>
  </ul>
</navigation>
```

### Lifecycle events

1. `mount` - only once on mount
1. `update` - every time when tag is updated (respectively on first mount too)
1. `updated` - every time after tag is updated and rendered to dom
1. `mounted` - only once tag is mounted and updated into dom
1. `unmounted` - when tag is removed from dom

### freeze dom elements

The `div` wont be re-rendered when `my-tag` updates leaving a space for integration
with other libraries working with dom

```
<my-tag>
  <div freeze>won't be re-rendered allowing 3rd party libraries to manipulate the element</div>
</my-tag>
```

### control re-rendering of tags

The following tag won't re-render itself and will not be replaced by parent tag updates as long as it is instantiated and part of the dom.

```html
<my-tag>
  <script>
    tag.on('mounted', function () {
      tag.shouldRender = false
    })
  </script>
</my-tag>
```

### virtual nodes

```html
<my-tag>
  <virtual>
    <span>Hello</span>
  </virtual>
</my-tag>
```

renders as

```html
<my-tag>
  <span>Hello</span>
</my-tag>
```

### oid attribute

Oval automatically assigns oid attributes during compilation of `.tag` files for:

* nodes having `if=${}` statements
* iterated nodes within `<each></each>` loop

:warning: This attribute has a special meaning for rendering engines to be able to execute
properly dom diff & re-render algorithms especially in cases with similar dom node shapes siblings to each other.

## HowTo

### define components at runtime

```js
require('organic-oval').define({
  tagName: 'my-tag',
  script: function () {},
  template: function (html) {return html`<div>inner component content</div>`}
})
```

### create components at runtime

```js
let el = document.createElement('my-tag')
require('organic-oval').upgrade(el)
```

## API

### oval.html(component)
The method returns tagged template function, see [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

The tagged template function (scoped to the component) `component.html` then is used by 
`component.template()` implementations to render component's representation accordingly to
its state.

### oval.render(component)
The method returns render function (scoped to the component) which patches
components representation to match the one accordingly to `component.template()`

### oval.define(options)
The method defines a component accordingly to its options:

* `tagName`: String
* `tagLine`: String
* `script()`: Function
* `template(html)`: Function

:warning: Note that this method also upgrades all matched document.body elements by `tagName`

### oval.upgrade(el)

The method upgrades given NodeElement `el` accordingly to previously defined 
component with matching `el.tagName`

## Known Compiler Issues

1. element declaration with `if` attribute will work only when if statement is 
on the first line

  *will NOT* work:

  ```html
  <h1 class='test'
    if=${condition}>
    Some Text
  </h1>
  ```

2. each loops will work only when looped node is declared on the next line

  *will NOT* work:
  
  ```html
  <each model in ${items}><looped-content>${model}</looped-content></each>
  ```
