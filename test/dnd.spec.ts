import { expect, test } from 'vitest';
import $ from 'jquery';
import {EventAggregator} from '@aurelia/kernel';
import {DndService, SourceDelegate, TargetDelegate} from '../src/index';

const doc = document;
const documentElement = doc.documentElement;

const node = doc.createElement('style');
node.innerHTML = `
.test-class {
  display: block;
}
`;
node.type = 'text/css';
doc.head.appendChild(node);

const ea = new EventAggregator();
const dndService = new DndService(ea);

// copied from dragula test/lib/events.js
function fireEvent(el, type, options) {
  const o = options || {};
  const e = document.createEvent('Event');
  e.initEvent(type, true, true);
  Object.keys(o).forEach(apply);
  el.dispatchEvent(e);
  function apply (key) {
    e[key] = o[key];
  }
}

function addBox(label, x, y, width, height) {
  const dom = $('<div style="position:absolute;"></div>');
  dom.text(label);
  dom.css('left', x + 'px');
  dom.css('top', y + 'px');
  dom.css('width', width + 'px');
  dom.css('height', height + 'px');

  dom.appendTo('body');
  return dom.get(0);
}

const model1 = () => ({type: 'one', name: 'model1'});
const model2 = () => ({type: 'two', name: 'model2'});

const box_0_0 = addBox('00', 0, 0, 50, 50);
box_0_0.className = 'test-class'; // make sure .dnd-hide change 'display' to 'none'
const box_0_1 = addBox('01', 0, 50, 50, 50);
const box_0_2 = addBox('02', 0, 100, 50, 50);
const box_0_3 = addBox('03', 0, 150, 50, 50);

const box_0_4 = addBox('04', 0, 200, 50, 50);
const box_0_4_handler = $('<div style="position:absolute;width:10px;height:10px;left:5px;bottom:5px"></div>').get(0);
box_0_4.appendChild(box_0_4_handler);

const box_0_5 = addBox('05', 0, 250, 50, 50);

let box_content_box = $(`
<div style="position:absolute;left:0;top:250px;width:25px;height:25px;margin:10px;padding:5px;border:1px solid black;box-sizing:content-box;"></div>
`);
box_content_box.appendTo('body');
box_content_box =  box_content_box.get(0);

let box_border_box = $(`
<div style="position:absolute;left:50px;top:250px;width:25px;height:25px;margin:10px;padding:5px;border:1px solid black;box-sizing:border-box;"></div>
`);
box_border_box.appendTo('body');
box_border_box =  box_border_box.get(0);


const tbox_big = addBox('tbox_big', 100, 0, 250, 250);
const tbox_small_inner = addBox('tbox_small_inner', 150, 50, 100, 100);
const tbox_big2 = addBox('tbox_big2', 350, 0, 250, 250);
const tbox_small_inner2 = addBox('tbox_small_inner2', 400, 50, 100, 100);

let _track: any[] = [];

function track(tracked) { _track.push(tracked); }
function clearTrack() { _track = []; }

function trackEvent(event) {
  track({event, isProcessing: dndService.isProcessing, model: dndService.model});
}

ea.subscribe('dnd:willStart', () => trackEvent('dnd:willStart'));
ea.subscribe('dnd:didStart', () => trackEvent('dnd:didStart'));
ea.subscribe('dnd:willEnd', () => trackEvent('dnd:willEnd'));
ea.subscribe('dnd:didEnd', () => trackEvent('dnd:didEnd'));
ea.subscribe('dnd:didCancel', () => trackEvent('dnd:didCancel'));

const target1 = {
  dndElement: tbox_big,
  dndCanDrop(model) { return model && model.type === 'one'; },
  dndDrop(location) {
    track({
      event: 'drop on tbox_big',
      location,
    });
  },
  dndHover(location) {
    track({
      event: 'hover on tbox_big',
      location,
    });
  }
} as TargetDelegate;

const target2 = {
  dndCanDrop() { return true; },
  dndDrop(location) {
    track({
      event: 'drop on tbox_small_inner',
      location,
    });
  },
  dndHover(location) {
    track({
      event: 'hover on tbox_small_inner',
      location,
    });
  }
} as TargetDelegate;

const target3 = {
  dndElement: tbox_big2,
  dndCanDrop(model) { return model && model.type === 'two'; },
  dndDrop(location) {
    track({
      event: 'drop on tbox_big2',
      location,
    });
  },
  dndHover(location) {
    track({
      event: 'hover on tbox_big2',
      location,
    });
  }
} as TargetDelegate;

const target4 = {
  dndElement: tbox_small_inner2,
  dndCanDrop(model) { return model && model.type === 'two'; },
  dndDrop(location) {
    track({
      event: 'drop on tbox_small_inner2',
      location,
    });
  },
  dndHover(location) {
    track({
      event: 'hover on tbox_small_inner2',
      location,
    });
  }
} as TargetDelegate;

test('add source', () => {

  expect(() => dndService.addSource(undefined as unknown as SourceDelegate)).toThrow('Missing delegate for dnd source');
  expect(() => dndService.addSource({dndElement: box_0_0} as unknown as SourceDelegate)).toThrow('Missing dndModel() method on dnd source');
  expect(() => dndService.addSource({dndModel: model1})).toThrow('Missing dndElement or options.element');
  expect(() => dndService.addSource({dndModel: model1, dndElement: box_0_0}, {handler: 1 as unknown as Element})).toThrow('specified handler is not a DOM element');

  // normal source
  dndService.addSource({dndModel: model1, dndElement: box_0_0});

  // source with element option and noPreview
  dndService.addSource({dndModel: model1}, {element: box_0_1, noPreview: true});

  // source with customised preview and dndCanDrag
  dndService.addSource({
    dndModel: model2,
    dndElement: box_0_2,
    dndPreview: (model) => {
      const dom = $('<div></div>');
      dom.text(model.name);
      dom.css('width', '25px');
      dom.css('height', '20px');
      return dom.get(0);
    },
    dndCanDrag: () => true
  });

  // source with customised preview, centerPreviewToMousePosition
  dndService.addSource({
    dndModel: model2,
    dndElement: box_0_3,
    dndPreview: () => {
      const dom = $('<div></div>');
      dom.text('+');
      dom.css('width', '10px');
      dom.css('height', '10px');
      return dom.get(0);
    }
  }, {centerPreviewToMousePosition: true, hideCursor: true});

  // source with handler, a dndPreview returns undefined
  dndService.addSource({dndModel: model2, dndElement: box_0_4, dndPreview: () => (undefined as unknown as Element)}, {handler: box_0_4_handler});

  // source with content-box box-sizing
  dndService.addSource({dndModel: model1, dndElement: box_content_box});
  // source with border-box box-sizing
  dndService.addSource({dndModel: model1, dndElement: box_border_box});

  // source with customised dndCanDrag
  dndService.addSource({
    dndModel: model1,
    dndElement: box_0_5,
    dndCanDrag: () => false
  });
});

test('add target', () => {
  expect(() => dndService.addTarget(undefined as unknown as TargetDelegate)).toThrow('Missing delegate for dnd target.');
  expect(() => dndService.addTarget({dndElement: tbox_big} as unknown as TargetDelegate)).toThrow('Missing dndCanDrop() method on delegate.');
  expect(() => dndService.addTarget({dndDrop: () => 1, dndCanDrop: () => true})).toThrow('Missing dndElement or options.element on dnd target delegate.');
  expect(() => dndService.addTarget({dndElement: tbox_big, dndCanDrop: () => true} as unknown as TargetDelegate)).toThrow('Missing dndDrop() method on dnd target delegate.');
  expect(() => dndService.addTarget({dndElement: tbox_big, dndDrop: () => 1} as unknown as TargetDelegate)).toThrow('Missing dndCanDrop() method on delegate.');

  // normal target, can drop type 'one'
  dndService.addTarget(target1);

  // overlapped target with element option, can drop type 'one' and 'two'
  dndService.addTarget(target2, {element: tbox_small_inner});

  // target can drop type 'two'
  dndService.addTarget(target3);
});

test('all targets have empty dnd property', () => {
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toBeFalsy();

  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeFalsy();
  expect(target2.dnd!.model).toBeFalsy();

  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toBeFalsy();
});

test('drag type one, draw preview, drop on nothing', () => {
  const m = {type: 'one', name: 'model1'};

  fireEvent(box_0_0, 'mousedown', {which: 1, clientX: 5, clientY: 10});

  // only mouse down, not yet dnd;
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(_track).toEqual([]);

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 6, clientY: 10});

  // moved mouse, dnd starts
  expect(dndService.isProcessing).toBeTruthy();
  expect(dndService.model).toEqual(m);

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeTruthy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toEqual(m);

  const preview = $('.dnd-preview');
  expect(preview.length).toBe(1);
  expect(preview.css('left')).toBe('0px'); // initial position of preview
  expect(preview.css('top')).toBe('0px');

  expect(_track).toEqual([
    { event: 'dnd:willStart', isProcessing: undefined, model: undefined },
    { event: 'dnd:didStart', isProcessing: true, model: { name: 'model1', type: 'one' } }
  ]);

  clearTrack();

  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 8, clientY: 10});
  expect(preview.css('left')).toBe('2px'); // moved 2px to the right
  expect(preview.css('top')).toBe('0px');

  expect(_track).toEqual([]);

  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 8, clientY: 10});

  expect($('.dnd-preview').length).toBe(0);

  expect(_track).toEqual([
    { event: 'dnd:willEnd', isProcessing: true, model: { name: 'model1', type: 'one' } },
    { event: 'dnd:didEnd', isProcessing: undefined, model: undefined },
  ]);

  clearTrack();
});

test('drag type one, hover over 2 targets, drop on inner target', () => {
  const m = {type: 'one', name: 'model1'};

  fireEvent(box_0_0, 'mousedown', {which: 1, clientX: 5, clientY: 10});
  expect($('body').hasClass('dnd-hide-cursor')).toBeFalsy();

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 6, clientY: 10});
  const preview = $('.dnd-preview');
  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 8, clientY: 10});
  expect(preview.css('left')).toBe('2px'); // moved 2px to the right
  expect(preview.css('top')).toBe('0px');
  expect($('body').hasClass('dnd-hide-cursor')).toBeFalsy();

  clearTrack();

  // hover over tbox_big move 125px to the right, move 5px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 131, clientY: 15});
  expect(preview.css('left')).toBe('125px');
  expect(preview.css('top')).toBe('5px');

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly).toBeTruthy();
  expect(target1.dnd!.isHovering).toBeTruthy();
  expect(target1.dnd!.canDrop).toBeTruthy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toEqual(m);

  expect(_track).toEqual([
    {
      event: 'hover on tbox_big',
      location: {
        mouseEndAt: { x: 131, y: 15 },
        mouseStartAt: { x: 6, y: 10 },
        previewElementRect: { x: 125, y: 5, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 0, width: 50, height: 50 },
        targetElementRect: { x: 100, y: 0, width: 250, height: 250 }
      }
    }
  ]);

  clearTrack();

  // hover over tbox_small_inner move 150px to the right, move 55px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 156, clientY: 65});
  expect(preview.css('left')).toBe('150px');
  expect(preview.css('top')).toBe('55px');

  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeTruthy();

  expect(target2.dnd!.isHoveringShallowly).toBeTruthy ();
  expect(target2.dnd!.isHovering).toBeTruthy();

  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();

  expect(_track).toEqual([
    {
      event: 'hover on tbox_big',
      location: {
        mouseEndAt: { x: 156, y: 65 },
        mouseStartAt: { x: 6, y: 10 },
        previewElementRect: { x: 150, y: 55, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 0, width: 50, height: 50 },
        targetElementRect: { x: 100, y: 0, width: 250, height: 250 }
      }
    },
    {
      event: 'hover on tbox_small_inner',
      location: {
        mouseEndAt: { x: 156, y: 65 },
        mouseStartAt: { x: 6, y: 10 },
        previewElementRect: { x: 150, y: 55, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 0, width: 50, height: 50 },
        targetElementRect: { x: 150, y: 50, width: 100, height: 100 }
      }
    }
  ]);

  clearTrack();

  // drop on tbox_small_inner
  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 156, clientY: 65});

  // finished
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toBeFalsy();

  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeFalsy();
  expect(target2.dnd!.model).toBeFalsy();

  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toBeFalsy();

  expect(_track).toEqual([
    { event: 'dnd:willEnd', isProcessing: true, model: { name: 'model1', type: 'one' } },
    {
      event: 'drop on tbox_small_inner',
      location: {
        mouseEndAt: { x: 156, y: 65 },
        mouseStartAt: { x: 6, y: 10 },
        previewElementRect: { x: 150, y: 55, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 0, width: 50, height: 50 },
        targetElementRect: { x: 150, y: 50, width: 100, height: 100 }
      }
    },
    { event: 'dnd:didEnd', isProcessing: undefined, model: undefined }
  ]);

  clearTrack();
});

test('drag type one with no preview, drop on outer target', () => {
  const m = {type: 'one', name: 'model1'};

  fireEvent(box_0_1, 'mousedown', {which: 1, clientX: 5, clientY: 60});
  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 6, clientY: 60});
  const preview = $('.dnd-preview');
  expect(preview.length).toBe(0);
  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 8, clientY: 60});

  clearTrack();

  // hover over tbox_big move 125px to the right, move 5px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 131, clientY: 65});

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly).toBeTruthy();
  expect(target1.dnd!.isHovering).toBeTruthy();
  expect(target1.dnd!.canDrop).toBeTruthy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toEqual(m);

  expect(_track).toEqual([
    {
      event: 'hover on tbox_big',
      location: {
        mouseEndAt: { x: 131, y: 65 },
        mouseStartAt: { x: 6, y: 60 },
        previewElementRect: { x: 125, y: 55, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 50, width: 50, height: 50 },
        targetElementRect: { x: 100, y: 0, width: 250, height: 250 }
      }
    }
  ]);

  clearTrack();

  // drop on tbox_big
  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 131, clientY: 65});

  // finished
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toBeFalsy();

  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeFalsy();
  expect(target2.dnd!.model).toBeFalsy();

  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toBeFalsy();

  expect(_track).toEqual([
    { event: 'dnd:willEnd', isProcessing: true, model: { name: 'model1', type: 'one' } },
    {
      event: 'drop on tbox_big',
      location: {
        mouseEndAt: { x: 131, y: 65 },
        mouseStartAt: { x: 6, y: 60 },
        previewElementRect: { x: 125, y: 55, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 50, width: 50, height: 50 },
        targetElementRect: { x: 100, y: 0, width: 250, height: 250 }
      }
    },
    { event: 'dnd:didEnd', isProcessing: undefined, model: undefined }
  ]);

  clearTrack();
});

test('drag type two with customised preview, drop on invalid target', () => {
  const m = {type: 'two', name: 'model2'};

  fireEvent(box_0_2, 'mousedown', {which: 1, clientX: 5, clientY: 110});
  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 6, clientY: 110});
  const preview = $('.dnd-preview');
  expect(preview.length).toBe(1);
  expect(preview.css('left'), '0px');
  expect(preview.css('top'), '100px');
  expect(preview.css('width')).toBe('25px'); // customised width, not source element width.
  expect(preview.css('height')).toBe('20px'); // customised height, not source element height.


  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 8, clientY: 110});
  expect(preview.css('left'), '2px');
  expect(preview.css('top'), '100px');

  clearTrack();

  // hover over tbox_big move 125px to the right, move 5px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 131, clientY: 115});

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly, 'no hover on invalid target').toBeFalsy();
  expect(target1.dnd!.isHovering, 'no hover on invalid target').toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeTruthy();
  expect(target3.dnd!.model).toEqual(m);

  expect(_track).toEqual([]);

  clearTrack();

  // drop on tbox_big, invalid target
  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 131, clientY: 115});

  // finished
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toBeFalsy();

  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeFalsy();
  expect(target2.dnd!.model).toBeFalsy();

  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toBeFalsy();

  expect(_track).toEqual([
    { event: 'dnd:willEnd', isProcessing: true, model: { name: 'model2', type: 'two' } },
    { event: 'dnd:didEnd', isProcessing: undefined, model: undefined }
  ]); // no drop recorded

  clearTrack();
});

test('drag type two with customised preview, hideCursor, centerPreviewToMousePosition, dynamicly add new target, drop on target', () => {
  const m = {type: 'two', name: 'model2'};

  fireEvent(box_0_3, 'mousedown', {which: 1, clientX: 10, clientY: 160});

  expect($('body').hasClass('dnd-hide-cursor')).toBeFalsy();
  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 11, clientY: 160});
  const preview = $('.dnd-preview');
  expect(preview.length).toBe(1);
  expect(preview.css('left')).toBe('6px');
  expect(preview.css('top')).toBe('155px');
  expect(preview.css('width')).toBe('10px'); // customised width, not source element width.
  expect(preview.css('height')).toBe('10px'); // customised height, not source element height.

  expect($('body').hasClass('dnd-hide-cursor')).toBeTruthy();

  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 13, clientY: 160});
  expect(preview.css('left'), '8px');
  expect(preview.css('top'), '155px');

  clearTrack();

  //hover over tbox_big2 move 350px to the right, move 5px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 361, clientY: 165});

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeTruthy();
  expect(target3.dnd!.isHovering).toBeTruthy();
  expect(target3.dnd!.canDrop).toBeTruthy();
  expect(target3.dnd!.model).toEqual(m);

  expect(_track).toEqual([
    {
      event: 'hover on tbox_big2',
      location: {
        mouseEndAt: { x: 361, y: 165 },
        mouseStartAt: { x: 11, y: 160 },
        previewElementRect: { x: 356, y: 160, width: 10, height: 10 },
        sourceElementRect: { x: 0, y: 150, width: 50, height: 50 },
        targetElementRect: { x: 350, y: 0, width: 250, height: 250 }
      }
    }
  ]);

  clearTrack();

  dndService.addTarget(target4);
  // new target has dnd inited.
  expect(target4.dnd!.isProcessing).toBeTruthy();
  expect(target4.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target4.dnd!.isHovering).toBeFalsy();
  expect(target4.dnd!.canDrop).toBeTruthy();
  expect(target4.dnd!.model).toEqual(m);

  //drop on tbox_big2
  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 361, clientY: 165});

  // finished
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toBeFalsy();

  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeFalsy();
  expect(target2.dnd!.model).toBeFalsy();

  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toBeFalsy();

  expect(target4.dnd!.isProcessing).toBeFalsy();
  expect(target4.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target4.dnd!.isHovering).toBeFalsy();
  expect(target4.dnd!.canDrop).toBeFalsy();
  expect(target4.dnd!.model).toBeFalsy();

  expect(_track).toEqual([
    { event: 'dnd:willEnd', isProcessing: true, model: { name: 'model2', type: 'two' } },
    {
      event: 'drop on tbox_big2',
      location: {
        mouseEndAt: { x: 361, y: 165 },
        mouseStartAt: { x: 11, y: 160 },
        previewElementRect: { x: 356, y: 160, width: 10, height: 10 },
        sourceElementRect: { x: 0, y: 150, width: 50, height: 50 },
        targetElementRect: { x: 350, y: 0, width: 250, height: 250 }
      }
    },
    { event: 'dnd:didEnd', isProcessing: undefined, model: undefined }
  ]);

  clearTrack();
});

test('drag type two outside of handler has no effect', () => {
  // const m = {type: 'two', name: 'model2'};

  fireEvent(box_0_4, 'mousedown', {which: 1, clientX: 20, clientY: 420});

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 21, clientY: 420});

  // since out of handler, dnd doesn't start
  const preview = $('.dnd-preview');
  expect(preview.length).toBe(0);
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();
});

test('drag type two inside of handler, drop on target', () => {
  const m = {type: 'two', name: 'model2'};

  fireEvent(box_0_4_handler, 'mousedown', {which: 1, clientX: 10, clientY: 240});

  // only mouse down, not yet dnd;
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(_track).toEqual([]);

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 11, clientY: 240});

  // moved mouse, dnd starts
  expect(dndService.isProcessing).toBeTruthy();
  expect(dndService.model).toEqual(m);

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeTruthy();
  expect(target3.dnd!.model).toEqual(m);

  expect(target4.dnd!.isProcessing).toBeTruthy();
  expect(target4.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target4.dnd!.isHovering).toBeFalsy();
  expect(target4.dnd!.canDrop).toBeTruthy();
  expect(target4.dnd!.model).toEqual(m);

  // dndPreview() returns undefined, fall back to default preview.
  const preview = $('.dnd-preview');
  expect(preview.length).toBe(1);
  expect(preview.css('left')).toBe('0px'); // initial position of preview
  expect(preview.css('top')).toBe('200px');
  expect(preview.text()).toBe('04');

  expect(_track).toEqual([
    { event: 'dnd:willStart', isProcessing: undefined, model: undefined },
    { event: 'dnd:didStart', isProcessing: true, model: { name: 'model2', type: 'two' } }
  ]);

  clearTrack();

  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 13, clientY: 240});
  expect(preview.css('left'), '2px'); // moved 2px to the right
  expect(preview.css('top'), '200px');

  expect(_track).toEqual([]);

  // move over target3.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 361, clientY: 240});
  expect(preview.css('left'), '350px'); // moved 350px to the right
  expect(preview.css('top'), '200px');

  expect(target1.dnd!.isProcessing).toBeTruthy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toEqual(m);

  expect(target2.dnd!.isProcessing).toBeTruthy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeTruthy();
  expect(target2.dnd!.model).toEqual(m);

  expect(target3.dnd!.isProcessing).toBeTruthy();
  expect(target3.dnd!.isHoveringShallowly).toBeTruthy();
  expect(target3.dnd!.isHovering).toBeTruthy();
  expect(target3.dnd!.canDrop).toBeTruthy();
  expect(target3.dnd!.model).toEqual(m);

  expect(target4.dnd!.isProcessing).toBeTruthy();
  expect(target4.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target4.dnd!.isHovering).toBeFalsy();
  expect(target4.dnd!.canDrop).toBeTruthy();
  expect(target4.dnd!.model).toEqual(m);

  expect(_track).toEqual([
    {
      event: 'hover on tbox_big2',
      location: {
        mouseEndAt: { x: 361, y: 240 },
        mouseStartAt: { x: 11, y: 240 },
        previewElementRect: { x: 350, y: 200, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 200, width: 50, height: 50 },
        targetElementRect: { x: 350, y: 0, width: 250, height: 250 }
      }
    },
  ]);

  clearTrack();

  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 361, clientY: 240});

  expect($('.dnd-preview').length).toBe(0);

  expect(_track).toEqual([
    { event: 'dnd:willEnd', isProcessing: true, model: { name: 'model2', type: 'two' } },
    {
      event: 'drop on tbox_big2',
      location: {
        mouseEndAt: { x: 361, y: 240 },
        mouseStartAt: { x: 11, y: 240 },
        previewElementRect: { x: 350, y: 200, width: 50, height: 50 },
        sourceElementRect: { x: 0, y: 200, width: 50, height: 50 },
        targetElementRect: { x: 350, y: 0, width: 250, height: 250 }
      }
    },
    { event: 'dnd:didEnd', isProcessing: undefined, model: undefined },
  ]);

  clearTrack();
});

test('preview size is correct no matter what box-sizing is in use', () => {

  // box_content_box
  fireEvent(box_content_box, 'mousedown', {which: 1, clientX: 20, clientY: 270});

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 21, clientY: 270});

  let preview = $('.dnd-preview');
  expect(preview.length).toBe(1);
  let boundingRect = preview.get(0).getBoundingClientRect();
  expect(boundingRect.left).toBe(10);
  expect(boundingRect.top).toBe(260);
  expect(boundingRect.width).toBe(25 + 5 * 2 + 1 * 2);
  expect(boundingRect.height).toBe(25 + 5 * 2 + 1 * 2);

  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 21, clientY: 270});

  // box_border_box
  fireEvent(box_border_box, 'mousedown', {which: 1, clientX: 70, clientY: 270});

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 71, clientY: 270});

  preview = $('.dnd-preview');
  expect(preview.length).toBe(1);
  boundingRect = preview.get(0).getBoundingClientRect();
  expect(boundingRect.left).toBe(60);
  expect(boundingRect.top).toBe(260);
  expect(boundingRect.width).toBe(25);
  expect(boundingRect.height).toBe(25);

  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 71, clientY: 270});
});

test('cannnot drag a source with false canDrag return', () => {
  // box_0_5
  fireEvent(box_0_5, 'mousedown', {which: 1, clientX: 5, clientY: 10});

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 6, clientY: 10});

  expect(dndService.isProcessing).toBeFalsy();

  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 6, clientY: 10});
});

test('drag type one, cancel with esc key', () => {
  // const m = {type: 'one', name: 'model1'};

  fireEvent(box_0_0, 'mousedown', {which: 1, clientX: 5, clientY: 10});
  expect($('body').hasClass('dnd-hide-cursor')).toBeFalsy();

  // first small movement, this is where dnd starts
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 6, clientY: 10});
  const preview = $('.dnd-preview');
  // following movement re-position preview.
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 8, clientY: 10});
  expect(preview.css('left'), '2px'); // moved 2px to the right
  expect(preview.css('top'), '0px');
  expect($('body').hasClass('dnd-hide-cursor')).toBeFalsy();

  clearTrack();

  // Cancel with esc key
  fireEvent(documentElement, 'keydown', {key: 'Escape'});

  // After esc, hover over tbox_big move 125px to the right, move 5px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 131, clientY: 15});
  expect(document.querySelector('.dnd-preview')).toBeFalsy();
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();

  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target1.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target1.dnd!.isHovering).toBeFalsy();
  expect(target1.dnd!.canDrop).toBeFalsy();
  expect(target1.dnd!.model).toBeFalsy();

  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target2.dnd!.isHovering).toBeFalsy();
  expect(target2.dnd!.canDrop).toBeFalsy();
  expect(target2.dnd!.model).toBeFalsy();

  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isHoveringShallowly).toBeFalsy();
  expect(target3.dnd!.isHovering).toBeFalsy();
  expect(target3.dnd!.canDrop).toBeFalsy();
  expect(target3.dnd!.model).toBeFalsy();

  expect(_track).toEqual([
    {event: 'dnd:didCancel', isProcessing: undefined, model: undefined}
  ]);

  // After esc, hover over tbox_small_inner move 150px to the right, move 55px down
  fireEvent(documentElement, 'mousemove', {which: 1, clientX: 156, clientY: 65});
  expect(document.querySelector('.dnd-preview')).toBeFalsy();
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();
  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isProcessing).toBeFalsy();
  expect(_track).toEqual([
    {event: 'dnd:didCancel', isProcessing: undefined, model: undefined}
  ]);

  // After esc, drop on tbox_small_inner
  fireEvent(documentElement, 'mouseup', {which: 1, clientX: 156, clientY: 65});
  expect(dndService.isProcessing).toBeFalsy();
  expect(dndService.model).toBeFalsy();
  expect(target1.dnd!.isProcessing).toBeFalsy();
  expect(target2.dnd!.isProcessing).toBeFalsy();
  expect(target3.dnd!.isProcessing).toBeFalsy();

  expect(_track).toEqual([
    {event: 'dnd:didCancel', isProcessing: undefined, model: undefined}
  ]);
});

test('removeSource, removeTarget', () => {
  expect(dndService.dndSources.length).toBe(8);
  expect(dndService.dndTargets.length).toBe(4);

  dndService.removeSource(box_border_box);
  expect(dndService.dndSources.length).toBe(7);
  expect(dndService.dndTargets.length).toBe(4);

  dndService.removeSource(box_0_0);
  expect(dndService.dndSources.length).toBe(6);
  expect(dndService.dndTargets.length).toBe(4);

  dndService.removeTarget(tbox_small_inner);
  expect(dndService.dndSources.length).toBe(6);
  expect(dndService.dndTargets.length).toBe(3);

  dndService.removeTarget(target1);
  expect(dndService.dndSources.length).toBe(6);
  expect(dndService.dndTargets.length).toBe(2);
});
