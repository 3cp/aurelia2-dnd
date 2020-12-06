---
layout: default
title: Get Started
nav_order: 2
permalink: /get-started
has_children: true
---

# Get Started

```bash
npm i aurelia2-dnd
```

Or
```bash
yarn add aurelia2-dnd
```

## Use inside Aurelia app

There is a single class `DndService` provided by `aurelia2-dnd`. Inject it to your component.

ESNext
```js
import {inject} from 'aurelia';
import {DndService} from 'aurelia2-dnd';

@inject(DndService)
export class YourComponent {
  constructor(dndService) {
    this.dndService = dndService;
  }
}
```

TypeScript
```ts
import {autoinject} from 'aurelia';
import {DndService} from 'aurelia2-dnd';

@autoinject
export class YourComponent {
  constructor(public dndService: DndService) {}
}
```

> Here we rely on default behaviour of Aurelia DI (dependency injection). Aurelia DI creates a singleton `dndService` instance for all components to share.
