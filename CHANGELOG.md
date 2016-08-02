# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0] - 2016-08-01

### API changes

- `baseTag` all props from parent component go to `tag.props`
- `ref-` is now called `prop-`

### Added

- basic oval tests
- `oval.mountAt`
- code coverage
- examples
- documentation
- `tag.updateProps()` which populates `tag.props` object
- `tag.updateRefs()` which populates `tag.refs` object
- `tag.updateAttributes()` which populates `tag.attributes` object
- moved examples in a seperate [repository](https://github.com/camplight/organic-oval-examples)

### Improved

- `oval.unmount`
- oval compiler related code located under /lib/compilers
- add option to strip component's parent tag `tag.keepParentTag`, defaults to `true`
- `if` control statements parser
  there was a problem when we have an element with some attributes and a `if` attribute. The rendered element on `condition === true` losed its other attributes:

  ```
  // before compilation
  <h1 class="title" if={condition}>
    Title Goes Here
  </h1>

  // after compilation (before)
  {
    condition
    ? (
      <h1>Title Goes Here</h1>
    )
    : null
  }

  // after compilation (now)
  {
    condition
    ? (
      <h1 class="title">Title Goes Here</h1>
    )
    : null
  }
  ```
- directives

  - Updated `baseTag`'s `tag.injectDirectives`, so it passes `tag` to every directive:

    ```
    tag.injectDirectives = function (directives) {
      tag.directives = directives
      var argumentedDirectives = directives.map((d) => d(tag))
      this.createElement = oval.createElement(argumentedDirectives)
    }
    ```

  - Updated `create-element` to pass the `createElement` function to every directive along with the `tagName`, `props` and `children`.

  - Example of a directive after these changes:

    ```
    // converts textarea text to paragraphs
    module.exports = function (tag) {
      return function (createElement, tagName, props, ...children) {
        if (props && props['parse-paragraphs']) {
          if (!children || !children[0]) {
            return false
          }
          children = children[0].split('\n').map(function (text) {
            return createElement('p', props, text)
          })
          return createElement(tagName, props, children)
        }
      }
    }

    ```

### Fixed

- `registerTag` remove usage of `document.registerTag`
- `BaseTag` organic-plasma-dom events
- `BaseTag.shouldRender`
- standardjs source code style


## [1.0.0] - 2016-07-27

### Added

- `oval`
- `oval.init`
- `oval.updateElement`
- `oval.createElement`
- `oval.BaseTag`
- `oval.registerTag`
- `oval.getRegisteredTag`
- `oval.mountAll`
- `oval.appendAt`
