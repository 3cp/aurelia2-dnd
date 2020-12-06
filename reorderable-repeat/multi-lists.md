---
layout: default
title: Reordering across multiple lists
nav_order: 1
permalink: /reorderable-repeat/multi-lists
parent: Get Started - Reorderable Repeat
---

# Reordering across multiple lists

## reorderable-group

By default, `reorderable-repeat` isolates every repeaters to avoid crosstalk. To allow reordering across multiple repeaters, use attribute `reorderable-group="groupName"` to mark those repeaters with same `groupName`.

> Here we demo two lists in one group. But there is no limit on how many lists you can assign to same group.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=d239d878d3cf6d0d18abb99322a3ccfb&open=src%2Fcontainer.html&open=src%2Fcontainer.js"></iframe>

> Since we are moving item across two or more arrays, you need to make sure the view templates for every repeaters in the group can **handle all model shapes**.

> Different from other attributes like `reorderable-direction`, `reorderable-group` can only accept string literal, not a binding. `reorderable-group.bind="group"` would not work. We only support static group name, not dynamic group name.

Too easy? Not yet, there is one big problem. Try move all numbers to letters array, once left side is empty, there is no way to move any item back!

What's going on?

## reorderable-group-for

Different from most DnD libraries, `reorderable-repeat` **doesn't have concept of container**, all DnD events are handled by those repeated views themselves. That's why `reorderable-repeat` is so easy to use.

This simplification created a problem with empty array model. When array is empty, there is no child views to handle DnD events.

To cater the deficit, `reorderable-group-for` custom attribute is introduced to behave similar to a container.

It must be strictly used as:

```html
<some-element reorderable-group-for.bind="arrayModel"> ... </some-element>
```

> `arrayModel` is the same model you used in `reorderable-repeat.for="item of arrayModel"`.

Usually, you use `reorderable-group-for` on some parent element of the repeater. It behaves like an extra DnD target for that repeater. It also effectively enlarge the responsive area.

Now even empty array have some DOM to receive DnD events.

<iframe style="width: 100%; height: 420px; border: 2px solid #343a40; border-radius: 3px;" loading="lazy" src="https://gist.dumber.app/?gist=00567d4a038f06f7e5ac87e3662287aa&open=src%2Fcontainer.html&open=src%2Fcontainer.js"></iframe>

> It's not required to use `reorderable-group-for` on parent element of the repeater. You can use on any DOM element, it will find the corresponding repeater automatically.

> `reorderable-group-for` is named after `<label for="field">`. You can think it behaves like a `label` (`reorderable-group-for`) to an `input` (`reorderable-repeater` with group). `label` can be parent element of `input` or sibling element of `input`, when you click the `label` (hover the `reorderable-group-for`), it behaves like you clicked the `input` (hover child views of `reorderable-repeater`).

### Callback after reordering

The optional attribute `reorderable-after-reordering` provides little more information to the callback.

> When using the string form with method name, that method will receive 2 arguments: 1) the array model that has been reordered, 2) the change `{item, fromIndex, toIndexm, removedFromThisList, insertedToThisList }`.

When moving an item across 2 lists, both source list and target list can receive a after reordering callback. The callback on source list will see `removedFromThisList: true`, the callback on target list will see `insertedToThisList: true`.

The example above shows the usage of `reorderable-after-reordering` in multiple lists mode.

That concludes all features of `aurelia2-reorderable-repeat`.
