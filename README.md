# organic-oval

organic front-end components as custom HTML tags

**Check out [organic-oval-examples](https://github.com/camplight/organic-oval-examples) for example usages of `organic-oval`**

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

Oval can be used in many ways. There are different setups for each way. Read them all and choose the one that best fits you. You can check out all example setups and test them out [**here**](https://github.com/camplight/organic-oval-examples/tree/master/setups)


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

#### Using oval control statements

##### setup

Based on Oval Tags Syntax [Setup](#setup) one should add `oval-control-statements-loader` to `preLoaders`

```js
var webpack = require('webpack')

module.exports = {
  ...
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
    ...
  }
}
```

##### IF conditional statements

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

##### Loop control statements

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

By default `organic-oval` will render custom tag names, however there are cases where DOM doesn't likes this approach and can be altered via `tag.keepParentTag` option.

See the following scenario as example:

* `list-container.tag`

  ```html
  <list-container>
    <script>
      require('./my-list-item')
    </script>
    <ul>
      <each item in {tag.props.items}>
        <my-list-item ref-value={item} />
      </each>
    </ul>
  </list-container>
  ```

* `my-list-item.tag`

  ```html
  <my-list-item>
    <script>
      this.keepParentTag = false
    </script>
    <li>
      {tag.props.value}
    </li>
  </my-list-item>
  ```

##### Lifecycle events
