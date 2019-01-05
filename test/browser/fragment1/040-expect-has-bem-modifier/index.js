import expect from 'unexpected';

import Fragment from '../../../../src/fragment1';

fixture `Fragment :: 040 #expectHasBemModifier() and #expectHasNoBemModifier()`
  .page(__dirname + '/index.html');

class Foo extends Fragment {}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});
class DisabledBar extends Fragment {}

Object.defineProperties(DisabledBar, {
  bemBase: {
    value: 'bar--disabled'
  },
  displayName: {
    value: 'DisabledBar'
  }
});

test("010 It should throw error when fragment must have specified BEM modifier but it doesn't - case of simple modifier", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasBemModifier(['bar']);
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment must have BEM modifier 'bar' \(foo--bar\) but it doesn't.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when fragment must have specified BEM modifier but it doesn't - case of full modifier", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasBemModifier(['bar1', '2']);
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment must have BEM modifier 'bar1,2' \(foo--bar1_2\) but it doesn't.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment must have specified BEM modifier but it doesn't - case of passing string as modifier name", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasBemModifier('boo');
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment must have BEM modifier 'boo' \(foo--boo\) but it doesn't.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should not throw error when fragment must have specified BEM modifier - case of simple modifier", async () => {
  let isThrown;

  const foo = new Foo();
  await foo.expectIsExist();

  isThrown = false;

  try {
    await foo.expectHasBemModifier(['bar0']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');

  // -- Check case of fragment built on BEM base with modifier

  const disabledBar = new DisabledBar();
  await disabledBar.expectIsExist();

  isThrown = false;

  try {
    await disabledBar.expectHasBemModifier(['param0']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("050 It should not throw error when fragment must have specified BEM modifier - case of full modifier", async () => {
  let isThrown;

  const foo = new Foo();
  await foo.expectIsExist();

  isThrown = false;

  try {
    await foo.expectHasBemModifier(['bar1', '1']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');

  // -- Check case of fragment built on BEM base with modifier.

  const disabledBar = new DisabledBar();
  await disabledBar.expectIsExist();

  isThrown = false;

  try {
    await disabledBar.expectHasBemModifier(['param1', '1']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("060 It should not throw error when fragment must have specified BEM modifier - case of passing string as modifier name", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasBemModifier('bar0');
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("070 It should throw error when fragment must not have specified BEM modifier but it does -case of simple modifier", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasNoBemModifier(['bar0']);
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment must not have BEM modifier 'bar0' \(foo--bar0\) but it does.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("080 It should throw error when fragment must not have specified BEM modifier but it does - case of full modifier", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasNoBemModifier(['bar1', '1']);
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment must not have BEM modifier 'bar1,1' \(foo--bar1_1\) but it does.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("090 It should throw error when fragment must not have specified BEM modifier but it does - case of passing string as modifier name", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasNoBemModifier('bar0');
  }
  catch (e) {
    const msgPattern = /.*'Foo' fragment must not have BEM modifier 'bar0' \(foo--bar0\) but it does.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("100 It should not throw error when fragment must not have specified BEM modifier and it doesn't - case of simple modifier", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasNoBemModifier(['boo']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("110 It should not throw error when fragment must not have specified BEM modifier and it doesn't - case of full modifier", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  let isThrown = false;

  try {
    await foo.expectHasNoBemModifier(['bar1', '2']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("120 It should not throw error when fragment must not have specified BEM modifier and it doesn't - case of passing string as modifier name", async () => {
  let isThrown;

  const foo = new Foo();
  await foo.expectIsExist();

  isThrown = false;

  try {
    await foo.expectHasNoBemModifier('boo');
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');

  // -- Check case of fragment built on BEM base with modifier.

  const disabledBar = new DisabledBar();
  await disabledBar.expectIsExist();

  isThrown = false;

  try {
    await disabledBar.expectHasNoBemModifier(['boo']);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});
