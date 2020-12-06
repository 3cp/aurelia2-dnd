---
layout: default
title: Limitations
nav_order: 3
permalink: /reorderable-repeat/limitations
parent: Get Started - Reorderable Repeat
---

# Limitations

`aurelia2-reorderable-repeat` doesn't support repeat on `template` element.

Following html generates an Aurelia error.
```html
<template reorderable-repeat.for="obj of array">
  <!-- inner html -->
</template>
```

`aurelia2-reorderable-repeat` only supports `Array` model, not `Set`, `Map` or `Object` (Those 3 are supported by standard Aurelia repeater). We are trying to reorder something, only array makes sense here.
