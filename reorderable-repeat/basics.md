---
layout: default
title: Basics
nav_order: 1
permalink: /reorderable-repeat/basics
parent: Get Started - Reorderable Repeat
---

# aurelia2-reorderable-repeat basics

In the html template, simply use `reorderable-repeat.for` in the place of normal `repeat.for`. That's it!

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=ad6f9292c4778d3fa30a450db2319ac0&open=src%2Flist-container.html&open=src%2Flist-container2.html"></iframe>

### Customise item style under drag

If you have not read [get-started](../get-started) for `aurelia2-dnd`, we recommend you to read it through. If you have not, here are some key information:

* when you drag a item, the "image" floating with you mouse is called `preview`, it's a DOM element (`aurelia2-dnd` cloned from the source element) lives outside of Aurelia's control.

* `aurelia2-reorderable-repeat` hides the algorithm showing in example [reorder-list](../examples/reorder-list).

* the original source element (which you started dragging) is still there. `aurelia2-reorderable-repeat` just added a css class `reorderable-repeat-dragging-me` to the element.

> The style defined in class `reorderable-repeat-dragging-me` is just hiding the source element without affecting layout.

```css
.reorderable-repeat-dragging-me {
  visibility: hidden;
}
```

To customise the DOM under drag, you can overwrite `.reorderable-repeat-dragging-me` in your style sheet, or use `.reorderable-repeat-dragging-me.your-class` to localize the customisation.

> When customising, remember to unset the visibility first `visibility: visible; /* or inherit; */`.

Here is a style customised version of previous example.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=dda294d3671666259ac4022697adc412&open=src%2Flist-container.css"></iframe>

Note in customisation, you need to unset `visibility` first.

> While the item being dragged receives class `.reorderable-repeat-dragging-me`, all items involved in reordering receive additional class `.reorderable-repeat-reordering`. Be default, `.reorderable-repeat-reordering` has no impact on style.

### Use handler to limit where user can start drag

`aurelia2-dnd` supports optional `handler` option on source `delegate` to limit where drag can start. In `aurelia2-reorderable-repeat`, you can pass optional attribute `reorderable-dnd-handler-selector` on the repeated DOM to select a `handler` for undernearth source elements.

> `reorderable-dnd-handler-selector` is used on every source elements with `element.querySelector(...)` to find out the handler.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=62c6241f041c8918b693956178f69211&open=src%2Ftable-container.js&open=src%2Ftable-container.html"></iframe>

### Customise Preview

`aurelia2-reorderable-repeat` does not hide `aurelia2-dnd`'s limitation on drawing preview.

> To understand this topic, please go through full `aurelia2-dnd` [get-started](../get-started).

There are two situations you want to use customised preview.

1. when the built-in preview drawer doesn't draw preview to your expectation, either due to css limitation or DOM hierarchy limitation.
2. when you want a totally different preview, for instance, customise "cursor" during DnD session.

To draw a customised preview, use optional attribute `reorderable-dnd-preview`. The attribute supports 2 forms:

* `reorderable-dnd-preview="methodName"` the string passed in is a method name on your component. The method will receive the current item (model, not DOM) been dragged, it needs to return a DOM element (unattached to DOM tree) with reasonable size.

* `reorderable-dnd-preview.call="methodInScope(smthInScope, smth2InScope)"` the evaluated result of the function call must be a DOM element (unattached to DOM tree) with reasonable size.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=8784f59137d97050c49257c58eab5bdf&open=src%2Ftable-container.js&open=src%2Ftable-container.html"></iframe>

Here we use `reorderable-dnd-preview="drawPreview"`, you can also use `reorderable-dnd-preview.call="drawPreview(item)"`

### Callback after reordering

Use optional attribute `reorderable-after-reordering` to specify a callback. Like `reorderable-dnd-preview`, it supports 2 forms.

> When using the string form with method name, that method will receive 2 arguments: 1) the array model that has been reordered, 2) the change `{item, fromIndex, toIndex}`. `item` is the model object that has been moved.

> The change object also contains `{removedFromThisList: true, insertedToThisList: true}`. The two properties are designed for multiple lists mode, see [next page](./multi-lists) for more details.

The example above shows the usage of `reorderable-after-reordering`, it prints the list in browser console after reordering.

### Direction of DOM flow

By default, `aurelia2-reorderable-repeat` thinks your DOM list flows from top to bottom.

If your DOM list flows rather from left to right (or from right to left), you can pass attribute `reorderable-direction="right"` (for flow from left to right) or `reorderable-direction="left"` (for flow from right to left).

> The default value of "reorderable-direction" is "down", means flow from top to bottom.

> We support `reorderable-direction="up"` (for flow from bottom to top). You can achieve this unusual layout with `flex-direction: column-reverse;`.

> Even in layout with `flex-wrap: wrap;`, `reorderable-repeat` still works fine.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=dec3f4f6a53ec51947365dc3e2ace1dd&open=src%2Fcontainer.html"></iframe>

Let's move on to [reordering across multiple lists](./multi-lists).

