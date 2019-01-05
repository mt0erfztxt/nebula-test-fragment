import unexpected from 'unexpected';

import Fragment from '../../../../src/fragment';

const expect = unexpected.clone();

fixture('Fragment :: 170 .withPartOfStateMixin()')
  .page(__dirname + '/index.html');

test("010 It should throw error when 'BaseFragment' argument is not a fragment class", async () => {
  class NonFragment {}

  expect(
    () => Fragment.withPartOfStateMixin(NonFragment, 'foo'),
    'to throw',
    new TypeError(
      "'BaseFragmentClass' argument must be a 'Fragment' class or its " +
      "descendant"
    )
  );
});

test("020 It should throw error when part of state name is not a non-blank string", async () => {
  expect(
    () => Fragment.withPartOfStateMixin(Fragment, '  '),
    'to throw',
    new TypeError(
      "Name of state part must be a non-blank string but it is String (  )"
    )
  );
});

test("030 It should throw error when name of attribute/BEM modifier that holds value of part of state is set but it is not a non-blank string", async () => {
  expect(
    () => Fragment.withPartOfStateMixin(Fragment, ['foo', '']),
    'to throw',
    new TypeError(
      "Attribute/BEM modifier name that holds value of part of state must " +
      "be a non-blank string but it is String ()"
    )
  );
});

test("035 It should throw error when 'options.src' argument set to not supported value", async () => {
  expect(
    () => Fragment.withPartOfStateMixin(Fragment, 'foo', { src: 'notSupported' }),
    'to throw',
    (e) => {
      expect(e, 'to be a', TypeError);
      expect(
        e.message,
        'to match',
        /'options.src' argument must be a nil or one of 'attribute' or 'bemModifier' but it is String \(notSupported\)/
      );
    }
  );
});

test("040 It should generate part of state getter - case of 'options.isBoolean' is truthy and 'options.src' is from BEM modifier", async () => {
  /**
   * @type {Fragment}
   */
  const Foo040 = Fragment.withPartOfStateMixin(Fragment, 'disabled', {
    isBoolean: true
  });

  /**
   * @extends {Fragment}
   */
  class Foobar040 extends Foo040 {
    /**
     * Returns value of fragment's 'Disabled' part of state.
     *
     * @name Foobar040#getDisabledPartOfState
     * @method
     * @return {Promise<Boolean>}
     */
  }

  Object.defineProperties(Foobar040, {
    bemBase: {
      value: 'foobar040'
    },
    displayName: {
      value: 'Foobar040'
    }
  });

  const foobar040Cid0 = new Foobar040({ cid: '0' });
  await foobar040Cid0.expectExistsAndConformsRequirements({
    text: 'foobar040 cid0'
  });
  expect(foobar040Cid0.getDisabledPartOfState, 'to be a function');
  expect(await foobar040Cid0.getDisabledPartOfState(), 'to be false');

  const foobar040Cid1 = new Foobar040({ cid: '1' });
  await foobar040Cid1.expectExistsAndConformsRequirements({
    text: 'foobar040 cid1'
  });
  expect(foobar040Cid1.getDisabledPartOfState, 'to be a function');
  expect(await foobar040Cid1.getDisabledPartOfState(), 'to be true');
});

test("050 It should generate part of state getter - case of 'options.isBoolean' is falsey and 'options.src' is from BEM modifier", async () => {
  /**
   * @type {Fragment}
   */
  const Foo050 = Fragment.withPartOfStateMixin(Fragment, 'id', {
    isBoolean: false
  });

  /**
   * @extends {Fragment}
   */
  class Foobar050 extends Foo050 {

    /**
     * Returns value of fragment's 'Id' part of state.
     *
     * @name Foobar050#getIdPartOfState
     * @method
     * @return {Promise<void|String>}
     */
  }

  Object.defineProperties(Foobar050, {
    bemBase: {
      value: 'foobar050'
    },
    displayName: {
      value: 'Foobar050'
    }
  });

  const foobar050Cid0 = new Foobar050({ cid: '0' });
  await foobar050Cid0.expectExistsAndConformsRequirements({
    text: 'foobar050 cid0'
  });
  expect(foobar050Cid0.getIdPartOfState, 'to be a function');
  expect(await foobar050Cid0.getIdPartOfState(), 'to be undefined');

  const foobar050Cid1 = new Foobar050({ cid: '1' });
  await foobar050Cid1.expectExistsAndConformsRequirements({
    text: 'foobar050 cid1'
  });
  expect(foobar050Cid1.getIdPartOfState, 'to be a function');
  expect(await foobar050Cid1.getIdPartOfState(), 'to equal', '42');
});

test("060 It should generate part of state getter - case of 'options.isBoolean' is truthy and 'options.src' is from attribute", async () => {
  /**
   * @type {Fragment}
   */
  const Foo060 = Fragment.withPartOfStateMixin(Fragment, 'disabled', {
    isBoolean: true,
    src: 'attribute'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar060 extends Foo060 {
    /**
     * Returns value of fragment's 'Disabled' part of state.
     *
     * @name Foobar060#getDisabledPartOfState
     * @method
     * @return {Promise<boolean>}
     */
  }

  Object.defineProperties(Foobar060, {
    bemBase: {
      value: 'foobar060'
    },
    displayName: {
      value: 'Foobar060'
    }
  });

  const foobar060Cid0 = new Foobar060({ cid: '0' });
  await foobar060Cid0.expectExistsAndConformsRequirements({
    text: 'foobar060 cid0'
  });
  expect(foobar060Cid0.getDisabledPartOfState, 'to be a function');
  expect(await foobar060Cid0.getDisabledPartOfState(), 'to be false');

  const foobar060Cid1 = new Foobar060({ cid: '1' });
  await foobar060Cid1.expectExistsAndConformsRequirements({
    text: 'foobar060 cid1'
  });
  expect(foobar060Cid1.getDisabledPartOfState, 'to be a function');
  expect(await foobar060Cid1.getDisabledPartOfState(), 'to be true');
});

test("070 It should generate part of state getter - case of 'options.isBoolean' is falsey and 'options.src' is from attribute", async () => {
  /**
   * @type {Fragment}
   */
  const Foo070 = Fragment.withPartOfStateMixin(Fragment, 'title', {
    isBoolean: false,
    src: 'attribute'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar070 extends Foo070 {
    /**
     * Returns value of fragment's 'Title' part of state.
     *
     * @name Foobar070#getTitlePartOfState
     * @method
     * @return {Promise<void|string>}
     */
  }

  Object.defineProperties(Foobar070, {
    bemBase: {
      value: 'foobar070'
    },
    displayName: {
      value: 'Foobar070'
    }
  });

  const foobar070Cid0 = new Foobar070({ cid: '0' });
  await foobar070Cid0.expectExistsAndConformsRequirements({
    text: 'foobar070 cid0'
  });
  expect(foobar070Cid0.getTitlePartOfState, 'to be a function');
  expect(await foobar070Cid0.getTitlePartOfState(), 'to be undefined');

  const foobar070Cid1 = new Foobar070({ cid: '1' });
  await foobar070Cid1.expectExistsAndConformsRequirements({
    text: 'foobar070 cid1'
  });
  expect(foobar070Cid1.getTitlePartOfState, 'to be a function');
  expect(await foobar070Cid1.getTitlePartOfState(), 'to equal', 'foo');
});

test("080 It should generate part of state setter that simply returns part of fragment's current state (because generated methods are read-only)", async () => {
  /**
   * @type {Fragment}
   */
  const Foo080 = Fragment.withPartOfStateMixin(Fragment, 'disabled');

  /**
   * @extends {Fragment}
   */
  class Foobar080 extends Foo080 {
    /**
     * Returns value of fragment's 'Disabled' part of state.
     *
     * @name Foobar080#getDisabledPartOfState
     * @method
     * @return {Promise<void|string>}
     */

    /**
     * Sets value of fragment's 'Disabled' part of state.
     *
     * @name Foobar080#setDisabledPartOfState
     * @method
     * @param {*} value New value for 'Disabled' part of state. Ignored because generated method is read-only
     * @return {Promise<void|string>}
     */
  }

  Object.defineProperties(Foobar080, {
    bemBase: {
      value: 'foobar080'
    },
    displayName: {
      value: 'Foobar080'
    }
  });

  const foobar080Cid0 = new Foobar080({ cid: '0' });
  await foobar080Cid0.expectExistsAndConformsRequirements({
    text: 'foobar080 cid0'
  });
  expect(foobar080Cid0.setDisabledPartOfState, 'to be a function');
  expect(await foobar080Cid0.setDisabledPartOfState(true), 'to be false');
  expect(await foobar080Cid0.getDisabledPartOfState(), 'to be false');

  const foobar080Cid1 = new Foobar080({ cid: '1' });
  await foobar080Cid1.expectExistsAndConformsRequirements({
    text: 'foobar080 cid1'
  });
  expect(foobar080Cid1.setDisabledPartOfState, 'to be a function');
  expect(await foobar080Cid1.setDisabledPartOfState(false), 'to be true');
  expect(await foobar080Cid1.getDisabledPartOfState(), 'to be true');
});

test("090 It should generate assertion method for part of state - case of 'options.isBoolean' is truthy and 'options.src' is from BEM modifier", async () => {
  /**
   * @type {Fragment}
   */
  const Foo090 = Fragment.withPartOfStateMixin(Fragment, 'disabled');

  /**
   * @extends {Fragment}
   */
  class Foobar090 extends Foo090 {
    /**
     * Asserts that fragment's 'Disabled' part of state is equal specified
     * value.
     *
     * @name Foobar090#expectDisabledPartOfStateIs
     * @param {*} value Part of state must match that value to pass assertion
     * @param {Options} [options] Options
     * @param {boolean} [options.isNot=false] When truthy assertion would be inverted
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar090, {
    bemBase: {
      value: 'foobar090'
    },
    displayName: {
      value: 'Foobar090'
    }
  });

  const foobar090Cid0 = new Foobar090({ cid: '0' });
  await foobar090Cid0.expectExistsAndConformsRequirements({
    text: 'foobar090 cid0'
  });
  expect(foobar090Cid0.expectDisabledPartOfStateIs, 'to be a function');
  await foobar090Cid0.expectDisabledPartOfStateIs(false);

  const foobar090Cid1 = new Foobar090({ cid: '1' });
  await foobar090Cid1.expectExistsAndConformsRequirements({
    text: 'foobar090 cid1'
  });
  expect(foobar090Cid1.expectDisabledPartOfStateIs, 'to be a function');
  await foobar090Cid1.expectDisabledPartOfStateIs(true);

  // -- Check that `options.isNot` argument is respected

  let isThrown = false;

  try {
    await foobar090Cid0.expectDisabledPartOfStateIs(false, { isNot: true });
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar090' fragment must have BEM modifier 'disabled,' \(foobar090--disabled\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("100 It should generate assertion method for part of state - case of 'options.isBoolean' is falsey and 'options.src' is from BEM modifier", async () => {
  /**
   * @type {Fragment}
   */
  const Foo100 = Fragment.withPartOfStateMixin(Fragment, 'id', { isBoolean: false });

  /**
   * @extends {Fragment}
   */
  class Foobar100 extends Foo100 {
    /**
     * Asserts that fragment's 'Id' part of state is equal specified value.
     *
     * @name Foobar100#expectIdPartOfStateIs
     * @param {*} value Part of state must match that value to pass assertion
     * @param {Options} [options] Options
     * @param {boolean} [options.isNot=false] When truthy assertion would be inverted
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar100, {
    bemBase: {
      value: 'foobar100'
    },
    displayName: {
      value: 'Foobar100'
    }
  });

  const foobar100Cid0 = new Foobar100({ cid: '0' });
  await foobar100Cid0.expectExistsAndConformsRequirements({
    text: 'foobar100 cid0'
  });
  expect(foobar100Cid0.expectIdPartOfStateIs, 'to be a function');
  await foobar100Cid0.expectIdPartOfStateIs(18);

  // -- Check that `options.isNot` argument is respected - a successful case

  const foobar100Cid1 = new Foobar100({ cid: '1' });
  await foobar100Cid1.expectExistsAndConformsRequirements({
    text: 'foobar100 cid1'
  });
  expect(foobar100Cid1.expectIdPartOfStateIs, 'to be a function');
  await foobar100Cid1.expectIdPartOfStateIs(18, { isNot: true });

  // -- Check that `options.isNot` argument is respected - a failing case

  let isThrown = false;

  try {
    await foobar100Cid1.expectIdPartOfStateIs(42, { isNot: true });
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar100' fragment must not have BEM modifier 'id,42' \(foobar100--id_42\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("110 It should generate assertion method for part of state - case of 'options.isBoolean' is truthy and 'options.src' is from attribute", async () => {
  /**
   * @type {Fragment}
   */
  const Foo110 = Fragment.withPartOfStateMixin(Fragment, 'disabled', { src: 'attribute' });

  /**
   * @extends {Fragment}
   */
  class Foobar110 extends Foo110 {
    /**
     * Asserts that fragment's 'Disabled' part of state is equal specified
     * value.
     *
     * @name Foobar110#expectDisabledPartOfStateIs
     * @param {*} value Part of state must match that value to pass assertion
     * @param {Options} [options] Options
     * @param {boolean} [options.isNot=false] When truthy assertion would be inverted
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar110, {
    bemBase: {
      value: 'foobar110'
    },
    displayName: {
      value: 'Foobar110'
    }
  });

  const foobar110Cid0 = new Foobar110({ cid: '0' });
  await foobar110Cid0.expectExistsAndConformsRequirements({
    text: 'foobar110 cid0'
  });
  expect(foobar110Cid0.expectDisabledPartOfStateIs, 'to be a function');
  await foobar110Cid0.expectDisabledPartOfStateIs(false);

  const foobar110Cid1 = new Foobar110({ cid: '1' });
  await foobar110Cid1.expectExistsAndConformsRequirements({
    text: 'foobar110 cid1'
  });
  expect(foobar110Cid1.expectDisabledPartOfStateIs, 'to be a function');
  await foobar110Cid1.expectDisabledPartOfStateIs(true);

  // -- Check that `options.isNot` argument is respected

  let isThrown = false;

  try {
    await foobar110Cid1.expectDisabledPartOfStateIs(true, { isNot: true });
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar110' fragment's selector to not return DOM element with attribute 'disabled'.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("120 It should generate assertion method for part of state - case of 'options.isBoolean' is falsey and 'options.src' is from attribute", async () => {
  /**
   * @type {Fragment}
   */
  const Foo120 = Fragment.withPartOfStateMixin(Fragment, 'title', {
    isBoolean: false,
    src: 'attribute'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar120 extends Foo120 {
    /**
     * Asserts that fragment's 'Title' part of state is equal specified value.
     *
     * @name Foobar120#expectTitlePartOfStateIs
     * @param {*} value Part of state must match that value to pass assertion
     * @param {Options} [options] Options
     * @param {boolean} [options.isNot=false] When truthy assertion would be inverted
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar120, {
    bemBase: {
      value: 'foobar120'
    },
    displayName: {
      value: 'Foobar120'
    }
  });

  const foobar120Cid0 = new Foobar120({ cid: '0' });
  await foobar120Cid0.expectExistsAndConformsRequirements({
    text: 'foobar120 cid0'
  });
  expect(foobar120Cid0.expectTitlePartOfStateIs, 'to be a function');
  await foobar120Cid0.expectTitlePartOfStateIs('foo');

  // -- Check that `options.isNot` argument is respected - a successful case

  const foobar120Cid1 = new Foobar120({ cid: '1' });
  await foobar120Cid1.expectExistsAndConformsRequirements({
    text: 'foobar120 cid1'
  });
  expect(foobar120Cid1.expectTitlePartOfStateIs, 'to be a function');
  await foobar120Cid1.expectTitlePartOfStateIs('foo', { isNot: true });

  // -- Check that `options.isNot` argument is respected - a failing case

  let isThrown = false;

  try {
    await foobar120Cid1.expectTitlePartOfStateIs('bar', { isNot: true });
  }
  catch (e) {
    const errMsgPattern = /.*Expected 'Foobar120' fragment's selector to not return DOM element with attribute 'title' valued 'bar'.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("130 It should generate convenience assertion methods for part of state - case of 'options.isBoolean' is truthy and 'options.isBooleanHas' is truthy", async () => {
  /**
   * @type {Fragment}
   */
  const Foo130 = Fragment.withPartOfStateMixin(Fragment, 'bar', {
    isBoolean: true,
    isBooleanHas: true,
    src: 'bemModifier'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar130 extends Foo130 {
    /**
     * Asserts that fragment's 'Bar' part of state is `true`.
     *
     * @name Foobar130#expectHasBar
     * @return {Promise<void>}
     */

    /**
     * Asserts that fragment's 'Bar' part of state is `false`.
     *
     * @name Foobar130#expectHasNoBar
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar130, {
    bemBase: {
      value: 'foobar130'
    },
    displayName: {
      value: 'Foobar130'
    }
  });

  const foobar130Cid0 = new Foobar130({ cid: '0' });
  await foobar130Cid0.expectExistsAndConformsRequirements({
    text: 'foobar130 cid0'
  });
  expect(foobar130Cid0.expectHasBar, 'to be a function');
  await foobar130Cid0.expectHasBar();

  const foobar130Cid1 = new Foobar130({ cid: '1' });
  await foobar130Cid1.expectExistsAndConformsRequirements({
    text: 'foobar130 cid1'
  });
  expect(foobar130Cid1.expectHasNoBar, 'to be a function');
  await foobar130Cid1.expectHasNoBar();

  // -- Check failing case

  let isThrown = false;

  try {
    await foobar130Cid1.expectHasBar();
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar130' fragment must have BEM modifier 'bar,' \(foobar130--bar\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("140 It should generate convenience assertion methods for part of state - case of 'options.isBoolean' is truthy and 'options.isBooleanHas' is falsey", async () => {
  /**
   * @type {Fragment}
   */
  const Foo140 = Fragment.withPartOfStateMixin(Fragment, 'disabled', {
    isBoolean: true,
    isBooleanHas: false,
    src: 'attribute'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar140 extends Foo140 {
    /**
     * Asserts that fragment's 'Disabled' part of state is `true`.
     *
     * @name Foobar140#expectIsDisabled
     * @return {Promise<void>}
     */

    /**
     * Asserts that fragment's 'Disabled' part of state is `false`.
     *
     * @name Foobar140#expectIsNotDisabled
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar140, {
    bemBase: {
      value: 'foobar140'
    },
    displayName: {
      value: 'Foobar140'
    }
  });

  const foobar140Cid0 = new Foobar140({ cid: '0' });
  await foobar140Cid0.expectExistsAndConformsRequirements({
    text: 'foobar140 cid0'
  });
  expect(foobar140Cid0.expectIsDisabled, 'to be a function');
  await foobar140Cid0.expectIsDisabled();

  const foobar140Cid1 = new Foobar140({ cid: '1' });
  await foobar140Cid1.expectExistsAndConformsRequirements({
    text: 'foobar140 cid1'
  });
  expect(foobar140Cid1.expectIsNotDisabled, 'to be a function');
  await foobar140Cid1.expectIsNotDisabled();

  // -- Check failing case

  let isThrown = false;

  try {
    await foobar140Cid1.expectIsDisabled();
  }
  catch (e) {
    const errMsgPattern = /.*Expected 'Foobar140' fragment's selector to return DOM element with attribute 'disabled'.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("150 It should generate convenience assertion methods for part of state - case of 'options.isBoolean' is truthy and 'options.antonym' is set", async () => {

  // Check that error is thrown when 'options.antonym' is not a non-blank string.
  expect(
    () => {
      Fragment.withPartOfStateMixin(Fragment, 'disabled', {
        antonym: 42,
        isBoolean: true,
        isBooleanHas: false,
        src: 'bemModifier'
      });
    },
    'to throw',
    new TypeError(
      "'options.antonym' argument must be a non-blank string but it is Number (42)"
    )
  );

  /**
   * @type {Fragment}
   */
  const Foo150 = Fragment.withPartOfStateMixin(Fragment, 'disabled', {
    antonym: 'enabled',
    isBoolean: true,
    isBooleanHas: false,
    src: 'bemModifier'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar150 extends Foo150 {
    /**
     * Asserts that fragment's 'Disabled' part of state is `true`.
     *
     * @name Foobar150#expectIsDisabled
     * @return {Promise<void>}
     */

    /**
     * Asserts that fragment's 'Disabled' part of state is `false`.
     *
     * @name Foobar150#expectIsNotDisabled
     * @return {Promise<void>}
     */

    /**
     * Asserts that fragment's 'Enabled' part of state is `true`.
     *
     * @name Foobar150#expectIsEnabled
     * @return {Promise<void>}
     */

    /**
     * Asserts that fragment's 'Enabled' part of state is `false`.
     *
     * @name Foobar150#expectIsNotEnabled
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar150, {
    bemBase: {
      value: 'foobar150'
    },
    displayName: {
      value: 'Foobar150'
    }
  });

  const foobar150Cid0 = new Foobar150({ cid: '0' });
  await foobar150Cid0.expectExistsAndConformsRequirements({
    text: 'foobar150 cid0'
  });
  expect(foobar150Cid0.expectIsDisabled, 'to be a function');
  expect(foobar150Cid0.expectIsEnabled, 'to be a function');
  await foobar150Cid0.expectIsDisabled();
  await foobar150Cid0.expectIsNotEnabled();

  const foobar150Cid1 = new Foobar150({ cid: '1' });
  await foobar150Cid1.expectExistsAndConformsRequirements({
    text: 'foobar150 cid1'
  });
  expect(foobar150Cid1.expectIsNotDisabled, 'to be a function');
  expect(foobar150Cid1.expectIsNotEnabled, 'to be a function');
  await foobar150Cid1.expectIsNotDisabled();
  await foobar150Cid1.expectIsEnabled();

  // -- Check failing case

  let isThrown = false;

  try {
    await foobar150Cid1.expectIsNotEnabled();
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar150' fragment must have BEM modifier 'disabled,' \(foobar150--disabled\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("160 It should generate convenience assertion methods for part of state - case of 'options.waitTil' is true", async () => {

  // Check that error is thrown when 'options.waitTil' is not a boolean or
  // non-blank string.
  expect(
    () => {
      Fragment.withPartOfStateMixin(Fragment, 'fetching', {
        isBoolean: true,
        waitTil: 42
      });
    },
    'to throw',
    new TypeError(
      "'options.waitTil' argument must be a boolean or a non-blank string " +
      "but it is Number (42)"
    )
  );

  /**
   * @type {Fragment}
   */
  const Foo160 = Fragment.withPartOfStateMixin(Fragment, 'fetching', {
    isBoolean: true,
    waitTil: true
  });

  /**
   * @extends {Fragment}
   */
  class Foobar160 extends Foo160 {
    /**
     * Waits til fragment has 'Fetching' part of state set to `true`.
     *
     * @name Foobar160#waitTilFetching
     * @param {Options} [options] Options
     * @param {Number} [options.wait] Delay in milliseconds before assertion
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar160, {
    bemBase: {
      value: 'foobar160'
    },
    displayName: {
      value: 'Foobar160'
    }
  });

  const foobar160Cid0 = new Foobar160({ cid: '0' });
  await foobar160Cid0.expectExistsAndConformsRequirements({
    text: 'foobar160 cid0'
  });
  expect(foobar160Cid0.waitTilFetching, 'to be a function');
  await foobar160Cid0.waitTilFetching();

  // TODO How to test `options.wait`? `t` in test and `t` imported into
  //      'fragment' module isn't the same and because of that we can't spy on
  //      `t.wait()`.
  // Check that `waitTil...` method supports 'wait' option.
  // await foobar160Cid0.waitTilFetching({wait: 300});
  // expect(t.ctx.waitSpy, 'was called times', 1);
  // expect(t.ctx.waitSpy, 'to have a call satisfying', {args: [300]});

  // -- Check failing case

  const foobar160Cid1 = new Foobar160({ cid: '1' });
  await foobar160Cid1.expectExistsAndConformsRequirements({
    text: 'foobar160 cid1'
  });
  expect(foobar160Cid1.waitTilFetching, 'to be a function');

  let isThrown = false;

  try {
    await foobar160Cid1.waitTilFetching();
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar160' fragment must not have BEM modifier 'fetching,' \(foobar160--fetching\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("170 It should generate convenience assertion methods for part of state - case of 'options.waitTil' is non-blank-string", async () => {

  /**
   * @type {Fragment}
   */
  const Foo170 = Fragment.withPartOfStateMixin(Fragment, 'fetching', {
    isBoolean: true,
    waitTil: 'Loading'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar170 extends Foo170 {
    /**
     * Waits til fragment has 'Fetching' part of state set to `true`.
     *
     * @name Foobar170#waitTilLoading
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar170, {
    bemBase: {
      value: 'foobar170'
    },
    displayName: {
      value: 'Foobar170'
    }
  });

  const foobar170Cid0 = new Foobar170({ cid: '0' });
  await foobar170Cid0.expectExistsAndConformsRequirements({
    text: 'foobar170 cid0'
  });
  expect(foobar170Cid0.waitTilLoading, 'to be a function');
  await foobar170Cid0.waitTilLoading();

  // -- Check failing case

  const foobar170Cid1 = new Foobar170({ cid: '1' });
  await foobar170Cid1.expectExistsAndConformsRequirements({
    text: 'foobar170 cid1'
  });
  expect(foobar170Cid1.waitTilLoading, 'to be a function');

  let isThrown = false;

  try {
    await foobar170Cid1.waitTilLoading();
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar170' fragment must not have BEM modifier 'fetching,' \(foobar170--fetching\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("180 It should generate convenience assertion methods for part of state - case of 'options.waitUntil' is true", async () => {

  // Check that error is thrown when 'options.waitUntil' is not a boolean or
  // non-blank string.
  expect(
    () => {
      Fragment.withPartOfStateMixin(Fragment, 'fetched', {
        isBoolean: true,
        waitUntil: 42
      });
    },
    'to throw',
    new TypeError(
      "'options.waitUntil' argument must be a boolean or a non-blank string " +
      "but it is Number (42)"
    )
  );

  /**
   * @type {Fragment}
   */
  const Foo180 = Fragment.withPartOfStateMixin(Fragment, 'fetched', {
    isBoolean: true,
    waitUntil: true
  });

  /**
   * @extends {Fragment}
   */
  class Foobar180 extends Foo180 {
    /**
     * Waits til fragment has 'Fetched' part of state set to `true`.
     *
     * @name Foobar180#waitUntilFetched
     * @param {Options} [options] Options
     * @param {Number} [options.wait] Delay in milliseconds before assertion
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar180, {
    bemBase: {
      value: 'foobar180'
    },
    displayName: {
      value: 'Foobar180'
    }
  });

  const foobar180Cid0 = new Foobar180({ cid: '0' });
  await foobar180Cid0.expectExistsAndConformsRequirements({
    text: 'foobar180 cid0'
  });
  expect(foobar180Cid0.waitUntilFetched, 'to be a function');
  await foobar180Cid0.waitUntilFetched();

  // TODO How to test `options.wait`? `t` in test and `t` imported into
  //      'fragment' module isn't the same and because of that we can't spy on
  //      `t.wait()`.
  // Check that `waitTil...` method supports 'wait' option.
  // await foobar180Cid0.waitUntilFetching({wait: 300});
  // expect(t.ctx.waitSpy, 'was called times', 1);
  // expect(t.ctx.waitSpy, 'to have a call satisfying', {args: [300]});

  // -- Check failing case

  const foobar180Cid1 = new Foobar180({ cid: '1' });
  await foobar180Cid1.expectExistsAndConformsRequirements({
    text: 'foobar180 cid1'
  });
  expect(foobar180Cid1.waitUntilFetched, 'to be a function');

  let isThrown = false;

  try {
    await foobar180Cid1.waitUntilFetched();
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar180' fragment must have BEM modifier 'fetched,' \(foobar180--fetched\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("190 It should generate convenience assertion methods for part of state - case of 'options.waitUntil' is non-blank-string", async () => {

  /**
   * @type {Fragment}
   */
  const Foo190 = Fragment.withPartOfStateMixin(Fragment, 'fetched', {
    isBoolean: true,
    waitUntil: 'Loaded'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar190 extends Foo190 {
    /**
     * Waits til fragment has 'Fetching' part of state set to `true`.
     *
     * @name Foobar190#waitUntilLoaded
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar190, {
    bemBase: {
      value: 'foobar190'
    },
    displayName: {
      value: 'Foobar190'
    }
  });

  const foobar190Cid0 = new Foobar190({ cid: '0' });
  await foobar190Cid0.expectExistsAndConformsRequirements({
    text: 'foobar190 cid0'
  });
  expect(foobar190Cid0.waitUntilLoaded, 'to be a function');
  await foobar190Cid0.waitUntilLoaded();

  // -- Check failing case

  const foobar190Cid1 = new Foobar190({ cid: '1' });
  await foobar190Cid1.expectExistsAndConformsRequirements({
    text: 'foobar190 cid1'
  });
  expect(foobar190Cid1.waitUntilLoaded, 'to be a function');

  let isThrown = false;

  try {
    await foobar190Cid1.waitUntilLoaded();
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar190' fragment must have BEM modifier 'fetched,' \(foobar190--fetched\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("200 It should generate convenience assertion methods for part of state - case of 'options.isBoolean' is falsey (method for equality)", async () => {

  /**
   * @type {Fragment}
   */
  const Foo200 = Fragment.withPartOfStateMixin(Fragment, 'bar', {
    isBoolean: false,
    src: 'bemModifier'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar200 extends Foo200 {
    /**
     * Asserts that fragment's 'Bar' part of state is equal specified value.
     *
     * @name Foobar200#expectBarIs
     * @param {*} value Part of state must be equal that value to pass assertion
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar200, {
    bemBase: {
      value: 'foobar200'
    },
    displayName: {
      value: 'Foobar200'
    }
  });

  const foobar200Cid0 = new Foobar200({ cid: '0' });
  await foobar200Cid0.expectExistsAndConformsRequirements({
    text: 'foobar200 cid0'
  });
  expect(foobar200Cid0.expectBarIs, 'to be a function');
  await foobar200Cid0.expectBarIs(42);

  // -- Check failing case

  let isThrown = false;

  try {
    await foobar200Cid0.expectBarIs(18);
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar200' fragment must have BEM modifier 'bar,18' \(foobar200--bar_18\) but it doesn't.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("210 It should generate convenience assertion methods for part of state - case of 'options.isBoolean' is falsey (method for not equality)", async () => {

  /**
   * @type {Fragment}
   */
  const Foo210 = Fragment.withPartOfStateMixin(Fragment, 'bar', {
    isBoolean: false,
    src: 'bemModifier'
  });

  /**
   * @extends {Fragment}
   */
  class Foobar210 extends Foo210 {
    /**
     * Asserts that fragment's 'Bar' part of state is not equal specified
     * value.
     *
     * @name Foobar210#expectBarIsNot
     * @param {*} value Part of state must not be equal that value to pass assertion
     * @return {Promise<void>}
     */
  }

  Object.defineProperties(Foobar210, {
    bemBase: {
      value: 'foobar210'
    },
    displayName: {
      value: 'Foobar210'
    }
  });

  const foobar210Cid0 = new Foobar210({ cid: '0' });
  await foobar210Cid0.expectExistsAndConformsRequirements({
    text: 'foobar210 cid0'
  });
  expect(foobar210Cid0.expectBarIsNot, 'to be a function');
  await foobar210Cid0.expectBarIsNot(42);

  // -- Check failing case

  let isThrown = false;

  try {
    await foobar210Cid0.expectBarIsNot(18);
  }
  catch (e) {
    const errMsgPattern = /.*'Foobar210' fragment must not have BEM modifier 'bar,18' \(foobar210--bar_18\) but it does.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});
