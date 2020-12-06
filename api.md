---
layout: default
title: APIs
nav_order: 4
permalink: /api
---

# APIs

`DndService` is the single class provided in `aurelia2-dnd`. Technically, it can work with any front-end framework.

### DndService Constructor

You don't need to use constructor in Aurelia app, Aurelia DI (dependency injection) handles creation of shared singleton instance for you.

> in Aurelia app, use dependency injection to create shared singleton instance.

> in other kind of apps, create a shared instance for the whole app to share.

If you use aurelia2-dnd not in an Aurelia app, you can create an instance manually, like

```js
const dndService = new DndService();
```

That's an instance without Aurelia Event Aggregator support. Events `'dnd:willStart'`, `'dnd:didStart'`, `'dnd:willEnd'`, `'dnd:didEnd'`, `'dnd:didCancel'` would not fire.

You can also create an instance with Aurelia Event Aggregator support. Use that `sharedEa` to subscribe to events.

```js
import {EventAggregator} from 'aurelia';
const sharedEa = new EventAggregator();
const dndService = new DndService(sharedEa)
```

## Published events through Aurelia Event Aggregator
* `dnd:willStart` just before starting of DnD session, all `isProcessing`, `model`, `isHovering` ... are still `undefined`.
* `dnd:didStart` just after starting of DnD session, all `isProcessing`, `model`, `isHovering` ... have been set. But none of any targets received `dndHover()` / `dndDrop()` callback.
* `dnd:willEnd` just before end of a DnD session, all `isProcessing`, `model`, `isHovering` ... are still set. Just before a target (if there is valid one with canDrop:true under the mouse) receives `dndDrop()` callback.
* `dnd:didEnd` after a DnD session finished. all `isProcessing`, `model`, ... are set to `undefined`. Final `dndDrop()` callback has been fired if there is a valid target.
* `dnd:didCancel` after a DnD session is cancelled by ESC key. all `isProcessing`, `model`, ... are set to `undefined`. No `dndDrop()` callback will be called. None of `dnd:willEnd` and `dnd:didEnd` events will be fired.


### dndService.isProcessing
* `true` during a DnD session. `undefined` when not in a DnD session.

### dndService.model
* the `model` object cached from the result of `sourceDelegate.dndModel()`. `undefined` when not in a DnD session.

### dndService.addSource(delegate: SourceDelegate, options: SourceOptions)
* typically called inside Aurelia component's `attached()` callback.

#### Source delegate
TypeScript type `import { SourceDelegate } from 'aurelia2-dnd';`
* if `options.element` is absent, `delegate.dndElement` must be a DOM element, used for source element.
* if `options.element` is present, `delegate.dndElement` is ignored, `options.element` is used as source element.
* `delegate.dndModel()` is mandatory. Called once, when DnD session starts. It needs to return a model describing the meaning of a drag. There is no requirement on the shape of returned model.
* `delegate.dndCanDrag()` is optional. Checked when DnD session starts. If it returns falsy value, the Dnd session would not start from this source delegate. The session could still start from another source delegate whose DOM element is the parent (or ancestor) of this one, aka nested dnd sources.
* `delegate.dndPreview(model)` is optional. Called once, when DnD session starts. It needs to return a newly created DOM element, with reasonable size, and not yet attached to DOM tree. Input `model` is the cached result of `sourceDelegate.dndModel()`. It could also return null or undefined, in that case, `DndService` will fall back to use default preview.
* if `options.noPreview` is true, `delegate.dndPreview(model)` is ignored.

#### Source options (optional)
TypeScript type `import { SourceOptions } from 'aurelia2-dnd';`
* `options.element` manually pass a DOM element as source element, instead of default `delegate.dndElement`.
* `options.handler` a DOM element as drag handler. It should be a decedent of source element. It limits where drag can start, doesn't affect preview.
* `options.noPreview` turn off preview.
* `options.hideCursor` hide cursor during a DnD session.
* `options.centerPreviewToMousePosition` center preview to mouse position. Default preview position is aligned to source element top left corner.

### dndService.addTarget(delegate: TargetDelegate, options: TargetOptions)
* typically called inside Aurelia component's `attached()` callback.

#### Target delegate
TypeScript type `import { TargetDelegate } from 'aurelia2-dnd';`
* if `options.element` is absent, `delegate.dndElement` must be a DOM element, used for target element.
* if `options.element` is present, `delegate.dndElement` is ignored, `options.element` is used as target element.
* `delegate.dndCanDrop(model)`, mandatory. Called once, when DnD session starts. Input `model` is the cached result of `sourceDelegate.dndModel()`.
* `delegate.dndDrop(location)`, mandatory. Called once, when DnD session ends (mouse released) on target element and `delegate.dnd.canDrop` is true.
* `delegate.dndHover(location)`, optional. Called every time mouse moves during a DnD session, when `delegate.dnd.canDrop` is true and either `delegate.dnd.isHovering` or `delegate.dnd.isHoveringShallowly` is true.
* When two (or more) target elements overlap, and both have `delegate.dnd.canDrop` true, `dndHover()` could be called on both target delegates at same time, but `dndDrop()` would be only called on the top target.

#### dnd property on target delegate
TypeScript type `import { TargetDelegateInjectedDnd } from 'aurelia2-dnd';`
* `dnd` property was created for every target delegate by `dndService`.
* `delegate.dnd.isProcessing` exactly same as `dndService.isProcessing`.
* `delegate.dnd.model` exactly same as `dndService.model`.
* `delegate.dnd.canDrop` cached result of `delegate.dndCanDrop(model)`. `undefined` when not in a DnD session.
* `delegate.dnd.isHoveringShallowly` `true` when mouse is hovering directly over target element. `undefined` when not in a DnD session.
* `delegate.dnd.isHovering` `true` when mouse is hovering within target element region. `undefined` when not in a DnD session.

#### Target options (optional)
TypeScript type `import { TargetOptions } from 'aurelia2-dnd';`
* `options.element`, manually pass a DOM element as target element, instead of default `delegate.dndElement`.

#### Location payload for dndHover(location: DndLocation) and dndDrop(location: DndLocation)
TypeScript type `import { DndLocation } from 'aurelia2-dnd';`
* `location.mouseStartAt` drag start mouse location {x, y} (not {left, top}).
* `location.mouseEndAt` drop end mouse location {x, y} for `dndDrop()`, or current mouse location for `dndHover()`.
* `location.sourceElementRect` source element location and size {x, y, width, height}.
* `location.previewElementRect` preview element location and size {x, y, width, height}.
* `location.targetElementRect` target element location and size {x, y, width, height}.

> All `x` and `y`, are page offset (relative to whole HTML body), not client offset (relative to browser current view-port). Page offset is stabler to use than client offset, especially when there is scrolling or browser zooming.

> For convenience, `previewElementRect` always presents. Even if you turn off the preview, it still reports location and size as if you were using default preview.

> `sourceElementRect` is not current location of source element. It is a cached location for the source element when DnD session started.

### dndService.removeSource(delegateOrElement: SourceDelegate | Element) and dndService.removeTarget(delegateOrElement: TargetDelegate | Element)

* typically called inside Aurelia component's `detached()` callback.

