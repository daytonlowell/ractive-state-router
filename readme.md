Use [Ractive](http://www.ractivejs.org/) with [abstract-state-router](https://github.com/TehShrike/abstract-state-router)!

## Install

npm + your favorite CommonJS bundler is easiest.

```sh
npm install ractive-state-router
```

You can also [download the stand-alone build from bundle.run](https://bundle.run/ractive-state-router@latest).  If you include it in a `<script>` tag, a `ractiveStateRouter` function will be available on the global scope.

## Breaking changes

Version 9 drops support for ASR <= 7. Requires ASR 8 or later.

In version 7, the "active state" decorator changed from taking a string of state name/options to be parsed apart, to taking the state name, options object, and an optional class name.

## Usage

```js
const StateRouter = require('abstract-state-router')
const Ractive = require('ractive')
const makeRactiveStateRenderer = require('ractive-state-router')
const domready = require('domready')

const renderer = makeRactiveStateRenderer(Ractive)

const stateRouter = StateRouter(renderer, 'body')

// add whatever states to the state router

domready(function() {
	stateRouter.evaluateCurrentRoute('login')
})
```

## makeRactiveStateRenderer(Ractive, [ractiveOptions, [options]])

`ractiveOptions` is an object that is passed into [Ractive.extend](http://docs.ractivejs.org/latest/ractive-extend) and takes [Ractive's options](http://docs.ractivejs.org/latest/options).

`options` is an object with one optional property: `deepCopyDataOnSet` (defaults to `false`).  When `true`, the content from the resolve function will be deep copied before being set on the Ractive object, in order to try to maintain the immutability of whatever objects you pass in.

```js
const StateRouter = require('abstract-state-router')
const Ractive = require('ractive')
const RactiveRenderer = require('ractive-state-router')

const renderer = RactiveRenderer(Ractive, {
	data: { hello: 'world' }
})
const stateRouter = StateRouter(renderer, 'body')
```

## In templates

The `active` decorator adds the `active` class to an element if the given state is currently active.  It takes three arguments: a state name (string), an optional parameters object, and a class name to be applied to the element if the state is active (defaults to `'active'`).

The `makePath` function [from the abstract-state-router](https://github.com/TehShrike/abstract-state-router#stateroutermakepathstatename-stateparameters-options) is also exposed.

```html
<li as-active="'app.some-state', { parameter: 'somevalue' }, 'totally-active'">
	<a href="{{ makePath('app.some-state') }}">Some state</a>
</li>
```

## Passing templates to `addState`

When calling the abstract-state-router's addState function, you may provide any of these values as the `template`:

- a Ractive template string
- a parsed Ractive template object
- an object of [Ractive initialization options](http://docs.ractivejs.org/latest/options) to instantiate the Ractive object with.  Should contain a `template` property.
