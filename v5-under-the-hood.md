# v5 implementation notes

## webpack compiler

Does just a simplistic parser of `.tag` files into modules which just do `module.exports = require('organic-oval').define(options)` with the following options:

```js
{
  tagName: String,
  tagLine: String,
  script: function () { /* script content */ }
  template: function () { return this.html`<!-- html content -->` }
}
```
