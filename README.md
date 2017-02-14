# organic-oval

organic front-end components as custom HTML tags

**Check out [organic-oval-examples](https://github.com/camplight/organic-oval-examples) for example usages of `organic-oval`**

## Setup

Oval can be used in many ways. There are different setups for each way. Read them all and choose the one that best fits you. You can check out all example setups and test them out [**here**](https://github.com/camplight/organic-oval-examples/tree/master/setups)

### quick setup

#### install dependencies

`npm i organic-oval webpack babel-loader babel-plugin-transform-react-jsx babel-preset-es2015`

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
var MyTagClass = function (rootEl, props, attrs) {
  oval.BaseTag(this, rootEl, props, attrs)
}

oval.registerTag('my-tag', MyTagClass)
```

### oval.getRegisteredTag(name)

gets the tag class from registered tags by name

```js
var MyTagClass = oval.getRegisteredTag('my-tag')
```

### oval.mountAll(root)

mount and update any tags under `root`

Returns all mounted tags as Array

```js
// mount all registered tags found on body
oval.mountAll(window.document.body)

// mount all tags matching registered having ovalTag attribute recursively at domElement
oval.mountAll(domElement)
```

### oval.appendAt(el, tagName, props, attrs)

append, mount and update a new tag instance to given `el` by `tagName`. This method appends the tag to the given element.

```js
oval.appendAt(window.document.body, 'my-tag')
```

### oval.mountAt(el, tagName, props, attrs)

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
  <navigation-item class="item" data-value='42' ...>...</navigation-item>
  ...
</navigation>

<navigation-item>
  <script>
    console.log(tag.attributes.class) // item
  </script>
  <div {...tag.attributes}></div>
</navigation-item>
```

#### By reference as property

Passing a property by reference makes it available as `tag.props.link` in the nested tag's logic.

```html
<navigation>
  <script>
    require('./navigation-item')
    tag.myVariable = {title: 'Home', href: '#home'}
    ...
  </script>
  ...
  <navigation-item prop-link={tag.myVariable}...>
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

`organic-oval` gives you the functionality to extend the `createElement` function. You can write your directive and inject it in the components that will use it.

A directive is the following module:

```js
module.exports = function (tag, directiveName) {
  return {
    preCreate: function (createElement, tagName, props, ...children) {
      // ... augment props
      var directiveValue = props[directiveName]
      // optionally return new array of children instead of given ones using createElement Fn
      // example: return [createElement('div'), createElement('my-component')]
    },
    postCreate: function (el, directiveValue) {
      // ... augment `el` dom element
    },
    tagName: function (tagName, props) {
      // return different tagName value
      var newTagNameValue = props[directiveName]
      return newTagNameValue
    }
  }
}
```

And can be injected into any tag:

```html
<my-tag>
  <script>
    tag.injectDirectives({
      'directive-name': require('my-directive')
    })
  </script>
  ...
  <p directive-name>hello directives</p>
  ...
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
  oval.BaseTag = function (tag, rootEl, props, attrs) {
    oldBaseTag(tag, rootEl, props, attrs)
    tag.injectDirectives(myGlobalDirectives)
  }
}

// main.js
var oval = require('organic-oval')
require('global-oval')(oval)
```

### Lifecycle events

1. `mount` - only once on mount
1. `update` - every time when tag is updated (respectively on first mount too)
  * use this event to modify `tag.view` which will be used to patch `tag.root`
1. `updated` - every time after tag is updated
  * use this event to modify `tag.root`
1. `mounted` - only once tag is mounted and updated
1. `unmount` - when tag is going to be removed
  * use this event to destroy any runtime allocated resources
1. `unmounted` - when tag is removed

### freeze dom elements

```
<my-tag>
  <div freeze>won't be re-rendered allowing 3rd party libraries to manipulate the element</div>
</my-tag>
```

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

2. each loops should have `cid` on every looped item so that incremental-dom can properly update them on changes

  **Won't** work with dynamic `items`:

  ```html
  <each item in {items}>
    <div>{item}</div>
  </each>
  ```

  *Will* work:

  ```html
  <each item, index in {items}>
    <div cid={index}>{item}</div>
  </each>
  ```

3. conditional rendered sibling tags with same name should have `cid` so that incremental-dom can properly update them on changes

  **Won't** work with conditional tags:

  ```html
  <div if={condition1}>...</div>
  <div if={condition2}>...</div>
  ```

  *Will* work:

  ```html
  <div if={condition1} cid='value1'>...</div>
  <div if={condition2} cid='value2'>...</div>
  ```
