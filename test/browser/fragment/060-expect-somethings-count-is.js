import appRootPath from 'app-root-path';
import expect from 'unexpected';

import Fragment from '../../../src/fragment';

fixture `Fragment :: 060 .expectSomethingsCountIs()`
  .page(appRootPath.path + '/test/fixtures/fragment/060-expect-somethings-count-is.html');

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
   * BEM base for fragment's 'item' element.
   *
   * @returns {BemBase}
   */
  get itemElementBemBase() {
    if (!this._itemElementBemBase) {
      this._itemElementBemBase = this.cloneBemBase().setElt('item');
    }

    return this._itemElementBemBase;
  }

  /**
   * TestCafe selector for fragment's 'item' element.
   *
   * @returns {Selector}
   */
  get itemElementSelector() {
    if (!this._itemElementSelector) {
      this._itemElementSelector = this.selector.find(`.${this.itemElementBemBase}`);
    }

    return this._itemElementSelector;
  }
}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

test("010 It should throw error when fragment doesn't have specified somethings", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, 2);
  }
  catch (e) {
    const msgPattern = /.*expected 3 to deeply equal 2.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should respect `options.isNot` argument", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, 3, { isNot: true });
  }
  catch (e) {
    const msgPattern = /.*expected 3 to not deeply equal 3.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should allow `count` argument to be an array", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, ['gte', 3]);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("040 It should respect `options.isNot` argument when `count` argument is array", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, ['gte', 3], { isNot: true });
  }
  catch (e) {
    const msgPattern = /.*expected 3 to be below 3.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});
