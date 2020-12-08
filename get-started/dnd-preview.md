---
layout: default
title: DnD Preview
nav_order: 2
permalink: /get-started/dnd-preview
parent: Get Started
---

# DnD Preview

During a DnD session, the "image" floating with you mouse is called "preview". Before we move on to DnD target, let's have a brief look how the preview was drawn at beginning of a DnD session.

It's important to understand preview in order to understand its limitation.

## How preview was drawn

If using native HTML5 DnD API, the preview would be provided by browser automatically, you have little control of its appearance. Instead of using native API, aurelia2-dnd copied from dragula, manually draws the preview "image" by creating a DOM element.

1. first, it clones the source element to a preview element.
2. add css class "dnd-preview" to the preview element. Most importantly this class sets `position: absolute !important;` on the preview.
3. get calculated page offset and size of the source element, apply them to preview's `left,top,width,height` styles. So that preview will appear at the exact same location of source element.
4. append preview element directly to HTML body. This imposes limitation on css.

The default dnd-preview css class.

```css
.dnd-preview {
  position: absolute !important;
  margin: 0 !important;
  z-index: 9999 !important;
  opacity: 0.8;
  box-shadow: 0 0 16px gray;
}
```

> To be clear, preview element lives outside of Aurelia. It's a static snapshot of source element.

## CSS limitation

Because preview is directly under HTML body, you need to make sure source element's css class works directly under HTML body.

If the source element's css is like `.example-container .example-box {...}`, the preview with class `.example-box` would not look right when `.example-container` is absent. If re-factoring your css to fit `aurelia2-dnd` is too much work, you can also [customize preview](./customise-preview-and-source-handler).

> `aurelia2-dnd` style sheet (for `.dnd-preview` class and few others) was injected to the very top of HTML head, before your style sheets. You can overwrite them in your style sheet, for instance, overwrite the `opacity` and `box-shadow` on `.dnd-preview`. You can also apply special style to one type of your preview with `.dnd-preview.example-box {...}`. Comparing to native HTML5 DnD API, there is much better control on aurelia2-dnd's preview.

## Hierarchy limitation

You may wonder how would preview on `<tr>` ever work, as a cloned `<tr>`would not work out of a table.

> You are correct. But `aurelia2-dnd` provided a remedy.

aurelia2-dnd ships with some default special preview drawers for `<tr>` and `<li>` elements. It copies their `<table>`/`<ul>`/`<ol>` wrapper and make some adjustment on width and height. You rarely need to go down to [customize preview](./customise-preview-and-source-handler) to deal with `<tr>` preview.

Let's move on to [DnD Target](./dnd-target).
