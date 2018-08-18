import _ from 'lodash';
import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 070 #expectHasSomethings()`
  .page(appRootPath.path + '/test/fixtures/fragment/070-expect-has-somethings.html');

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

  /**
   * Creates new foo fragment.
   *
   * @param {?Object} [spec] Foo fragment specification
   * @param {?Options} [opts] Foo fragment Options
   * @param {Options} [opts.BarFragmentOpts] Opts for `Bar` fragment used in this fragment
   * @param {Object} [opts.BarFragmentSpec] Spec for `Bar` fragment used in this fragment
   */
  constructor(spec, opts) {
    const { initializedOpts, initializedSpec, isInstance } = Foo.initializeFragmentSpecAndOpts(spec, opts);

    if (isInstance === true) {
      return spec;
    }

    super(initializedSpec, initializedOpts);
    return this;
  }

  /**
   * BEM base for 'Bar' fragment used in this fragment.
   *
   * @returns {String}
   */
  get barBemBase() {
    if (!this._barBemBase) {
      this._barBemBase = this.BarFragment.bemBase;
    }

    return this._barBemBase;
  }

  /**
   * TestCafe selector for 'item' fragment used in this fragment.
   *
   * @returns {object} Returns TestCafe selector for 'item' fragment used in this fragment.
   */
  get barSelector() {
    if (!this._barSelector) {
      this._barSelector = this.selector.find(`.${this.barBemBase}`);
    }

    return this._barSelector;
  }

  /**
   * Asserts that count of items in fragment equal value specified in `count`.
   *
   * @param {array|number} count - Fragment must have that number of items to pass assertion. When you need more flexibility than just equality pass an `Array` with TestCafe assertion name (default to 'eql') as first element and expected value for assertion as second, for example, `['gte', 3]`
   * @param {Options} [options] - Options
   * @param {boolean} [options.isNot=false] - When `true` assertion would be negated
   * @return {Promise<void>}
   */
  async expectBarsCountIs(count, options) {
    await Foo.expectSomethingsCountIs(this.barSelector, count, options);
  }

  /**
   * Class of bar fragment used in this fragment.
   *
   * @returns {class}
   * @throws {TypeError} When bar fragment class is not valid.
   */
  get BarFragment() {
    if (!this._BarFragment) {
      this._BarFragment = this.getSomethingFragment('bar', Foo);
    }

    return this._BarFragment;
  }

  /**
   * Returns bar fragment that matches `spec` and `opts`.
   *
   * @param {*} [spec] - See `spec` parameter of `Bar`
   * @param {*} [opts] - See `opts` parameter of `Bar`
   * @returns {Bar}
   */
  getBar(spec, opts) {
    return this.getSomething(
      this.BarFragment,
      _.assign({}, this.opts.BarFragmentSpec, { parent: this.selector }, spec),
      _.assign({}, this.opts.BarFragmentOpts, opts)
    );
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

test("010 It should throw error when 'somethingName' argument is not a non-blank string", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings(42, [
      [{ cid: '42' }]
    ]);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo#expectHasSomethings()': 'somethingName' argument must be a non-blank string but it is Number (42)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when 'expectSomethingsCountIs' option is not valid", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '42' }]
    ], {
      expectSomethingsCountIs: 42
    });
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Options.constructor()': validation failed with error: 'expectSomethingsCountIs' option must be a function or a non-blank string but it is Number (42)"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when 'expectSomethingsCountIs' option is a string but fragment doesn't have corresponding method", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '42' }]
    ], {
      expectSomethingsCountIs: 'expectCustomBarsCountIs',
      only: true
    });
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo' fragment must have 'expectCustomBarsCountIs' method, specified in 'expectSomethingsCountIs' option, but it doesn't"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when no 'expectSomethingsCountIs' option is provided and fragment doesn't have method for assert on number of something fragments", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('buz', [
      [{ cid: '42' }]
    ], {
      only: true
    });
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo' fragment must have 'expectBuzsCountIs' method or 'expectSomethingsCountIs' option set but it doesn't"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It respects 'expectSomethingsCountIs' option - case of function", async () => {
  const foo = new Foo();

  const expectBarsCountIs = function(len) {
    expect(this, 'to be', void(0)); // check that `this` is not bound
  };
  const expectBarsCountIsSpy = sinon.spy(expectBarsCountIs);

  await foo.expectHasSomethings('bar', [
    [{ cid: '1' }],
    [{ cid: '2' }]
  ], {
    expectSomethingsCountIs: expectBarsCountIsSpy,
    only: true
  });

  expect(expectBarsCountIsSpy, 'was called times', 1);
  expect(expectBarsCountIsSpy, 'to have a call satisfying', { args: [2] });
});

test("060 It respects 'expectSomethingsCountIs' option - case of string", async () => {
  const foo = new Foo();

  foo.expectCustomBarsCountIs = (function(len) {
    expect(this, 'to be', foo); // check that `this` is bound because it's a case of foo's method call
  }).bind(foo);

  const expectCustomBarsCountIsSpy = sinon.spy(foo, 'expectCustomBarsCountIs');

  await foo.expectHasSomethings('bar', [
    [{ cid: '1' }],
    [{ cid: '2' }]
  ], {
    expectSomethingsCountIs: 'expectCustomBarsCountIs',
    only: true
  });

  expect(expectCustomBarsCountIsSpy, 'was called times', 1);
  expect(expectCustomBarsCountIsSpy, 'to have a call satisfying', { args: [2] });
});

test("070 It respects 'expectSomethingsCountIs' option - case of nil (default)", async () => {
  const foo = new Foo();
  const expectBarsCountIsSpy = sinon.spy(foo, 'expectBarsCountIs');

  await foo.expectIsExist();

  await foo.expectHasSomethings('bar', [
    [{ cid: '0' }],
    [{ cid: '1' }],
    [{ cid: '2' }]
  ], {
    only: true
  });

  expect(expectBarsCountIsSpy, 'was called times', 1);
  expect(expectBarsCountIsSpy, 'to have a call satisfying', { args: [3] });
});

test("080 It should throw error when fragment doesn't have specified fragments", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '0' }],
      [{ cid: '42' }]
    ]);
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'Bar' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("090 It should not throw error when fragment does have specified fragments", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '0' }],
      [{ cid: '1' }]
    ]);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("100 It should respect `options.only` argument (failing case)", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '0' }],
      [{ cid: '1' }]
    ], { only: true });
  }
  catch (e) {
    const msgPattern = /.*expected 3 to deeply equal 2.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("110 It should respect `options.only` argument (successful case)", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '0' }],
      [{ cid: '2' }],
      [{ cid: '1' }]
    ], { only: true });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("120 It should respect `options.sameOrder` argument (failing case)", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings(
      'bar', [
        [{ cid: '2' }],
        [{ cid: '1' }],
        [{ cid: '0' }]
      ], { only: true, sameOrder: true }
    );
  }
  catch (e) {
    const msgPattern = /.*expected 'Bar 2' to deeply equal 'Bar 0'.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("130 It should respect `options.sameOrder` argument (successful case)", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings(
      'bar', [
        [{ cid: '0' }],
        [{ cid: '1' }],
        [{ cid: '2' }]
      ], { only: true, sameOrder: true }
    );
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("140 It should return specified somethings", async (t) => {
  const foo = new Foo();

  const bars = await foo.expectHasSomethings(
    'bar', [
      [{ cid: '0' }],
      [{ cid: '2' }]
    ]
  );

  expect(bars, 'to have length', 2);
  expect(bars[0], 'to be a', Bar);
  expect(bars[1], 'to be a', Bar);
  await t.expect(bars[0].selector.textContent).eql('Bar 0');
  await t.expect(bars[1].selector.textContent).eql('Bar 2');
});
