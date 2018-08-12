import _ from 'lodash';
import appRootPath from 'app-root-path';
import expect from 'unexpected';
import { t } from 'testcafe';

import Fragment from '../../../src/fragment';
import Options from '../../../src/options';

fixture `Fragment :: 035 #expectIsEqual()`
  .page(appRootPath.path + '/test/fixtures/fragment/035-expect-is-equal.html');

class Foo extends Fragment {
  constructor(spec, opts) {
    const { initializedOpts, initializedSpec, isInstance } = Fragment.initializeFragmentSpecAndOpts(spec, opts);

    if (isInstance === true) {
      return spec;
    }

    super(initializedSpec, initializedOpts);
    return this;
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

class Bar extends Fragment {

  /**
   * Assets that bar fragments using their 'fiz'.
   * 
   * @param {*} that 
   * @throws {AssertionError} When fragments have different 'fiz'.
   */
  async expectIsEqual(that, options) {
    const opts = _
      .chain(new Options(options))
      .set('equalityCheck', false)
      .value();

    // Because `super` is broken for async functions.
    // await super(that, { equalityCheck: false });
    await Fragment.prototype.expectIsEqual.call(this, that, opts);

    const thisFiz = _.chain(await this.getBemModifiers('fiz')).first().nth(1).value();
    const thatFiz = _.chain(await that.getBemModifiers('fiz')).first().nth(1).value();
    await t
      .expect(thisFiz)
      .eql(thatFiz, `'${this.displayName}#expectIsEqual()': fragments must have same 'fiz' but they doesn't (${thisFiz} !== ${thatFiz})`);
  }
}

Object.defineProperties(Bar, {
  bemBase: {
    value: 'bar'
  },
  displayName: {
    value: 'Bar'
  }
});


test("010 It should throw error when `that` is not a fragment", async () => {
  let isThrown = false;

  const foo = new Foo({ cid: '1' });

  await foo.expectIsExist();

  try {
    await foo.expectIsEqual(42);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo#expectIsEqual()': 'that' argument must be a 'Foo' fragment but it's even not a fragment"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when `that` is not a fragment of same type as `this`", async () => {
  let isThrown = false;

  const bar = new Bar({ cid: '1' });
  const foo = new Foo({ cid: '1' });

  await foo.expectIsExist();
  await bar.expectIsExist();

  try {
    await foo.expectIsEqual(bar);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'Foo#expectIsEqual()': 'that' argument must be a 'Foo' fragment but it is a 'Bar' fragment"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when `options` argument is not valid", async () => {
  let isThrown = false;

  const fooCid1 = new Bar({ cid: '1' });
  const fooCid2 = new Bar({ cid: '2' });

  await fooCid1.expectIsExist();
  await fooCid2.expectIsExist();

  try {
    await fooCid1.expectIsEqual(fooCid2, 42);
  }
  catch (e) {
    expect(
      e.message,
      'to match',
      /^'Options.constructor\(\)': 'initializer' argument.*Number.*42.*/
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when `this` fragment not exists", async () => {
  let isThrown = false;

  const fooCid2 = new Foo({ cid: '2' });
  const nonExistentFoo = new Foo({ cid: 'non-existent' });

  await fooCid2.expectIsExist();
  await nonExistentFoo.expectIsNotExist();

  try {
    await nonExistentFoo.expectIsEqual(fooCid2);
  }
  catch (e) {
    expect(
      e.errMsg,
      'to equal',
      "AssertionError: 'Foo#expectIsEqual()': 'this' fragment must exist but it doesn't: expected 0 to deeply equal 1"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should throw error when `that` fragment not exists", async () => {
  let isThrown = false;

  const fooCid2 = new Foo({ cid: '2' });
  const nonExistentFoo = new Foo({ cid: 'non-existent' });

  await fooCid2.expectIsExist();
  await nonExistentFoo.expectIsNotExist();

  try {
    await fooCid2.expectIsEqual(nonExistentFoo);
  }
  catch (e) {
    expect(
      e.errMsg,
      'to equal',
      "AssertionError: 'Foo#expectIsEqual()': fragment passed in as 'that' argument must exist but it doesn't: expected 0 to deeply equal 1"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("060 It should check equality using default implementation", async () => {
  let isThrown = false;

  const fooCid1 = new Foo({ cid: '1' });
  const fooCid2 = new Foo({ cid: '2' });
  const fooCid3 = new Foo({ cid: '3' });

  await fooCid1.expectIsExist();
  await fooCid2.expectIsExist();
  await fooCid3.expectIsExist();

  // Case of success.
  await fooCid1.expectIsEqual(fooCid2);

  // Case of failure.
  try {
    await fooCid1.expectIsEqual(fooCid3);
  }
  catch (e) {
    expect(
      e.errMsg,
      'to equal',
      "AssertionError: 'Foo#expectIsEqual()': fragments text content doesn't match: expected 'Some text' to deeply equal 'foo 3'"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("070 It should allow for custom equality check when `options.equalityCheck` is falsey", async () => {
  let isThrown = false;

  const barCid1 = new Bar({ cid: '1' });
  const barCid2 = new Bar({ cid: '2' });
  const barCid3 = new Bar({ cid: '3' });

  await barCid1.expectIsExist();
  await barCid2.expectIsExist();
  await barCid3.expectIsExist();

  // Case of success.
  await barCid1.expectIsEqual(barCid3);

  // Case of failure.
  try {
    await barCid1.expectIsEqual(barCid2);
  }
  catch (e) {
    expect(
      e.errMsg,
      'to equal',
      "AssertionError: 'Bar#expectIsEqual()': fragments must have same 'fiz' but they doesn't (one !== two): expected 'one' to deeply equal 'two'"
    );
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});
