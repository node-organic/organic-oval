# organic-oval

organic front-end components as custom HTML tags

**Check out [organic-oval-examples](https://github.com/camplight/organic-oval-examples) for example usages of `organic-oval`**

## Setup

Oval can be used in many ways. There are different setups for each way. Read them all and choose the one that best fits you. You can check out all example setups and test them out [**here**](https://github.com/camplight/organic-oval-examples/tree/master/setups)

### quick setup

#### install dependencies

`npm i webpack loader-utils babel-loader babel-plugin-transform-react-jsx babel-preset-es2015`

#### add webpack.config.js

```js
var webpack = require('webpack')

module.exports = {
  'resolve': {
    'extensions': ['', '.webpack.js', '.web.js', '.tag', '.js'],
    'modulesDirectories': ['web_modules', 'node_modules']
  },
  'plugins': [
    new webpack.ProvidePlugin({
      'oval': 'organic-oval'
    })
  ],
  'module': {
    'preLoaders': [
      {
        test: /\.tag$/,
        exclude: /node_modules/,
        loaders: [
          'organic-oval/webpack/oval-loader',
          'organic-oval/webpack/oval-control-statements-loader'
        ]
      }
    ],
    'loaders': [
      {
        test: /\.js$|\.tag$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            ['transform-react-jsx', { pragma: 'createElement' }]
          ],
          presets: ['es2015']
        }
      }
    ]
  }
}

```

## API

### oval.init(plasma)

initializes `organic-oval` with *optional* plasma instance

```js
var oval = require('organic-oval')
oval.init()
...
```

### oval.registerTag(tagName, TagClass)

register tag with given implementation

```js
var MyTagClass = function (tagName, rootEl, props) {}

oval.registerTag('my-tag', MyTagClass)
```

### oval.getRegisteredTag(name)

gets the tag class from registered tags by name

```js
var MyTagClass = oval.getRegisteredTag('my-tag')
```

### oval.mountAll(selector, root)

mount and update any tags under `selector` & `root`, special selector value (`"*"`) to mount any tags found from registered

Returns all mounted tags as Array

```js
// mount all registered tags found on body
oval.mountAll('*', window.document.body)

// mount all tags matching registered having ovalTag attribute recursively at domElement
oval.mountAll('[ovalTag]', domElement)
```

### oval.appendAt(el, tagName, props)

append, mount and update a new tag instance to given `el` by `tagName`. This method appends the tag to the given element.

```js
oval.appendAt(window.document.body, 'my-tag')
```

### oval.mountAt(el, tagName, props)

mount and update a new tag instance to given `el` by `tagName`. This method overrides given element with the tag instance

```js
oval.mountAt(window.document.body, 'my-app-tag')
```

### oval.BaseTag(tag, tagName, rootEl, props)

Tag constructor Function

```js
class MyTag {
  constructor (tagName, rootEl, props) {
    oval.BaseTag(this, tagName, rootEl, props)
  }
}
```

## Oval Tags Usage

### Basic Tag

Every tag consists of 3 parts, which are all declared i the `.tag` file.

#### **tag name**

The **tag name** is used for the tag registration and usage later in the application. The tag name must be unique.

For example if we have the site navigation moved in its own tag, we can name the tag `navigation`.

The tag name is declared in the first opening and last closing tags in the `.tag` file

```html
<navigation>
  ...
</navigation>
```

#### **script (optional)**

  The script contains the tag's logic. It must be wrapped in `<script>` tags. The tag object is accessed via the `tag` variable.

```html
...
<script>
  tag.links = {
    home: '#home',
    about: '#about'
  }
</script>
...
```

#### **template**

The template part contains all the DOM elements. It describes the layout of the tag. Organic-oval uses [JSX]() to describe its layout. You have the `tag` variable available in the template, too.

```html
...
<ul class="navigation">
  <li><a href={tag.links.home}>Home</a></li>
  <li><a href={tag.links.about}>About</a></li>
</ul>
...
```

#### Basic Tag Example

here is how the whole `navigation.tag` looks like

```html
<navigation>
  <script>
    tag.links = {
      home: '#home',
      about: '#about'
    }
  </script>
  <ul class="navigation">
    <li><a href={tag.links.home}>Home</a></li>
    <li><a href={tag.links.about}>About</a></li>
  </ul>
</navigation>
```

### Nested Tags

#### Requiring a nested tag

In order to use a tag within a tag, you must require it in the `<script></script>`. There is no need to assign it to a variable. What the require does is to register the nested tag to `oval`.

```html
<navigation>
  <script>
    require('./navigation-item')
    ...
  </script>
  ...
</navigation>
```

#### Using a nested tag

After requiring it, the nested tag can be used as any other tag in the parent's template.

```html
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

### Passing props to a tag

#### As an attribute

Setting an attribute to nested component is just like setting an attribute to a DOM element.

```html
<navigation>
  <script>
    require('./navigation-item')
    ...
  </script>
  ...
  <navigation-item class="item" ...>...</navigation-item>
  ...
</navigation>

<navigation-item>
  <script>
    console.log(tag.attributes.class) // item
  </script>
  <div {...tag.attributes}></div>
</navigation-item>
```

##### Keep tag attributes from parent to child

```html
<navigation-item {...tag.attributes}>
  <div></div>
</navigation-item>
```

#### By reference as property

Passing a property by reference makes it available as `tag.props.link` in the nested tag's logic.

```html
<navigation>
  <script>
    require('./navigation-item')
    ...
  </script>
  ...
  <navigation-item prop-link={{title: 'Home', href: '#home'}}...>
    ...
  </navigation-item>
  ...
</navigation>

<navigation-item>
  <script>
    console.log(tag.props.link) // {title: 'Home', href: '#home'}
  </script>
</navigation-item>
```

### Render inner content

```html
<my-container>
  <h1> Container with dynamic children: </h1>
  <hr />
  {tag.innerChildren}
  <hr />
</my-container>

<app>
  <my-container>
    <h2>inner content 1</h2>
  </my-container>
  <my-container>
    <my-custom-tag>inner content 2</my-custom-tag>
  </my-container>
</app>
```

### Using oval control statements

#### IF conditional statements

```html
<navigation>
  <script>
    tag.show = false
  </script>
  <h1 if={tag.show}>
    H1 Text
  </h1>
</navigation>
```

#### Loop control statements

```html
<navigation>
  <script>
    tag.items = [1, 2, 3]
  </script>
  <ul>
    <each itemValue, itemIndex in {tag.items}>
      <li>{itemIndex} - {itemValue}</li>
    </each>
  </ul>
</navigation>
```

### control rendering of custom tag names

By default `organic-oval` will render custom tag names, however there are cases where DOM doesn't likes this approach and can be altered via `tag.keepTagName` option.

See the following scenario as example:

* `list-container.tag`

  ```html
  <list-container>
    <script>
      require('./my-list-item')
    </script>
    <ul>
      <each item, itemIndex in {tag.items}>
        <my-list-item prop-value={item} prop-values={tag.items} />
      </each>
    </ul>
  </list-container>
  ```

* `my-list-item.tag`

  ```html
  <my-list-item>
    <script>
      this.keepTagName = false
    </script>
    <li>
      {tag.props.value}
    </li>
  </my-list-item>
  ```

### control re-rendering of tags

The following tag won't re-render itself and will not be replaced by parent tag updates as long as it is instantiated and part of the dom. This is particulary useful for optimizations, see [organic-oval-benchmarks](https://github.com/camplight/organic-oval-benchmarks)

```html
<my-tag>
  <script>
    tag.on('mounted', function () {
      tag.shouldRender = false
    })
  </script>
</my-tag>
```

### Tag directives

`organic-oval` gives you the functionality to extend the `createElement` function. You can write you directive and inject it in the components that will use it.

```js
module.exports = function (tag) {
  return function (createElement, tagName, props, ...children) {
    if (props && props['augmentMeWithClick']) {
      props['onclick'] = function () {
        alert(props['alert'])
      }
    }
  }
}
```

```html
<my-tag>
  <script>
    tag.injectDirectives([require('my-directive')])
  </script>
  <span>some text</span>
  <h1 augmentMeWithClick>alert with home</h1>
</my-tag>
```

Check out the [**directive example**](https://github.com/camplight/organic-oval-examples/tree/master/tags/directives) to see more.

### References to Dom Elements

```html
<my-tag>
  <script>
    tag.on('updated', () => {
      console.log(tag.refs.inputName)
    })
  </script>
  <input ref='inputName' />
</my-tag>
```

## global augmenting

```js
// global-oval.js
module.exports = function (oval) {
  var oldBaseTag = oval.BaseTag
  var myGlobalDirectives = [...]
  oval.BaseTag = function (tag, tagName, rootEl, props) {
    oldBaseTag(tag, tagName, rootEl, props)
    tag.injectDirectives(myGlobalDirectives)
  }
}

// main.js
var oval = require('organic-oval')
require('global-oval')(oval)
```

### Lifecycle events

1. `mount` - only on mount
1. `update` - every time when tag is updated (respectively on first mount too)
1. `updated` - every time after tag is updated
1. `mounted` - only once tag is mounted and updated
1. `unmount` - when tag is going to be removed
1. `unmounted` - when tag is removed

## Known Issues

1. multiline element declaration with `if` attribute will work only when if statement is on the first line

  **Won't** work:

  ```html
  <h1 class='test'
    if={condition}>
    Some Text
  </h1>
  ```

  *Will* work:

  ```html
  <h1 if={condition}
    class='test'>
    Some Text
  </h1>
  ```
