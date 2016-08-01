# organic-oval

organic frontend components as custom html tags

## API

### `oval.init([plasma])`

initializes `organic-oval` with plasma

### `oval.registerTag(tagName, TagClass)`

register tag with given implementation

### `oval.getRegisteredTag(name)`

gets the tag class from registered tags by name

### `oval.mountAll(selector, root)`

mount and update any tags under `selector` & `root`, special selector value (`"*"`) to mount any tags found from registered

Returns all mounted tags as Array

### `oval.appendAt(el, tagName)`

append, mount and update a new tag instance to given `el` by `tagName`. This method appends the tag to the given element.

### `oval.mountAt(el, tagName)`

mount and update a new tag instance to given `el` by `tagName`. This method overrides given element with the tag instance

### `oval.BaseTag(tag, tagName, root)`

Tag constructor Function

```
class MyTag {
  constructor (tagName, root) {
    oval.BaseTag(this, tagName, root)
  }
}
```

## Setup

Oval can be used in many ways. There are different setups for each way. Read them all and choose the one that best fits you.

### Vanilla

[example](https://github.com/camplight/organic-oval/tree/master/examples/setup/vanilla)

Vanilla setup consists of the basic things, that `organic-oval` needs in order to run. Here is an example `webpack` config:

```js
module.exports = {
  'module': {
    'loaders': [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}
```

### JSX setup

[example](https://github.com/camplight/organic-oval/tree/master/examples/setup/jsx)

If you want to use `JSX` in you components here is an example `webpack` config for `organic-oval` + `JSX`:

```js
module.exports = {
  'module': {
    'loaders': [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}
```

### Oval Tags Syntax

[example](https://github.com/camplight/organic-oval/tree/master/examples/setup/tag)

We suggest using oval with `.tag` files. We have implemented a loader, that will take your tag definitions and will make valid oval components.
Here is the `webpack` configuration you will need in order to get this setup running.

```js
var webpack = require('webpack')

module.exports = {
  'resolve': {
    'extensions': ['', '.tag', '.js']
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
          'organic-oval/webpack/oval-loader'
        ]
      }
    ],
    'loaders': [
      {
        test: /\.js|.tag$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            'transform-es2015-arrow-functions',
            ['transform-react-jsx', { pragma: 'createElement' }]
          ],
          presets: ['es2015']
        }
      }
    ]
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

#### Passing props to a nested tag

1. As an attribute

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
  ```

2. By reference

  Passing a property by reference makes it available as `tag.props.link` in the nested tag's logic.

  ```html
  <navigation>
    <script>
      require('./navigation-item')
      ...
    </script>
    ...
    <navigation-item ref-link={{title: 'Home', href: '#home'}}...>
      ...
    </navigation-item>
    ...
  </navigation>
  ```
