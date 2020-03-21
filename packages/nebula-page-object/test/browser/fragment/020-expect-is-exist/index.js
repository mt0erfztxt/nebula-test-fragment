import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

class Bar extends Fragment {}

Object.defineProperties(Bar, {
  bemBase: {
    value: 'bar'
  },
  displayName: {
    value: 'Bar'
  }
});

class Foo extends Fragment {}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

class NonExistent extends Fragment {}

Object.defineProperties(NonExistent, {
  bemBase: {
    value: 'non-existent'
  },
  displayName: {
    value: 'NonExistent'
  }
});

fixture(`Fragment :: 020 #expectIsExist() and #expectIsNotExist()`)
  .page(__dirname + '/index.html');

test("010 It should throw error when fragment's selector must not exist but it does", async (t) => {
  const foo = new Foo();
  await t.expect(foo.selector.count).eql(1);

  // -- Check 'isNot' option work

  let isThrown = false;

  try {
    await foo.expectIsExist({ isNot: true });
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'Foo' fragment's selector must not return DOM elements but it does.*/
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should not throw error when fragment's selector must not exist and it doesn't", async (t) => {
  const nonExistent = new NonExistent();
  await t.expect(nonExistent.selector.count).eql(0);

  // -- Check 'isNot' option work

  let isThrown = false;

  try {
    await nonExistent.expectIsExist({ isNot: true });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("030 It should throw when fragment's selector must exist but is doesn't - case when 'allowMultiple' option is truthy", async (t) => {
  const nonExistent = new NonExistent();
  await t.expect(nonExistent.selector.count).eql(0);

  let isThrown = false;

  try {
    await nonExistent.expectIsExist({
      allowMultiple: true,
      isNot: false
    });
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'NonExistent' fragment's selector must return one or more DOM elements but it doesn't.*/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw when fragment's selector must exist but it doesn't - case when 'allowMultiple' option is falsey", async (t) => {
  const nonExistent = new NonExistent();
  await t.expect(nonExistent.selector.count).eql(0);

  let isThrown = false;

  try {
    await nonExistent.expectIsExist({
      allowMultiple: false,
      isNot: false
    });
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'NonExistent' fragment's selector must return exactly one DOM element but it doesn't.*/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should throw when fragment's selector does exist and returns multiple DOM elements but 'allowMultiple' option is falsey", async (t) => {
  const bar = new Bar();
  await t.expect(bar.selector.count).eql(2);

  let isThrown = false;

  try {
    await bar.expectIsExist({ allowMultiple: false });
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'Bar' fragment's selector must return exactly one DOM element but it doesn't.*2.*/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("060 It should not throw when fragment's selector must exist and it does", async () => {
  await new Foo().expectIsExist();
  await new Foo().expectIsExist({ allowMultiple: true });
  await new Bar().expectIsExist({ allowMultiple: true });
});

test("070 It should allow to set custom message for error using 'message' option", async (t) => {
  const nonExistent = new NonExistent();
  await t.expect(nonExistent.selector.count).eql(0);

  let isThrown = false;

  try {
    await nonExistent.expectIsExist({ message: 'Custom error message' });
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*Custom error message.*/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("080 It should have complementary method named `expectIsNotExist", async () => {
  const nonExistent = new NonExistent();
  const expectIsExistSpy1 = sinon.spy(nonExistent, 'expectIsExist');
  await nonExistent.expectIsNotExist();
  expect(expectIsExistSpy1, 'was called times', 1);
  expect(expectIsExistSpy1, 'to have a call satisfying', {
    args: [{
      allowMultiple: false,
      isNot: true
    }]
  });

  const bar = new Bar();
  const expectIsExistSpy2 = sinon.spy(bar, 'expectIsExist');
  await bar.expectIsNotExist({ allowMultiple: true, isNot: true });
  expect(expectIsExistSpy2, 'was called times', 1);
  expect(expectIsExistSpy2, 'to have a call satisfying', {
    args: [{
      allowMultiple: true,
      isNot: false
    }]
  });
});
