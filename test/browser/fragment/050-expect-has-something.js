import _ from 'lodash';
import appRootPath from 'app-root-path';
import expect from 'unexpected';

import Fragment from '../../../src/fragment';

fixture `Fragment :: 050 #expectHasSomething()`
  .page(appRootPath.path + '/test/fixtures/fragment/050-expect-has-something.html');

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

test("010 It should throw error when fragment class doesn't have corresponding getter", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomething('Buz', null, null);
  }
  catch (e) {
    expect(e.message, 'to equal', "'Foo' fragment must have 'getBuz' method but it doesn't");
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when fragment of something doesn't exist in fragment", async () => {
  let isThrown = false;
  const foo = new Foo();

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
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomething('Bar', { cid: '1' }, null);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("040 It should throw error when fragment of something does exist in fragment but not at specified index", async () => {
  let isThrown = false;
  const foo = new Foo();

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
  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.expectHasSomething('Bar', { cid: '1' }, null, { idx: 1 });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});
