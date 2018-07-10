# organic-oval v5

organic front-end components as custom HTML tags

**Check out** 

* [organic-oval-benchmarks](https://github.com/camplight/organic-oval-benchmarks)

### quick start

#### install dependencies

`npm i organic-oval webpack babel-loader babel-plugin-transform-react-jsx`

#### add webpack.config.js

```js
const webpack = require('webpack')

module.exports = {
  'resolve': {
    'extensions': ['.webpack.js', '.web.js', '.js', '.tag'],
  },
  'module': {
    'rules': [
      {
        test: /\.tag$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['babel-plugin-transform-react-jsx']
          }
        }
      },
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

```html
<!-- ./index.html -->
<html>
  <body>
    <my-app></my-app>
    <script src='./bundle.js'></script>
  </body>
</html>
```

```js
// ./bundle.js
require('./components/my-app.tag')
```

```html
<!-- ./my-app.tag -->
<my-app>
  <h1>Welcome!</h1>
</my-app>
```

## DSL

```html
<navigation>
  <script>
    this.state.links = {
      home: '#home',
      about: '#about'
    }
  </script>
  <ul class="navigation">
    <li><a href={this.state.links.home}>Home</a></li>
    <li><a href={this.state.links.about}>About</a></li>
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

### Props, attributes and handlers

```html
<!-- ./navigation.tag -->
<navigation>
  <script>
    require('./navigation-item')
    this.itemValue = 'item'
    this.obj = {with_references: true}
    this.handler = (value) => {
      console.log(value) // 'response'
    }
    this.clickHandler = (e) => {}
  </script>
  ...
  <navigation-item 
    d-value={this.itemValue} 
    obj={this.obj} 
    eventName={this.handler} />
  ...
</navigation>

<!-- ./navigation-item.tag -->
<navigation-item>
  <script>
    console.log(this.props['d-value']) // "item"
    console.log(this.props.obj) // {with_references: true}
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
  <h1 if={this.show}>
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
    <each itemValue, itemIndex in {this.items}>
      <li>{itemIndex} - {itemValue}</li>
    </each>
  </ul>
</navigation>
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

## API

### oval.define(options)
The method defines a component accordingly to its options:

* `tagName`: String
* `tagLine`: String
* `script()`: Function
* `template(createElement)`: Function

:warning: Note that the method also upgrades any document.body elements by `tagName`

```js
/** @jsx createElement */
require('organic-oval').define({
  tagName: 'my-tag',
  script: function () {},
  template: function (createElement) {
    return <div>tag content</div>
  }
})
```

### oval.upgrade(el)

The method upgrades given NodeElement `el` accordingly to previously defined 
component with matching `el.tagName`.

Returns reference to the newly created component. Calling the method also sets `el.component` reference to the created component.

```js
let el = document.createElement('my-tag')
document.body.appendChild(el)
require('organic-oval').upgrade(el)
```

### Component API
Every Oval component extending `preact` Component. All methods are inherited thereafter and you should refer to [`preact`'s api refernce as well](https://preactjs.com/guide/api-reference)

#### shadowRoot
Returns reference to the rendered root element.

#### update
Instructs to do a `forceUpdate` of the component. Fires `update` related events.

#### unmount
Removes the component and its custom element from dom. Fires `unmount` events.

#### on(eventName, eventHandler)
Start receiving emitted events. By default Oval Components self emit their Lifecycle events as follows:

##### Lifecycle events

1. `mount` - only once on mount
1. `update` - every time when tag is updated (respectively on first mount too)
1. `updated` - every time after tag is updated and rendered to dom
1. `mounted` - only once tag is mounted and updated into dom
1. `unmounted` - when tag is removed from dom

Additionally any functions been passed to oval components as custom element attributes will be automatically subscribed to the component:

```
<my-container>
  <script>
    this.myCustomEventHandler = function (eventData) {
      // triggered every second by `my-component`
    }
  </script>
  <my-component customEvent={this.myCustomEventHandler} />
</my-container>

<my-component>
  <script>
    this.on('mounted', () => {
      setInterval(() => {
        this.emit('customEvent', 'customEventData')
      }, 1000)
    })
  </script>
</my-component>
```

#### off(eventName, eventHandler)
Stop receiving events

#### emit(eventName, eventData)
Publish `eventName` with optional `eventData` to all subscribers.

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
