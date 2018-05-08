import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import {Selector, t} from 'testcafe';

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
  expectIsExist,
  expectIsNotExist,
  filterByText
};

export default selector;
