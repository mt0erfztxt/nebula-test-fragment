import expect from 'unexpected';
import { Selector } from 'testcafe';

import Fragment from '../../../../src/fragment1';

class Foo extends Fragment {}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

fixture('Fragment :: 100 #expectExistsAndConformsRequirements()')
  .page(__dirname + '/index.html');

test("010 It should throw error when fragment's selector return number of DOM elements other than one", async (t) => {
  const foo = new Foo({ cid: 'non-existent' });
  await t.expect(foo.selector.count).eql(0);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements();
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should only assert that fragment's selector return exactly one DOM element when 'requirements' argument is nil", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements();
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("030 It should throw error when 'requirements' argument is not a plain object", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements('foo');
  }
  catch (e) {
    expect(e.message, 'to equal', "'requirements' argument must be a nil or a plain object but it is String (foo)");
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should allow to assert that fragment's selector have simple attribute - case when simple attribute exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-checked']
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("050 It should allow to assert that fragment's selector have no simple attribute - case when simple attribute exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-checked', null, true]
      ]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: Expected 'Foo' fragment's selector to not return DOM element with attribute " +
      "'data-checked': expected 0 to deeply equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("060 It should allow to assert that fragment's selector have simple attribute - case when simple attribute not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-active']
      ]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: Expected 'Foo' fragment's selector to return DOM element with attribute " +
      "'data-active': expected 0 to deeply equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("070 It should allow to assert that fragment's selector have no simple attribute - case when simple attribute not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-active', null, true]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("080 It should allow to assert that fragment's selector have composite attribute - case when composite attribute exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-id', 42]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("090 It should allow to assert that fragment's selector have no composite attribute - case when composite attribute exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-id', '42', true]
      ]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: Expected 'Foo' fragment's selector to not return DOM element with attribute " +
      "'data-id' valued '42': expected 0 to deeply equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("100 It should allow to assert that fragment's selector have composite attribute - case when composite attribute not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-id', 43]
      ]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: Expected 'Foo' fragment's selector to return DOM element with attribute " +
      "'data-id' valued '43': expected 0 to deeply equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("110 It should allow to assert that fragment's selector have no composite attribute - case when composite attribute not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-id', 43, true]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("120 It should allow to assert that fragment's selector have set of attributes - case when attribute exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-checked'],
        ['data-id', 42]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("130 It should allow to assert that fragment's selector have set of attributes - case when attribute not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-checked'],
        ['data-id', 43]
      ]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: Expected 'Foo' fragment's selector to return DOM element with attribute " +
      "'data-id' valued '43': expected 0 to deeply equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("140 It should allow to assert that fragment's selector have no set of attributes - case when attribute exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-checked'],
        ['data-id', 42, true]
      ]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: Expected 'Foo' fragment's selector to not return DOM element with attribute " +
      "'data-id' valued '42': expected 0 to deeply equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("150 It should allow to assert that fragment's selector have no set of attributes - case when attribute not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ['data-checked'],
        ['data-id', 43, true]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("160 It should allow simple attribute to be passed in as string", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ attributes: ['data-checked'] });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("170 It should allow to assert that fragment's selector have simple BEM modifier - case when simple BEM modifier exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['checked']
        ]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("180 It should allow to assert that fragment's selector have no simple BEM modifier - case when simple BEM modifier exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['checked', null], true
        ]
      ]
    });
  }
  catch (e) {
    const errMsgPattern = /.*'Foo' fragment must not have BEM modifier 'checked,' \(foo--checked\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("190 It should allow to assert that fragment's selector have simple BEM modifier - case when simple BEM modifier not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['active']
        ]
      ]
    });
  }
  catch (e) {
    const errMsgPattern = /.*'Foo' fragment must have BEM modifier 'active' \(foo--active\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("200 It should allow to assert that fragment's selector have no simple BEM modifier - case when simple BEM modifier not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['active', null], true
        ]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("210 It should allow to assert that fragment's selector have composite BEM modifier - case when composite BEM modifier exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['id', '42']
        ]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("220 It should allow to assert that fragment's selector have no composite BEM modifier - case when composite BEM modifier exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['id', '42'], true
        ]
      ]
    });
  }
  catch (e) {
    const errMsgPattern = /.*'Foo' fragment must not have BEM modifier 'id,42' \(foo--id_42\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("230 It should allow to assert that fragment's selector have composite BEM modifier - case when composite BEM modifier not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['id', '43']
        ]
      ]
    });
  }
  catch (e) {
    const errMsgPattern = /.*'Foo' fragment must have BEM modifier 'id,43' \(foo--id_43\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("240 It should allow to assert that fragment's selector have no composite BEM modifier - case when composite BEM modifier not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['data-id', '43'], true
        ]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("250 It should allow to assert that fragment's selector have set of BEM modifiers - case when BEM modifier exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['checked']
        ],
        [
          ['id', '42']
        ]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("260 It should allow to assert that fragment's selector have set of BEM modifiers - case when BEM modifier not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['checked']
        ],
        [
          ['id', '43']
        ]
      ]
    });
  }
  catch (e) {
    const errMsgPattern = /.*'Foo' fragment must have BEM modifier 'id,43' \(foo--id_43\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("270 It should allow to assert that fragment's selector have not set of BEM modifiers - case when BEM modifier exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['checked']
        ],
        [
          ['id', '42'], true
        ]
      ]
    });
  }
  catch (e) {
    const errMsgPattern = /.*'Foo' fragment must not have BEM modifier 'id,42' \(foo--id_42\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("280 It should allow to assert that fragment's selector have not set of BEM modifiers - case when BEM modifier not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        [
          ['checked']
        ],
        [
          ['id', '43'], true
        ]
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("290 It should allow simple BEM modifier to be passed in as string", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        ['checked']
      ]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("300 It should throw error when 'requirements.tagName' argument is not a nil and is not a non-blank string", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ tagName: 42 });
  }
  catch (e) {
    const message = "'requirements.tagName' argument must be a nil or a non-blank string but it is Number (42)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("310 It should allow to assert that fragment's selector tag matches specified - case when not matches", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ tagName: 'div' });
  }
  catch (e) {
    const errMsgPattern = /.*'button' to deeply equal 'div'.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("320 It should allow to assert that fragment's selector tag matches specified - case when matches", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ tagName: 'button' });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("330 It should allow to assert that fragment's selector have specified text - case when equal and text exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ text: 'Button 0' });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("340 It should allow to assert that fragment's selector have specified text - case when not equal and text exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      text: ['Button 0', true]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: 'Foo' fragment's selector text must not match /^Button 0$/: expected 1 to deeply " +
      "equal 0";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("350 It should allow to assert that fragment's selector have specified text - case when equal and text not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ text: ['Button 42'] });
  }
  catch (e) {
    const errMsg =
      "AssertionError: 'Foo' fragment's selector text must match /^Button 42$/: expected 0 to deeply " +
      "equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("360 It should allow to assert that fragment's selector have no specified text - case when not equal and text not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      text: ['Button 42', true]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("370 It should allow to assert that fragment's selector have specified text - case when match and text exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ text: [/\w{4}on \d/] });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("380 It should allow to assert that fragment's selector have specified text - case when not match and text exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      text: [/\w{4}on \d/, true]
    });
  }
  catch (e) {
    const errMsg =
      "AssertionError: 'Foo' fragment's selector text must not match /\\w{4}on \\d/: expected 1 to deeply " +
      "equal 0";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("390 It should allow to assert that fragment's selector have specified text - case when match and text not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ text: [/.utton 42/] });
  }
  catch (e) {
    const errMsg =
      "AssertionError: 'Foo' fragment's selector text must match /.utton 42/: expected 0 to deeply " +
      "equal 1";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("400 It should allow to assert that fragment's selector have no specified text - case when not match and text not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      text: [/.utton 42/, true]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("405 It should allow text to be a string", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ text: 'Button 0' });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("406 It should allow text to be a regular expression", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ text: /.utton 0/ });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("410 It should allow to assert that fragment's selector have specified text content - case when equal and text content exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ textContent: 'Button 0' });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("420 It should allow to assert that fragment's selector have specified text content - case when not equal and text content exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: ['Button 0', true]
    });
  }
  catch (e) {
    const errMsg = "AssertionError: expected 'Button 0' to not deeply equal 'Button 0'";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("430 It should allow to assert that fragment's selector have specified text content - case when equal and text content not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: ['Button 42']
    });
  }
  catch (e) {
    const errMsg = "AssertionError: expected 'Button 0' to deeply equal 'Button 42'";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("440 It should allow to assert that fragment's selector have no specified text content - case when not equal and text content not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: ['Button 42', true]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("450 It should allow to assert that fragment's selector have specified text content - case when match and text content exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: [/\w{4}on \d/]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("460 It should allow to assert that fragment's selector have specified text content - case when not match and text content exists", async (t) => {
  const foo = new Foo();

  let isThrown = false;
  await t.expect(foo.selector.count).eql(1);

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: [/\w{4}on \d/, true]
    });
  }
  catch (e) {
    const errMsg = "AssertionError: expected 'Button 0' not to match /\\w{4}on \\d/";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("470 It should allow to assert that fragment's selector have specified text content - case when match and text content not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: [/.utton 42/]
    });
  }
  catch (e) {
    const errMsg = "AssertionError: expected 'Button 0' to match /.utton 42/";
    expect(e.errMsg, 'to equal', errMsg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("480 It should allow to assert that fragment's selector have no specified text content - case when not match and text content not exists", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: [/.utton 42/, true]
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("481 It should allow text content to be a string", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({
      textContent: 'Button 0'
    });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("482 It should allow text content to be a regular expression", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  let isThrown = false;

  try {
    await foo.expectExistsAndConformsRequirements({ textContent: /.utton 0/ });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("490 It should handle 'selector' option", async (t) => {
  class Bar extends Fragment {}

  Object.defineProperties(Bar, {
    bemBase: {
      value: 'bar'
    },
    displayName: {
      value: 'Bar'
    }
  });

  const bar = new Bar();
  await t.expect(Selector('.selector-option').count).eql(1);
  await bar.expectExistsAndConformsRequirements({ text: 'Selector Option' }, {
    selector: '.selector-option'
  });
});
