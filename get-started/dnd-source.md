---
layout: default
title: DnD Source
nav_order: 1
permalink: /get-started/dnd-source
parent: Get Started
---

# DnD Source

Influenced by `react-dnd`, we have concept of:

  * __DnD source__, a DOM element that you can drag, plus associated logic.
  * __DnD target__, a DOM element that you can drop onto, plus associated logic.

Since the source and target are bound to DOM element, you need to register and deregister them in the right Aurelia life-cycle callbacks.

> The common practice is to do `addSource`, `addTarget` in `attached()`, and do `removeSource`, `removeTarget` in `detached()`.

Let's implement our first example ["move box"](../examples/move-box) step by step.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=da80d504cf7df57ab326d91e478aac72&open=src%2Fbox.js&open=src%2Fbox.html&open=src%2Fcontainer.js&open=src%2Fcontainer.html"></iframe>

There is a container of three boxes inside. To implement moving box, we register every box as a source (we want to drag), and register the container as the target (receives a drop).

## Implement source

The box component.

```js
export class Box {
  // ...
  attached() {
    this.dndService.addSource(this);
  }

  detached() {
    this.dndService.removeSource(this);
  }
}
```

`dndService.addSource(delegate, options)` takes two arguments.

  * most of the time `delegate` object is the current Aurelia component (`this`).
  * `options` is optional, they alter default behaviour. We will explore options in next few pages.

The first thing that a source `delegate` needs to provide, is a reference to the DOM element we want to drag.

> By default, `DndService` get DOM element from `delegate.dndElement`. The easiest way to set that reference is to use `ref="dndElement"` in your view template.

```html
<template>
  <require from="./box.css"></require>

  <div
    ref="dndElement"
    class="box"
    style.bind="positionCss"
  >
    ${item.name}
  </div>
</template>
```

> When you use `ref="dndElement"` in view template, Aurelia (not `DndService`) creates a property `dndElement` in your component pointing to the DOM element, you can access `this.dndElement` inside your component code.

> Note, `removeSource()` and `removeTarget()` can be called with either `delegate` object or element object. So in here, `this.dndService.removeSource(this.dndElement)` works same as `this.dndService.removeSource(this)`.

Now DOM is hooked up, source `delegate` needs to provide `dndModel()` callback, it should return a model which describes the meaning of the drag.

> When `DndService` detected user started a drag, it asks (only once) the source `delegate` `dndModel()` callback to return a model.

```js
export class Box {
  //...
  dndModel() {
    return {
      type: 'moveItem',
      item: this.item
    };
  }
  //...
}
```

> `DndService` has zero requirement on the shape of the model. Even if you return `undefined`, `DndService` would not complain, although there is no practical usage of returning `undefined`.

> You should make your own convention of the model shape. A common practice is to provide a `type` in the model, which you can easily check against in other parts of your app.

## Here is what we got so far, movable boxes

There is no effect on drop, because we have not registered any DnD target yet.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=095688e86b96435b298125ec5da688dd&open=src%2Fbox.js&open=src%2Fbox.html"></iframe>

Let's move on to understand [DnD Preview](./dnd-preview).

