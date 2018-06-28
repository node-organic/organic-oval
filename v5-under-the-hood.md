# v5 implementation notes

## webpack compiler

Does just a simplistic parser of `.tag` files into modules which just do `require('organic-oval').define(options)` with the following options values:

```js
{
  tagName: String,
  tagLine: String,
  script: function () { /* script content */ }
  template: function (html) { return html`<!-- html content -->` }
}
```

## html template literal

Based on [`hyperx`](https://github.com/choojs/hyperx) implementation