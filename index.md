---
layout: default
title: Home
nav_order: 1
permalink: /
---

# aurelia2-dnd
{: .fs-8 }

A generic drag-and-drop lib mainly for [Aurelia 2](https://docs.aurelia.io), mobile friendly, with APIs fit in MVC/MVVM natively.
{: .fs-6 .fw-300 }

[Get Started](./get-started){: .btn .btn-blue .mr-3 .fs-5 } [View on Github](https://github.com/3cp/aurelia2-dnd){: .btn .fs-5 }

# aurelia2-reorderable-repeat
{: .fs-8 }

Built on top of aurelia2-dnd, a customised Aurelia repeater that supports drag-and-drop reordering automatically.
{: .fs-6 .fw-300 }

[Get Started](./reorderable-repeat){: .btn .btn-blue .mr-3 .fs-5 } [View on Github](https://github.com/3cp/aurelia2-reorderable-repeat){: .btn .fs-5 }

---

## aurelia2-dnd use [dragula](https://bevacqua.github.io/dragula/) algorithm, but is not just a dragula wrapper

aurelia2-dnd use `dragula`'s algorithm to avoid native HTML5 DnD API, but doesn't inherit or expose any `dragula` API (they don't even exist in the code). APIs are designed to fit in MVC/MVVM natively.

### Why based on dragula, not native HTML5 DnD API

[dragula](https://bevacqua.github.io/dragula/) implements DnD in plain mouse/touch events, not in native HTML5 DnD API. [Here](https://www.danyow.net/drag-and-drop-with-aurelia/) is the place where we were introduced to dragula, it has some links for issues around native HTML5 DnD API. It resonated with our experience on React DnD which uses native HTML5 DnD API. We had issues on nested source/target and some annoying browser behaviour (cursor in IE) in native HTML5 DnD API. None of that affected our dragula based DnD.

Another bonus of dragula, it supports mobile devices. All examples here works on iPad and phones.

## Inspired by [react-dnd](http://react-dnd.github.io/react-dnd/)

The API design is heavily inspired by react-dnd. And it is largely simplified thanks for Aurelia's ability to observe plain JavaScript object.

## aurelia2-dnd is not an Aurelia plugin

Technically, `aurelia2-dnd` doesn't depend on Aurelia, it only uses `EventAggregator` (from `@aurelia/kernel`) to provide better integration with Aurelia 2. There is nothing preventing you from using it with other front-end frameworks or even vanilla JavaScript.

## License

`aurelia2-dnd` is licensed under the [MIT license](https://github.com/buttonwoodcx/aurelia2-dnd/blob/master/LICENSE).
