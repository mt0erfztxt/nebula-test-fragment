import appRootPath from 'app-root-path';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';
import {Selector} from 'testcafe';

import selector from '../../../src/selector';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `selector :: 040 expectHasClassNames`
  .page(appRootPath.path + '/test/fixtures/selector/030-expect-has-class-names.html');

test("010 It should throw error when `classNames` argument is not a non-blank string or array", async () => {
  let isThrown = false;

  // 1
  try {
    await selector.expectHasClassNames('.a', null);
  }
  catch (e) {
    expect(e.message, 'to equal', "'classNames' argument must be a non-blank string or array but it is #Null (null)");
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 2
  isThrown = false;

  try {
    await selector.expectHasClassNames('.a', '');
  }
  catch (e) {
    expect(e.message, 'to equal', "'classNames' argument must be a non-blank string or array but it is String ()");
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 3
  isThrown = false;

  try {
    await selector.expectHasClassNames('.a', '  ');
  }
  catch (e) {
    expect(e.message, 'to equal', "'classNames' argument must be a non-blank string or array but it is String (  )");
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 4
  isThrown = false;

  try {
    await selector.expectHasClassNames('.a', 101);
  }
  catch (e) {
    expect(e.message, 'to equal', "'classNames' argument must be a non-blank string or array but it is Number (101)");
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when fragment's selector does not return DOM elements", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.non-existent', 'foo');
  }
  catch (e) {
    const msgPattern = /.*Selector must return only one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment's selector return more than one DOM element", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.a', 'a');
  }
  catch (e) {
    const msgPattern = /.*Selector must return only one DOM element but it doesn't: expected 2.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when selector must not have (CSS) class names but it does", async (t) => {
  let isThrown = false;
  const sel = Selector('article');

  await t.expect(sel.exists).ok();

  try {
    await selector.expectHasClassNames(sel, []);
  }
  catch (e) {
    const msgPattern = /.*Selector must not have \(CSS\) class names but it does.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should not throw error when selector must not have (CSS) class names and it doesn't", async (t) => {
  let isThrown = false;
  const sel = Selector('span');

  await t.expect(sel.exists).ok();
  await t.expect(sel.textContent).eql('Nothing special');

  try {
    await selector.expectHasClassNames(sel, []);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("060 It should throw error when `classNames` argument item is not a non-blank string or array", async () => {
  let isThrown = false;

  // 1
  try {
    await selector.expectHasClassNames('.b', [null]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "Item of 'classNames' array argument must be a non-blank string or array but it is #Null (null)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 2
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['']);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "Item of 'classNames' array argument must be a non-blank string or array but it is String ()"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 3
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['  ']);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "Item of 'classNames' array argument must be a non-blank string or array but it is String (  )"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 4
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', [101]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "Item of 'classNames' array argument must be a non-blank string or array but it is Number (101)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("070 It should throw error when `classNames` argument item's first element is not a non-blank string", async () => {
  let isThrown = false;

  // 1
  try {
    await selector.expectHasClassNames('.b', [[null]]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "First element of array item of 'classNames' array argument must be a non-blank string but it is #Null (null)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 2
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', [['']]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "First element of array item of 'classNames' array argument must be a non-blank string but it is String ()"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 3
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', [['  ']]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "First element of array item of 'classNames' array argument must be a non-blank string but it is String (  )"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 4
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', [[101]]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "First element of array item of 'classNames' array argument must be a non-blank string but it is Number (101)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("080 It should throw error when `classNames` argument item's second element is not a nil or boolean", async () => {
  let isThrown = false;

  // 1
  try {
    await selector.expectHasClassNames('.b', [['b', '']]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "Second element of array item of 'classNames' array argument must be a nil or boolean but it is String ()"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 2
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', [['b', 1]]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "Second element of array item of 'classNames' array argument must be a nil or boolean but it is Number (1)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("090 It should throw error when selector must have (CSS) class names but it doesn't", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['bar', 'foo']);
  }
  catch (e) {
    const msgPattern = /.*Selector must have 'foo' \(CSS\) class name but it doesn't.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("100 It should throw error when selector must not have (CSS) class name but it does", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.b', [['bar1', true]]);
  }
  catch (e) {
    const msgPattern = /.*Selector must not have 'bar1' \(CSS\) class name but it does.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("110 It should not throw error when selector must have (CSS) class name and it does", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['bar', 'bar1']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("120 It should not throw error when selector must not have (CSS) class name and it doesn't", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['bar', 'bar0', ['foo', true]]);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("130 It should throw error when selector must have (CSS) class name but it doesn't", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['b', 'bar', 'bar0', 'bar1'], {only: true});
  }
  catch (e) {
    const msgPattern = /.*Selector must have only 'b, bar, bar0, bar1' \(CSS\) class names but it have 'b, bar, bar0, bar1, bar2'.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("140 It should not throw error when selector must have (CSS) class name and it does", async () => {
  let isThrown = false;

  // 1
  try {
    await selector.expectHasClassNames('.b', ['b', 'bar', 'bar0', 'bar1', 'bar2'], {only: true});
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');

  // 2 - (CSS) class names that must not present are excluded from list of
  // (CSS) class names that selector must only have.
  isThrown = false;

  try {
    await selector.expectHasClassNames('.b', ['b', 'bar', 'bar0', 'bar1', 'bar2', ['foo', true]], {only: true});
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("150 It should allow `classNames` argument to be a non-blank string", async () => {
  let isThrown = false;

  try {
    await selector.expectHasClassNames('.b', 'bar');
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});
