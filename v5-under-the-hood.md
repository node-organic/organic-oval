# v5 implementation notes

## compiling

Optimistic compiling of `.tag` files into modules which define tag file parts into a component using `oval.define` method.

Then a second transform of the `.tag` files is needed via babel/jsx transform plugin to convert any `.tag` template html into `createElement` calls.

## components & rendering

Rendering is based on [preact](https://preactjs.com/). The components within `.tag` files are `preact` Components. There is one major difference though:

> Oval instructs preact to render the custom tags into dom also.

This is made intentionally to be as close to web component standards as possible.
