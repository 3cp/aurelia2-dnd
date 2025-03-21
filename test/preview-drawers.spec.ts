import { expect, test } from 'vitest';
import $ from 'jquery';
import {trPreview, liPreview, defaultPreview, unknownTagPreview} from '../src/preview-drawers';

const doc = document;

function buildHtml(domStr) {
  $('body').empty();
  const dom = $(domStr);
  dom.appendTo('body');
}

test('trPreview ignores element not tr tag', () => {
  buildHtml('<p>lorem</p>');
  expect(trPreview(doc.querySelector('p')!)).toBeUndefined();
});
test('trPreview ignores malformed table', () => {
  buildHtml('<tr><td></td></tr>');
  expect(trPreview(doc.querySelector('tr')!)).toBeUndefined();
});

test('trPreview copies table', () => {
  buildHtml(`<table class="t"><tr class="r"><td>1</td><td>two</td><td>3</td></tr></table>`);
  const newTable = trPreview(doc.querySelector('tr')!)!;
  expect(newTable.tagName).toBe('TABLE');
  expect(newTable.style.width).toBe(
          getComputedStyle(doc.querySelector('table')!).width);

  const tds = doc.querySelectorAll('table tr td');
  expect($(newTable).find('td').first().css('width')).toBe(
          getComputedStyle(tds[0]).width);
  expect($(newTable).find('td').first().css('height')).toBe(
          getComputedStyle(tds[0]).height);
  expect($(newTable).find('td:nth-child(2)').css('width')).toBe(
          getComputedStyle(tds[1]).width);
  expect($(newTable).find('td:nth-child(2)').css('height')).toBe(
          getComputedStyle(tds[1]).height);
});

test('liPreview ignores element not li tag', () => {
  buildHtml('<p>lorem</p>');
  expect(liPreview(doc.querySelector('p')!)).toBeUndefined();
});

test('liPreview copies li in ul', () => {
  buildHtml('<ul><li>0</li><li>1</li><li>2</li></ul>');
  const li = doc.querySelectorAll('li')[1];
  const newLiInUl = liPreview(li)!;
  expect(newLiInUl.tagName).toBe('UL');
  expect(newLiInUl.style.width).toBe('auto');
  expect(newLiInUl.style.height).toBe('auto');
  expect(newLiInUl.style.listStyleType).toBe('none');

  expect(newLiInUl.childElementCount).toBe(1);
  const newLi = newLiInUl.children[0] as HTMLElement;
  expect(newLi.innerText).toBe('1');
  expect(newLi.style.width).toBe(getComputedStyle(li).width);
  expect(newLi.style.height).toBe(getComputedStyle(li).height);
  expect(newLi.style.flex).toBe('0 0 auto');
});

test('liPreview copies li in ol', () => {
  buildHtml('<ol><li>0</li><li>1</li><li>2</li></ol>');
  const li = doc.querySelectorAll('li')[1];
  const newLiInOl = liPreview(li)!;
  expect(newLiInOl.tagName).toBe('OL');
  expect(newLiInOl.style.width).toBe('auto');
  expect(newLiInOl.style.height).toBe('auto');
  expect(newLiInOl.style.listStyleType).toBe('none');

  expect(newLiInOl.childElementCount).toBe(1);
  const newLi = newLiInOl.children[0] as HTMLElement;
  expect(newLi.innerText).toBe('1');
  expect(newLi.style.width).toBe(getComputedStyle(li).width);
  expect(newLi.style.height).toBe(getComputedStyle(li).height);
  expect(newLi.style.flex).toBe('0 0 auto');
});

test('defaultPreview clones element', () => {
  buildHtml('<div><p>lorem</p></div>');
  const div = defaultPreview(doc.querySelector('div')!)!;
  expect(div.tagName).toBe('DIV');
  expect(div.childElementCount).toBe(1);
  const newP = div.children[0] as HTMLElement;
  expect(newP.tagName).toBe('P');
  expect(newP.innerText).toBe('lorem');
});

test('unknownTagPreview ignores element with non-zero size', () => {
  buildHtml('<div><p>lorem</p></div>');
  expect(unknownTagPreview(doc.querySelector('div')!)).toBeUndefined();
});

test('unknownTagPreview ignores unknown tag with custom display', () => {
  buildHtml('<xyz style="display:block"><div>lorem</div><div>hello</div></xyz>');
  expect(unknownTagPreview(doc.querySelector('div')!)).toBeUndefined();
});

test('unknownTagPreview ignores unknown tag with custom size', () => {
  buildHtml('<xyz style="width:100%;"><div>lorem</div><div>hello</div></xyz>');
  expect(unknownTagPreview(doc.querySelector('div')!)).toBeUndefined();
});

test('unknownTagPreview clones zero size element, copies children size', () => {
  buildHtml('<xyz><div>lorem</div><div>hello</div></xyz>');
  const xyz = doc.querySelector('xyz')! as HTMLElement;
  const newXyz = unknownTagPreview(xyz)!;
  expect(newXyz.tagName).toBe('XYZ');
  expect(newXyz.childElementCount).toBe(2);
  expect(newXyz.style.width).toBe('');
  expect(newXyz.style.height).toBe('');
});
