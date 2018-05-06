import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import {Selector} from 'testcafe';

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

const selector = {
  filterByText
};

export default selector;
