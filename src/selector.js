import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import {Selector, t} from 'testcafe';
import typeOf from 'typeof--';

import utils from './utils';

/**
 * Accepts TestCafe selector initializer and creates new selector filtered by
 * `text`. It's a wrapper around TestCafe's `withText` selector that provides
 * filtering by text equality. Needed because currently TestCafe's `withText`
 * always filters by regular expression matching.
 *
 * @param {*} selectorInitializer - Anything that TestCafe accepts as initializer for `Selector`
 * @param {*} text - Text to equal/match. When it's not a string/RegExp it would be stringified beforehand
 * @param {?Options} [options] - Options
 * @param {boolean} [options.isNot=false] - When truthy then filter would be negated. Not implemented yet
 * @returns {object} Returns TestCafe selector.
 */
function filterByText(selectorInitializer, text, options) {
  const opts = utils.initializeOptions(options, {defaults: {isNot: false}});
  const {isNot} = opts;

  if (isNot) {
    throw new Error(
      `'isNot' argument functionality is not implemented yet`
    );
  }

  // XXX TestCafe, currently, always converts `withText` argument to `RegExp`
  // and so we must use workaround to use string equality.
  const textAsRegExp = _.isRegExp(text) ?
    text : new RegExp(`^${escapeStringRegexp('' + text)}$`);

  return Selector(selectorInitializer).withText(textAsRegExp);
}

/**
 * Asserts that TestCafe selector initialized using `selectorInitializer` have
 * specified (CSS) class names. Note that TestCafe's auto wait feature used
 * to test for presence/absence of each (CSS) class name of `classNames`.
 *
 * @param {*} selectorInitializer - Initializer for TestCafe selector. See TestCafe's `Selector` for more info. Note that selector must return exactly one DOM node, otherwise error would be thrown
 * @param {array|string} classNames - (CSS) Class names which selector must have. Examples: 'className', ['className'], [['className']], [['className', false]], [['className', true]], [['className'], ['other-class-name', true]]. In case of array, passing truthy value as second element of `classNames` array item allows to assert that selector doesn't have specified (CSS) class name
 * @param {?Options} [options] - Options
 * @param {boolean} [options.only=false] - When truthy selector must have only (CSS) class names specified in `classNames` argument
 * @throws {TypeError} When arguments aren't valid.
 */
async function expectHasClassNames(selectorInitializer, classNames, options) {
  if (!(utils.isNonBlankString(classNames) || _.isArray(classNames))) {
    throw new TypeError(
      `'classNames' argument must be a non-blank string or array but it is ${typeOf(classNames)} (${classNames})`
    );
  }

  const opts = utils.initializeOptions(options, {defaults: {only: false}});
  const {only} = opts;

  const sel = Selector(selectorInitializer);
  await expectIsExist(sel, {allowMultiple: false});

  // `classNames` argument allowed to be a string but we work with array.
  classNames = _.isArray(classNames) ? classNames : [classNames];

  // ---------------------------------------------------------------------------
  // Handling case when selector must not have CSS classes at all
  // ---------------------------------------------------------------------------

  if (_.isEmpty(classNames)) {
    await t
      .expect(sel.classNames)
      .eql([''], `Selector must not have (CSS) class names but it does`);

    return;
  }

  // ---------------------------------------------------------------------------
  // Handling case when selector must have/haven't specified CSS classes
  // ---------------------------------------------------------------------------

  const classNamesMustPresent = [];

  for (const item of classNames) {
    if (!(utils.isNonBlankString(item) || _.isArray(item))) {
      throw new TypeError(
        `Item of 'classNames' array argument must be a non-blank string or array but it is` +
        ` ${typeOf(item)} (${item})`
      );
    }

    let className = item;
    let isNot = false;

    if (_.isArray(item)) {
      [className, isNot = false] = item;
    }

    if (!utils.isNonBlankString(className)) {
      throw new TypeError(
        `First element of array item of 'classNames' array argument must be a non-blank string but it is` +
        ` ${typeOf(className)} (${className})`
      );
    }

    if (!_.isBoolean(isNot)) {
      throw new TypeError(
        `Second element of array item of 'classNames' array argument must be a nil or boolean but it is` +
        ` ${typeOf(isNot)} (${isNot})`
      );
    }

    if (!isNot) {
      classNamesMustPresent.push(className);
    }

    const assertionName = utils.buildTestCafeAssertionName('ok', {isNot});
    const message =
      `Selector must ${isNot ? 'not have' : 'have'} '${className}' (CSS) class name ` +
      `but it ${isNot ? 'does' : "doesn't"}`;

    await t.expect(sel.hasClass(className))[assertionName](message);
  }

  if (only) {
    const classNamesMustPresentTxt = _.join(classNamesMustPresent, ', ');
    const selClassNames = await sel.classNames;
    const selClassNamesTxt = _.join(selClassNames, ', ');

    await t
      .expect(selClassNames.length)
      .eql(
        classNamesMustPresent.length,
        `Selector must have only '${classNamesMustPresentTxt}' (CSS) class names but it have '${selClassNamesTxt}'`
      );
  }
}

/**
 * Asserts that TestCafe selector created from `selectorInitializer` exists.
 *
 * @param {*} selectorInitializer - Used to create TestCafe selector. See TestCafe's `Selector` docs for more info
 * @param {?Options} [options] - Options
 * @param {boolean} [options.allowMultiple=true] - When falsey then selector must return only one DOM element to pass assertion
 * @param {boolean} [options.isNot=false] - When truthy selector must not exist (return zero DOM elements) to pass assertion
 * @param {string} [options.message] - Custom message for error
 * @return {Promise<void>}
 */
async function expectIsExist(selectorInitializer, options) {
  const sel = Selector(selectorInitializer);
  const opts = utils.initializeOptions(options, {
    defaults: {
      allowMultiple: false,
      isNot: false
    }
  });

  let msg = '';
  const {allowMultiple, isNot, message} = opts;

  // ---------------------------------------------------------------------------
  // Handling case when selector must not exist
  // ---------------------------------------------------------------------------

  if (isNot) {
    if (utils.isNonEmptyString(message)) {
      msg = message;
    }
    else {
      msg = 'Selector must not return DOM elements but it does';
    }

    await t
      .expect(sel.exists)
      .notOk(msg);

    return;
  }

  // ---------------------------------------------------------------------------
  // Handling case when selector must exist
  // ---------------------------------------------------------------------------

  if (allowMultiple) {
    msg = utils.isNonEmptyString(message) ?
      message : "Selector must return one or more DOM elements but it doesn't";

    await t
      .expect(sel.count)
      .gte(1, msg);
  }
  else {
    msg = utils.isNonEmptyString(message) ?
      message : "Selector must return only one DOM element but it doesn't";

    await t
      .expect(sel.count)
      .eql(1, msg);
  }
}

/**
 * Asserts that TestCafe selector created from `selectorInitializer` does not
 * exist. It is just a call of `expectIsExist()` with `options.isNot` forcibly
 * set to `true`.
 *
 * @param {*} selectorInitializer - Used to create TestCafe selector. See TestCafe's `Selector` docs for more info
 * @param {?Options} [options] - Options
 * @param {string} [options.message] - Custom message for error
 * @return {Promise<void>}
 */
async function expectIsNotExist(selectorInitializer, options) {
  const opts = utils.initializeOptions(options);
  opts['isNot'] = true;
  await selector.expectIsExist(selectorInitializer, opts)
}

const selector = {
  expectHasClassNames,
  expectIsExist,
  expectIsNotExist,
  filterByText
};

export default selector;
