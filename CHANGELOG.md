# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [major.minor.patch] - YYYY-MM-DD

### Fixed

- BaseTag `update` event is fired after tag props/attrs are updated
- Oval Directives `postCreate` is not triggered
- Set root attributes only for compiled tag files

### Improved

- Oval Directives `postCreate(el, value)`
- Oval Directives automatically delete directive's property once consumed
- Oval Directives README section

## [4.0.0] - 2016-08-13

### API CHANGES

- removed `tag.keepTagName`
- `oval.mountAll`
- `oval.appendAt`
- `oval.mountAt`
- `oval.BaseTag`
- replaced `morphdom` with `incremental-dom`

### Added

- custom tag attribute `freeze`

### Fixed

- `if` control statements having multiple expressions within as single line
- boolean attributes parsing in `createElement`

## [3.1.0] - 2016-08-05

### Added

- `BaseTag.morph()`
- `BaseTag.updateinnerChildren(sourceEl)` - accepting optional source element

### Improved

- `BaseTag.injectDirectives()` - every directive accepts `tag` and `directiveName`
- each loop tests
- Components with child components rendering
- Components events
- `BaseTag.updateAttributes(sourceEl)` - accepts optional source element
- `BaseTag.updateProps(sourceEl)` - accepts optional source element
- `BaseTag.updateRefs(sourceEl)` - accepts optional source element

### Fixed

- oval `if` control statement edge case with inner tags having the same name of the openning one

## [3.0.0] - 2016-08-03

### API changes

- replaced `unmount` with `unmounted` and introduced `unmount` as before element remove
- renamed `keepParentTag` with `keepTagName`
- `tag.shouldRender` is refactored as flag instead of function
- tag directives are refactored to support better dom element augmentation control and less CPU

### Improved

- README

### Fixed

- oval control statements

## [2.0.0] - 2016-08-02

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
  - do not remove other element attributes
- directives
  - `baseTag`'s `tag.injectDirectives` passes `tag` to every directive:
  - `create-element` to passes the `createElement` function to every directive along with the `tagName`, `props` and `children`

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
