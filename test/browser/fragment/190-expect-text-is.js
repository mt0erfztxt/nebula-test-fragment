import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 190 #expectTextIs()`
  .page(appRootPath.path + '/test/fixtures/fragment/190-expect-text-is.html');

class Foo extends Fragment {}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

test("010 It should delegate to `#expectExistsAndConformsRequirements`", async () => {
  const foo = new Foo();
  const spy = sinon.spy(foo, 'expectExistsAndConformsRequirements');
  await foo.expectTextIs('Foo');
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { text: ['Foo', void(0)] },
      { selector: void(0) },
    ]
  });
});

test("020 It should handle 'isNot' option", async () => {
  const foo = new Foo();
  const spy = sinon.spy(foo, 'expectExistsAndConformsRequirements');
  await foo.expectTextIs('Bar', { isNot: true });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { text: ['Bar', true] },
      { selector: void(0) }
    ]
  });
});

test("030 It should handle 'selector' option", async () => {
  const foo = new Foo();
  const spy = sinon.spy(foo, 'expectExistsAndConformsRequirements');
  await foo.expectTextIs('Bar Foo', { selector: '.bar-foo' });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { text: ['Bar Foo', void(0)] },
      { selector: '.bar-foo' }
    ]
  });
});
