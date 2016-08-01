# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0] - 2016-08-01

### API changes

- `baseTag` all props from parent component go to `tag.props`

### Fixed

- `BaseTag` organic-plasma-dom events
- `BaseTag.shouldRender`
- standardjs source code style

### Added

- basic oval tests
- `oval.mountAt`
- code coverage
- examples
- documentation
- `tag.updateProps()`
- `tag.updateRefs()`

### Improved

- `oval.unmount`
- oval compiler related code located under /lib/compilers
- `registerTag` remove usage of `document.registerTag`
- `baseTag` all props from parent component go to `tag.props`
- add option to strip component's parent tag `tag.keepParentTag`, defaults to `true`


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
