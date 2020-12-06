---
layout: default
title: Turn off preview and use hover
nav_order: 4
permalink: /get-started/turn-off-preview-use-hover
parent: Get Started
---

# Turn off preview, use dndHover

## Turn off preview

The first thing you can do is to turn off preview. Simply pass option `{noPreview: true}` to `this.dndService.addSource(this, {noPreview: true})`.

## Use dndHover for real-time feedback

Preview has its limitation, it is a static snapshot of source element at the time of starting DnD session. That means the preview would never change during a DnD session.

Instead of using preview, we can turn preview off, and use optional `dndHover(location)` callback on target delegate for real-time feedback.

To demonstrate the purpose, we put a real-time clock on every boxes. You can see it keeps updating the clock during a DnD session.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=c615285d86ccc35f54e8df7f54b36765&open=src%2Fbox.js&open=src%2Fbox.html&open=src%2Fcontainer.js&open=src%2Fcontainer.html"></iframe>

What happened in above code:

For the source `delegate` (box), we turned off preview, removed `show.bind="!draggingMe"`.

> You can bring `draggingMe` back, then use it to control the style of dragging box, for instance to adjust `background-color` or `box-shadow` when dragging.

For the target `delegate` (container),

* in html template, instead of repeat on original items list, we repeat on patched items list, which is the original items patched by intention.
* we capture user intention in `dndHover(location)` callback. Beware, don't mutate the real items list yet. We use temporary property `intention` to save this information.
* we apply the intention in `dndDrop(location)` callback, as app user intended.
* we reset temporary property `intention` before and after a DnD session by subscribing events `'dnd:willStart'` and `'dnd:didEnd'` and `'dnd:didCancel'`.

> When you use `dndHover` to constantly patch original list, depending on how complex the patch is, aurelia repeater might not be able to reuse existing child component, it might destroy old child components and create new components. That will trigger multiple add/remove Source/Target through `attached()` and `detached()` callback. `DndService` is totally fine with dynamical changing of sources and targets.

## Published events through Aurelia Event Aggregator

During a DnD session, `DndService` publishes four events you can subscribe to.

* `dnd:willStart`, just before starting of DnD session, all `isProcessing`, `model`, `isHovering` ... are still `undefined`.
* `dnd:didStart`, just after starting of DnD session, all `isProcessing`, `model`, `isHovering` ... have been set. But none of any targets received `dndHover()` / `dndDrop()` callback.
* `dnd:willEnd`, just before end of a DnD session, all `isProcessing`, `model`, `isHovering` ... are still set. Just before a target (if there is valid one with canDrop:true under the mouse) receives `dndDrop()` callback.
* `dnd:didEnd`, after a DnD session finished. all `isProcessing`, `model`, ... are set to `undefined`. Final `dndDrop()` callback has been fired if there is a valid target.
* `dnd:didCancel` after a DnD session is cancelled by ESC key. all `isProcessing`, `model`, ... are set to `undefined`. No `dndDrop()` callback will be called. None of `dnd:willEnd` and `dnd:didEnd` events will be fired.

You can use them to prepare or clean-up the environment for a DnD session.

> You can subscribe to those events in any component even without a reference of `dndService` instance.

> In the example code above, instead of applying intention in `dndDrop()` callback, you can make empty `dndDrop() {/* no-op */}`, then apply intention in `'dnd:didEnd'` event subscriber before reset intention. The difference is this alternative solution can respond to drop outside of the target element (outside drop would not trigger `dndDrop()`), it can use last known intention when user released mouse button outside of the target element.

Let's move on to [customise preview, optional source handler](./customise-preview-and-source-handler).
