---
layout: default
title: Testing
nav_order: 5
permalink: /testing
---

# Testing

## Unit tests without view layer in either NodeJS or browser environment

> This is the cheapest way to test, but doesn't represent the true browser behaviour.

If you do unit tests on pure JS code, mock up `DndService` is easy because of dependency injection.

> We have not yet provided any `DndServiceTest` mock class for you to import in the test code. This is still in the our TODO list.

There is some sample test code in the second example ["move box with dndHover"](./examples/move-box-with-dndHover).

> Mock a DnD session in `container.spec.js`, you can use this mock as a base to test any DnD target.

> No much mock in `box.spec.js`, because the source delegate didn't listen to any session based properties or events. If you need, use the a similar mock like the one in `container.spec.js`.

> No mouse events simulation needed to do unit test, as mouse events are hidden in `DndService`.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=c615285d86ccc35f54e8df7f54b36765&open=test%2Fbox.spec.js&open=test%2Fcontainer.spec.js"></iframe>

## Unit tests with view layer

This is what Aurelia official document demonstrated. When you do DOM based test, you can use the real `DndService` instance. You need to simulate mouse events to drive a DnD session.

Read [aurelia2-dnd](https://github.com/3cp/aurelia2-dnd) and [aurelia2-reorderable-repeat](https://github.com/3cp/aurelia2-reorderable-repeat) test code to see some example on how to simulate a mouse event with enough information for `DndService` to work.

`aurelia2-dnd` listens mouse/touch events at top HTML document level. For most of your mouse event simulation, it doesn't matter what's the `event.target`. But `event.target` does matter for your first mouse event simulation, the `'mousedown'` event that starts a DnD session.

The first `'mousedown'` `event.target` must be your intended source/handler(if defined) element (or its child element), `DndService` needs this information to find a matching DnD source delegate.
