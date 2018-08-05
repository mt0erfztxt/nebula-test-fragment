import _ from 'lodash';
import appRootPath from 'app-root-path';
import expect from 'unexpected';

import Fragment from '../../../src/fragment';

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
   * @param {?object} [spec] - Foo fragment specification
   * @param {?Options} [opts] - Foo fragment Options
   * @param {Options} [opts.BarFragmentOpts] - Opts for `Bar` fragment used in this fragment
   * @param {object} [opts.BarFragmentSpec] - Spec for `Bar` fragment used in this fragment
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

test("010 It should throw error when fragment doesn't have specified fragments", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomethings('bar', [
      [{ cid: '0' }],
      [{ cid: '42' }]
    ]);
  }
  catch (e) {
    const msgPattern = /.*'Bar' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should not throw error when fragment does have specified fragments", async () => {
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

test("030 It should respect `options.only` argument (failing case)", async () => {
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

test("040 It should respect `options.only` argument (successful case)", async () => {
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

test("050 It should respect `options.sameOrder` argument (failing case)", async () => {
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

test("060 It should respect `options.sameOrder` argument (successful case)", async () => {
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

test("070 It should return specified somethings", async (t) => {
    const foo = new Foo();

    const bars = await foo.expectHasSomethings(
        'bar', [
            [{cid: '0'}],
            [{cid: '2'}]
        ]
    );

    expect(bars, 'to have length', 2);
    expect(bars[0], 'to be a', Bar);
    expect(bars[1], 'to be a', Bar);
    await t.expect(bars[0].selector.textContent).eql('Bar 0');
    await t.expect(bars[1].selector.textContent).eql('Bar 2');
});
