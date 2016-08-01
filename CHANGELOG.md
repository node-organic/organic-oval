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

### Improved

- `oval.unmount`
- oval compiler related code located under /lib/compilers
- add option to strip component's parent tag `tag.keepParentTag`, defaults to `true`

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
