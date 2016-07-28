# organic-oval

organic frontend components as custom html tags

## API

### `oval.init(plasma)`

### `oval.getRegisteredTag(name)`

### `oval.mountAll(selector, root)`

### `oval.appendAt(el, tagName)`

### `oval.registerTag(tagName, TagClass)`

### `oval.BaseTag(tag, tagName, root)`

## Setup

Oval can be used in many ways. There are different setups for each way. Read them all and choose the one that fits you.

### Vanilla

[example](https://github.com/camplight/organic-oval/tree/master/examples/setup/vanilla)

Vanilla setup consists of the basic things, that `organic-oval` needs in order to run. Here is an example `webpack` config:

```
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

```
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

```
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

### Nested Tags
