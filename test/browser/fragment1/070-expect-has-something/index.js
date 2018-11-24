import _ from 'lodash';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment1';
import Options from '../../../../src/options';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 070 #expectHasSomething()`
  .page(__dirname + '/index.html');

class Bar extends Fragment {}

Object.defineProperties(Bar, {
  bemBase: {
    value: 'bar'
  },
  displayName: {
    value: 'Bar'
  }
});

class Foo extends Fragment {

  get BarFragment() {
    if (!this._BarFragment) {
      this._BarFragment = this.getSomethingFragment('bar', Foo);
    }

    return this._BarFragment;
  }

  getBar(locator, options) {
    return this.getSomething('bar', locator, options);
  }
}

Object.defineProperties(Foo, {
  BarFragment: {
    value: Bar
  },
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

test("005 It should throw error when 'somethingName' argument is not a non-blank string", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething(42, [{ cid: '42' }], null);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo#expectHasSomething()': 'somethingName' argument must be a non-blank string but it is Number (42)"
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("010 It should throw error when 'getSomething' option is not set and fragment class doesn't have corresponding getter", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething('Buz', null, null);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo' fragment must have 'getBuz' method or 'getSomething' option set but it doesn't"
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when fragment of something doesn't exist in fragment", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething('Bar', { cid: '42' }, null);
  }
  catch (e) {
    const msgPattern = /.*'Bar' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should not throw error when fragment of something does exist in fragment", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething('Bar', { cid: '1' }, null);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("040 It should throw error when fragment of something does exist in fragment but not at specified index", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething('Bar', { cid: '0' }, null, { idx: 1 });
  }
  catch (e) {
    const msgPattern = /.*expected 'bar 0' to deeply equal 'bar 1'.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should not throw error when fragment of something does exist in fragment at specified index", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething('Bar', { cid: '1' }, null, { idx: 1 });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("060 It should return specified something", async (t) => {
  const foo = new Foo();

  const barCid0 = await foo.expectHasSomething('Bar', { cid: '0' }, null);
  expect(barCid0, 'to be a', Bar);
  await t.expect(barCid0.selector.textContent).eql('bar 0');

  const barCid2Idx2 = await foo.expectHasSomething('Bar', { cid: '2' }, null, { idx: 2 });
  expect(barCid2Idx2, 'to be a', Bar);
  await t.expect(barCid2Idx2.selector.textContent).eql('bar 2');
});

test("070 It should throw error when 'getSomething' option is set but not a function", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.expectHasSomething('Bar', null, null, { getSomething: 42 });
  }
  catch (e) {
    expect(
      e.message,
      'to match',
      /.*'getSomething' option must be a function or a non-blank string but it is Number \(42\)/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("080 It should respect 'getSomething' option - case of function", async (t) => {
  const foo = new Foo();
  const barLocator = {};
  const barOptions = {};

  /**
   * Returns bar fragment with 'cid' set to 2.
   *
   * @param {*} [spec]
   * @param {*} [opts]
   * @returns {Bar}
   */
  const getBarCid2 = function(locator, options) {

    // Check that `this` is not bound.
    expect(this, 'to be', void(0));

    // Check arguments.
    expect(locator, 'to equal', barLocator);
    expect(options, 'to equal', barOptions);

    return foo.getBar({ cid: '2' }, null);
  }

  const getBarCid2Spy = sinon.spy(getBarCid2);

  /**
   * @type {Bar}
   */
  const barCid2 = await foo.expectHasSomething('Bar', barLocator, barOptions, {
    getSomething: getBarCid2Spy
  });

  // Check that `options.getSomething` is really called. For arguments check
  // see `getBarCid2` function.
  expect(getBarCid2Spy, 'was called times', 1);

  // Check that returned bar fragment is expected one. This is no more than
  // 'Just to be sure' check :)
  await t.expect(barCid2.selector.textContent).eql('bar 2')
});

test("090 It should respect 'getSomething' option - case of string", async (t) => {
  const foo = new Foo();
  const barLocator = {};
  const barOptions = {};

  /**
   * Returns bar fragment with 'cid' set to 1.
   *
   * @method
   * @param {*} [spec]
   * @param {*} [opts]
   * @returns {Bar}
   */
  foo.getBarCid1 = (function(spec, opts) {

    // Check that `this` is bound because it's a case of foo's method call.
    expect(this, 'to be', foo);

    // Check arguments.
    expect(spec, 'to equal', barLocator);
    expect(opts, 'to equal', barOptions);

    return foo.getBar({ cid: '1' }, null);
  }).bind(foo);

  const getBarCid1Spy = sinon.spy(foo, 'getBarCid1');

  /**
   * @type {Bar}
   */
  const barCid1 = await foo.expectHasSomething('Bar', barLocator, barOptions, {
    getSomething: 'getBarCid1'
  });

  // Check that method with name passed in `options.getSomething` is really
  // called. For arguments check see `getBarCid1` function.
  expect(getBarCid1Spy, 'was called times', 1);

  // Check that returned bar fragment is expected one. This is no more than
  // 'Just to be sure' check :)
  await t.expect(barCid1.selector.textContent).eql('bar 1')
});

test("100 It should allow to use custom equality logic with 'equalityCheck' option as function", async () => {
  const foo = new Foo();
  const barCid2 = new Bar({ cid: '2' });

  await foo.expectIsExist();
  await barCid2.expectIsExist();

  const equalityCheck = function(thisFragment, thatFragment) {

    // Check that `this` is not bound.
    expect(this, 'to be undefined');

    // -- Check arguments

    expect(thisFragment, 'to be a', Bar);
    expect(thisFragment.locator, 'to equal', { cid: '2' });
    expect(thisFragment.options, 'to be an', Options);
    expect(thisFragment.options, 'to have own properties', {
      parent: foo
    });

    expect(thatFragment, 'to be a', Bar);
    expect(thatFragment.locator, 'to equal', { idx: 2 });
    expect(thatFragment.options, 'to be an', Options);
    expect(thatFragment.options, 'to have own properties', {
      parent: foo
    });
  };

  const equalityCheckSpy = sinon.spy(equalityCheck);

  await foo.expectHasSomething('Bar', { cid: '2' }, null, {
    idx: 2,
    equalityCheck: equalityCheckSpy
  });

  expect(equalityCheckSpy, 'was called times', 1);
});
