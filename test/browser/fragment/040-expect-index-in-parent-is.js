import appRootPath from 'app-root-path';
import expect from 'unexpected';

import {Fragment} from '../../../src';

fixture `Fragment :: 040 #expectIndexInParentIs()`
  .page(appRootPath.path + '/test/fixtures/fragment/040-expect-index-in-parent-is.html');

class Foo extends Fragment {
}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

class Bar extends Fragment {
}

Object.defineProperties(Bar, {
  bemBase: {
    value: 'bar'
  },
  displayName: {
    value: 'Bar'
  }
});

test("010 It should throw error when fragment doesn't exist", async (t) => {
  let isThrown = false;

  const foo = new Foo();
  const bar = new Bar({cid: '42'});
  await t.expect(bar.selector.count).eql(0);

  try {
    await bar.expectIndexInParentIs(foo, 0);
  }
  catch (e) {
    const msgPattern = /.*'Bar' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when fragment in parent under specified index doesn't exist", async (t) => {
  let isThrown = false;

  const foo = new Foo();
  const bar = new Bar({cid: '1'});
  await t.expect(bar.selector.count).eql(1);

  try {
    await bar.expectIndexInParentIs(foo, 42);
  }
  catch (e) {
    const msgPattern = /.*'Bar' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment and fragment in parent under specified index doesn't match", async (t) => {
  let isThrown = false;

  const foo = new Foo();
  const bar = new Bar({cid: '1'});
  await t.expect(bar.selector.count).eql(1);

  try {
    await bar.expectIndexInParentIs(foo, 2);
  }
  catch (e) {
    const msgPattern = /^AssertionError: expected 'bar 1' to deeply equal 'bar 3'$/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should not throw error when fragment and fragment in parent under specified index are matched", async (t) => {
  let isThrown = false;

  const foo = new Foo();
  const bar = new Bar({cid: '1'});
  await t.expect(bar.selector.count).eql(1);

  try {
    await bar.expectIndexInParentIs(foo, 0);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});
